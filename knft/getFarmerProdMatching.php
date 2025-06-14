<?php
header('Content-Type: application/json');
require('header.php'); // Contains DB credentials $servername, etc.

$response = [
    'status' => 'error',
    'message' => 'An unknown error occurred during allocation.',
    'allocations_made_count' => 0,
    'unallocated_items_details' => [] // [ ['final_order_item_id', 'product_id', 'remaining_qty'] ]
];

// --- Authentication & Authorization ---
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true || ($_SESSION['role'] ?? '') !== 'A') {
    http_response_code(401);
    $response['message'] = 'User not authorized (Admin access required).';
    echo json_encode($response);
    exit;
}

// --- Get Input ---
$input = json_decode(file_get_contents('php://input'), true);
$week_id_to_process = $input['week_id'] ?? null;

if (!$week_id_to_process) {
    http_response_code(400);
    $response['message'] = 'Week ID is required for allocation.';
    echo json_encode($response);
    exit;
}
$week_id_safe = intval($week_id_to_process); // Assuming week_id is an integer
if ($week_id_safe <= 0 && $week_id_to_process !== "0") { // Allow week_id 0 if it's valid
    http_response_code(400);
    $response['message'] = 'Invalid Week ID format.';
    echo json_encode($response);
    exit;
}

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    error_log("allocate_and_notify_farmers.php DB Connection Error: " . $conn->connect_error);
    $response['message'] = 'Database connection error.';
    echo json_encode($response);
    exit;
}

// --- Start Transaction ---
$conn->begin_transaction();

try {
    // 1. Clear PREVIOUS assignments for THIS week_id in farmer_product_assignments
    $stmt_clear = $conn->prepare("DELETE FROM farmer_product_assignments WHERE week_id = ?");
    if (!$stmt_clear) throw new Exception("Prepare failed (clear assignments): " . $conn->error);
    $stmt_clear->bind_param("i", $week_id_safe);
    if (!$stmt_clear->execute()) throw new Exception("Execute failed (clear assignments): " . $stmt_clear->error);
    $stmt_clear->close();
    error_log("Cleared previous farmer_product_assignments for week_id: $week_id_safe");

    // 2. Fetch all customer order items (from final_order) for the week
    $stmt_orders = $conn->prepare(
        "SELECT fo.id AS final_order_item_id, fo.product_id, fo.quantity AS ordered_quantity
         FROM final_order fo
         WHERE fo.week_id = ? AND fo.rec_status = 1 AND fo.quantity > 0 ORDER BY fo.id ASC" // Process in order
    );
    if (!$stmt_orders) throw new Exception("Prepare failed (fetch final_orders): " . $conn->error);
    $stmt_orders->bind_param("i", $week_id_safe);
    if (!$stmt_orders->execute()) throw new Exception("Execute failed (fetch final_orders): " . $stmt_orders->error);
    $result_orders = $stmt_orders->get_result();
    $final_order_items = $result_orders->fetch_all(MYSQLI_ASSOC);
    $stmt_orders->close();
    error_log("Fetched " . count($final_order_items) . " final_order items for allocation (week $week_id_safe).");

    // 3. Load initial farmer inventory for THIS WEEK into a PHP array
    // This `$temp_farmer_stock_this_run` tracks how much a farmer can still provide *during this script run*.
    $temp_farmer_stock_this_run = [];
    $stmt_inv = $conn->prepare(
        "SELECT Farmer_id, product_id, quantity FROM inventory 
         WHERE weekId = ? AND rec_status = 1 AND quantity > 0"
    );
    if (!$stmt_inv) throw new Exception("Prepare failed (fetch inventory): " . $conn->error);
    $stmt_inv->bind_param("i", $week_id_safe);
    $stmt_inv->execute();
    $result_inv = $stmt_inv->get_result();
    while ($row_inv = $result_inv->fetch_assoc()) {
        $temp_farmer_stock_this_run[intval($row_inv['Farmer_id'])][intval($row_inv['product_id'])] = intval($row_inv['quantity']);
    }
    $stmt_inv->close();
    error_log("Initial farmer stock levels for this run (week $week_id_safe): " . print_r($temp_farmer_stock_this_run, true));

    // Prepared statement for inserting into farmer_product_assignments
    $stmt_assign = $conn->prepare(
        "INSERT INTO farmer_product_assignments 
         (final_order_item_id, assigned_farmer_id, product_id, assigned_quantity, week_id)
         VALUES (?, ?, ?, ?, ?)"
    );
    if (!$stmt_assign) throw new Exception("Prepare failed (insert assignment): " . $conn->error);

    $total_assignments_created = 0;

    // 4. Loop through each customer ordered item and try to allocate it
    foreach ($final_order_items as $order_item) {
        $final_order_item_id = intval($order_item['final_order_item_id']);
        $product_id_ordered = intval($order_item['product_id']);
        $quantity_customer_needs = intval($order_item['ordered_quantity']);
        $remaining_qty_for_this_item = $quantity_customer_needs;

        if ($remaining_qty_for_this_item <= 0) continue;

        // Fetch ranked farmers for this product_id
        // Assuming farmer_rank table structure: id (PK), farmer_id (FK), prod_id (FK), rank (INT)
        $stmt_rank = $conn->prepare(
            "SELECT farmer_id FROM farmer_rank 
             WHERE prod_id = ? ORDER BY `rank` ASC"
        );
        if (!$stmt_rank) throw new Exception("Prepare failed (fetch ranks for P_ID $product_id_ordered): " . $conn->error);
        $stmt_rank->bind_param("i", $product_id_ordered);
        $stmt_rank->execute();
        $result_rank = $stmt_rank->get_result();
        
        while ($ranked_farmer = $result_rank->fetch_assoc()) {
            if ($remaining_qty_for_this_item <= 0) break; // This order item fully allocated

            $current_farmer_id = intval($ranked_farmer['farmer_id']);

            // Check this farmer's available stock from our temporary PHP snapshot
            $farmer_current_temp_stock = $temp_farmer_stock_this_run[$current_farmer_id][$product_id_ordered] ?? 0;

            if ($farmer_current_temp_stock > 0) {
                $quantity_farmer_can_supply = min($remaining_qty_for_this_item, $farmer_current_temp_stock);

                $stmt_assign->bind_param("iiiii",
                    $final_order_item_id,
                    $current_farmer_id,
                    $product_id_ordered,
                    $quantity_farmer_can_supply,
                    $week_id_safe
                );
                if (!$stmt_assign->execute()) {
                    throw new Exception("Execute failed (insert assignment for FO_ID: $final_order_item_id, F_ID: $current_farmer_id, P_ID: $product_id_ordered): " . $stmt_assign->error);
                }
                $total_assignments_created++;

                // Decrement stock IN THE PHP ARRAY for this run
                $temp_farmer_stock_this_run[$current_farmer_id][$product_id_ordered] -= $quantity_farmer_can_supply;
                $remaining_qty_for_this_item -= $quantity_farmer_can_supply;
                
                error_log("Assigned $quantity_farmer_can_supply of P_ID $product_id_ordered (FO_ID $final_order_item_id) to Farmer $current_farmer_id. Farmer temp stock left: " . $temp_farmer_stock_this_run[$current_farmer_id][$product_id_ordered]);
            }
        }
        $stmt_rank->close();

        if ($remaining_qty_for_this_item > 0) {
            $response['unallocated_items'][] = [
                'final_order_item_id' => $final_order_item_id,
                'product_id' => $product_id_ordered,
                'unallocated_quantity' => $remaining_qty_for_this_item,
                'reason' => 'Insufficient stock across all ranked farmers or no ranked farmers with stock.'
            ];
            error_log("Could not fully allocate Final Order Item ID: $final_order_item_id (Product: $product_id_ordered). Remaining needed: $remaining_qty_for_this_item");
        }
    }
    $stmt_assign->close();


    // 6. Set the farmer notification flag to '1' (ON)
    // Check if topic exists, if not, insert. Otherwise, update.
    $check_flag_stmt = $conn->prepare("SELECT value FROM update_variables WHERE topic = 'farmerFulfillmentNotify'");
    if (!$check_flag_stmt) throw new Exception("Prepare failed (check flag): " . $conn->error);
    $check_flag_stmt->execute();
    $check_flag_result = $check_flag_stmt->get_result();
    if ($check_flag_result->num_rows > 0) {
        $stmt_update_flag = $conn->prepare("UPDATE update_variables SET value = 1 WHERE topic = 'farmerFulfillmentNotify'");
        if (!$stmt_update_flag) throw new Exception("Prepare failed (update flag): " . $conn->error);
        if (!$stmt_update_flag->execute()) throw new Exception("Execute failed (update flag): " . $stmt_update_flag->error);
        $stmt_update_flag->close();
    } else {
        $stmt_insert_flag = $conn->prepare("INSERT INTO update_variables (topic, value) VALUES ('farmerFulfillmentNotify', 1)");
        if (!$stmt_insert_flag) throw new Exception("Prepare failed (insert flag): " . $conn->error);
        if (!$stmt_insert_flag->execute()) throw new Exception("Execute failed (insert flag): " . $stmt_insert_flag->error);
        $stmt_insert_flag->close();
    }
    $check_flag_stmt->close();
    error_log("Set farmerFulfillmentNotify flag to 1 for week $week_id_safe.");

    // --- Commit Transaction ---
    $conn->commit();
    $response['status'] = 'success';
    $response['message'] = 'Order allocation completed and farmer report visibility enabled. ' . $total_assignments_created . ' fulfillment assignments recorded.';
    if (!empty($response['unallocated_items'])) {
        $response['message'] .= ' Some order items/quantities could not be fully allocated.';
    }
    $response['allocations_made_count'] = $total_assignments_created;

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    error_log("allocate_and_notify_farmers.php Exception: " . $e->getMessage());
    $response['message'] = "Error during allocation: " . $e->getMessage();
    // Ensure status is error if not already set by default
    $response['status'] = 'error';
} finally {
    if (isset($conn) && $conn instanceof mysqli) { // Check if $conn is a valid mysqli object
        $conn->close();
    }
}

echo json_encode($response);
?>