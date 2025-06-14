<?php
header('Content-Type: application/json');

require('header.php');

$response = [
    'status' => 'error',
    'farmer_details' => null,
    'report_week_id' => null,
    'checklist_items' => [],
    'message' => 'An unknown error occurred.'
];

// --- Authentication & Authorization ---
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true || ($_SESSION['role'] ?? '') !== 'F') {
    http_response_code(401);
    $response['message'] = 'User not authorized (Farmer access required).';
    echo json_encode($response);
    exit;
}
if (!isset($_SESSION['farmer_id'])) {
    http_response_code(403);
    $response['message'] = 'Farmer ID not found in session.';
    echo json_encode($response);
    exit;
}
$session_farmer_id = intval($_SESSION['farmer_id']);
$session_farmer_name = $_SESSION['farmer_name'] ?? 'Farmer'; // Get name from session if stored at login

// --- Get Input ---
$input = json_decode(file_get_contents('php://input'), true);
$filter_week_id = $input['week_id'] ?? null;

if (!$filter_week_id) {
    http_response_code(400);
    $response['message'] = 'Week ID is required for the checklist.';
    echo json_encode($response);
    exit;
}
$week_id_safe = intval($filter_week_id);
if ($week_id_safe <= 0 && $filter_week_id !== "0") { // Allow week_id 0 if valid
    http_response_code(400);
    $response['message'] = 'Invalid Week ID format.';
    echo json_encode($response);
    exit;
}

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    error_log("get_farmer_checklist.php DB Error: " . $conn->connect_error);
    $response['message'] = 'Database connection error.';
    echo json_encode($response);
    exit;
}

try {
    $response['farmer_details'] = ['id' => $session_farmer_id, 'name' => $session_farmer_name];
    $response['report_week_id'] = $week_id_safe; // Echo back the week being reported on

    // Fetch checklist items from farmer_product_assignments
    // Join to get product name, customer name, route name
    $sql = "SELECT
                fpa.product_id,
                p.product AS product_name,
                p.UoM_id AS unit_id, 
                SUM(fpa.assigned_quantity) AS total_quantity_for_product,
                GROUP_CONCAT(DISTINCT
                    CONCAT(
                        c.customerName,
                        ' (Order Line ID: ', fpa.final_order_item_id, 
                        ', Qty: ', fpa.assigned_quantity,
                        ', Route: ', COALESCE(r.route, 'N/A'), ')') -- Assuming routeName column is 'route' in 'routes' table
                    ORDER BY c.customerName
                    SEPARATOR '|||' -- Using a unique separator for later splitting in JS
                ) AS customer_breakdown_details
            FROM
                farmer_product_assignments fpa
            JOIN
                product p ON fpa.product_id = p.prod_id -- Ensure p.prod_id is product PK
            JOIN
                final_order fo ON fpa.final_order_item_id = fo.id -- final_order.id is PK
            JOIN
                customers c ON fo.customer_id = c.customerID -- customers.customerID is PK
            LEFT JOIN
                routes r ON fo.route_id = r.id -- routes.id is PK, routes.route is name
            WHERE
                fpa.assigned_farmer_id = ? AND fpa.week_id = ?
            GROUP BY
                fpa.product_id, p.product, p.UoM_id
            ORDER BY
                p.product ASC";

    $stmt = $conn->prepare($sql);
    if (!$stmt) throw new Exception("SQL Prepare failed: " . $conn->error . " SQL: " . $sql);
    
    $stmt->bind_param("ii", $session_farmer_id, $week_id_safe); // Both are integers
    $stmt->execute();
    $result = $stmt->get_result();

    $checklist_data = [];
    while ($row = $result->fetch_assoc()) {
        // Convert numeric strings to actual numbers if needed by JS, though SUM should be numeric
        $row['total_quantity_for_product'] = intval($row['total_quantity_for_product']);
        $checklist_data[] = $row;
    }
    $stmt->close();

    if (!empty($checklist_data)) {
        $response['status'] = 'success';
        $response['checklist_items'] = $checklist_data;
        $response['message'] = count($checklist_data) . " product(s) found in your checklist for week $week_id_safe.";
    } else {
        $response['status'] = 'success'; // Successful query, but no assignments
        $response['checklist_items'] = [];
        $response['message'] = "No fulfillment tasks found for you for week " . htmlspecialchars($week_id_safe) . ".";
    }

} catch (Exception $e) {
    http_response_code(500);
    error_log("get_farmer_checklist.php Exception: " . $e->getMessage());
    $response['message'] = "Server Error: " . $e->getMessage();
    // $response['status'] already 'error'
} finally {
    $conn->close();
}

echo json_encode($response);
?>