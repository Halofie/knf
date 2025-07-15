<?php
header('Content-Type: application/json');
require('header.php'); // DB credentials

$input = json_decode(file_get_contents('php://input'), true);

//error_log("Raw input: " . file_get_contents('php://input'));
//error_log("Decoded input: " . print_r($input, true));
$filter_week_id = $input['week_id'] ?? 'all';
$session_customer_id = isset($input['customer_id']) ? intval($input['customer_id']) : 0;

if ($session_customer_id <= 0) {
    echo json_encode(["error" => "Invalid customer_id."]);
    exit;
}

try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    // --- Fetch Fulfillment Line Items ---
    $sql = "SELECT
                ofl.id AS fulfillment_item_id,
                p.product,
                p.UoM_id as unit_id,
                p.category_id,
                fo.quantity AS ordered_quantity,
                ofl.quantity AS fullfill_quantity,
                ofl.rate,
                ofl.total_cost,
                ofl.route_id,
                r.deliveryType,
                r.route,
                ofl.date_time
            FROM
                order_fulfillment ofl
            JOIN
                product p ON ofl.product_id = p.prod_id
            LEFT JOIN
                routes r ON ofl.route_id = r.id
            LEFT JOIN
                final_order fo ON ofl.id = fo.id
            WHERE
                ofl.customer_id = ? AND ofl.rec_status = 1";

    $params = [ $session_customer_id ];
    $types = "i";

    if ($filter_week_id !== 'all' && !empty($filter_week_id)) {
        $sql .= " AND ofl.week_id = ?";
        $params[] = intval($filter_week_id);
        $types .= "i";
    }
    $sql .= " ORDER BY ofl.date_time DESC, ofl.id ASC";

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        throw new Exception("SQL prepare failed: " . $conn->error . " SQL: " . $sql);
    }

    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $fulfillment_items = [];
    while ($row = $result->fetch_assoc()) {
        $route_display = $row['route'] ?? 'N/A';
        if (!empty($row['deliveryType'])) {
            $route_display .= " (" . $row['deliveryType'] . ")";
        }
        $row['route_display'] = $route_display;

        $row['ordered_quantity'] = intval($row['ordered_quantity']);
        $row['fullfill_quantity'] = intval($row['fullfill_quantity']);
        $row['rate'] = floatval($row['rate']);
        $row['total_cost'] = floatval($row['total_cost']);

        $fulfillment_items[] = $row;
    }

    // Send JSON response
    if (empty($fulfillment_items) && $result->num_rows === 0) {
        // Check if query ran successfully but returned no rows for this filter
        if ($stmt->error) {
            echo json_encode(["error" => "Query execution error: " . $stmt->error, "items" => []]);
        } else {
            echo json_encode(["message" => "No order fulfillment found for the selected criteria.", "items" => []]);
        }
    } else {
        echo json_encode($fulfillment_items); // Directly send the array of items
    }
    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    error_log("getCustomerFulfillment.php Exception: " . $e->getMessage());
    echo json_encode(["error" => $e->getMessage()]);
}
?>