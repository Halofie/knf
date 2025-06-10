<?php
header('Content-Type: application/json');
require('header.php'); // DB credentials

// --- Get Input ---
$input = json_decode(file_get_contents('php://input'), true);
$filter_week_id = $input['week_id'] ?? 'all';

$session_customer_id = intval($input['customer_id']);

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
                of.id AS fulfillment_item_id, -- Using 'fulfillment_item_id' to distinguish if needed, but JS mostly cares about the structure
                p.product,
                p.UoM_id as unit_id,
                p.category_id,
                of.quantity,
                of.rate,
                of.total_cost,
                r.deliveryType,
                r.route
            FROM
                order_fulfillment of -- THE ONLY MAJOR CHANGE IS THIS TABLE NAME
            JOIN
                product p ON of.product_id = p.prod_id
            LEFT JOIN
                routes r ON of.route_id = r.id
            WHERE
                of.customer_id = ? AND fo.rec_status = 1";

    $params = [$session_customer_id];
    $types = "i";

    if ($filter_week_id !== 'all' && !empty($filter_week_id)) {
        $sql .= " AND of.week_id = ?";
        $params[] = intval($filter_week_id); // Assuming week_id is int
        $types .= "i";
    }
    $sql .= " ORDER BY of.date_time DESC, of.id ASC";

    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        throw new Exception("SQL prepare failed: " . $conn->error . " SQL: " . $sql);
    }

    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $result = $stmt->get_result();

    $fulfillment_items = [];
    while ($row = $result->fetch_assoc()) {
        $route_display = $row['routeName'] ?? 'N/A';
        if (!empty($row['delivery_type'])) {
            $route_display .= " (" . $row['delivery_type'] . ")";
        }
        $row['route_display'] = $route_display;

        $row['quantity'] = intval($row['quantity']);
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
}
?>