<?php
header('Content-Type: application/json');
require('header.php'); // Or your actual db_connection.php

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(["error" => "Connection failed: " . $conn->connect_error]);
    exit;
}

// Read the POST request body (expecting JSON)
$input_data = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($input_data['customer_id']) || !isset($input_data['week_id'])) {
    echo json_encode(["error" => "Invalid parameters: customer_id and week_id are required."]);
    exit;
}

$customer_id = intval($input_data['customer_id']);
$week_id_filter = $input_data['week_id']; // Keep as string to check for 'all'

if ($customer_id <= 0) {
    echo json_encode(["error" => "Invalid customer_id."]);
    exit;
}

// Base SQL query
$sql = "SELECT
            fo.id as final_order_item_id,
            p.product,
            p.category_id,
            fo.rate,
            fo.quantity,
            p.UoM_id as unit_id,
            r.route,
            r.deliveryType, -- Assuming 'delivery_type' column exists in your 'routes' table
            fo.total_cost
        FROM final_order fo
        JOIN product p ON fo.product_id = p.prod_id
        LEFT JOIN routes r ON fo.route_id = r.id
        WHERE fo.customer_id = ? AND fo.rec_status = 1"; // Always filter by customer and status

$params = [$customer_id];
$types = "i";

// Handle week_id filter
if ($week_id_filter !== 'all' && !empty($week_id_filter)) {
    $sql .= " AND fo.week_id = ?";
    $params[] = $week_id_filter; // Add week_id to params
    $types .= "s"; // Assuming week_id can be a string or int. If always int, use 'i'.
}
// If $week_id_filter is 'all', no additional week filtering is applied.

$sql .= " ORDER BY fo.date_time DESC, fo.id DESC"; // Order by most recent transaction first

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(["error" => "SQL prepare failed: " . $conn->error]);
    exit;
}

// Dynamically bind parameters
// For PHP < 8.1, you might need to use call_user_func_array if types/params are dynamic and many
if (!empty($params)) {
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$purchase_items = [];
while ($row = $result->fetch_assoc()) {
    // Format route and delivery type
    $route_display = $row['routeName'] ?? 'N/A';
    if (!empty($row['delivery_type'])) {
        $route_display .= " (" . $row['delivery_type'] . ")";
    }
    $row['route_display'] = $route_display;

    // Ensure numeric values are correctly typed for JSON
    $row['rate'] = floatval($row['rate']);
    $row['quantity'] = floatval($row['quantity']);
    $row['total_cost'] = floatval($row['total_cost']);
    
    $purchase_items[] = $row;
}

// Send JSON response
if (empty($purchase_items) && $result->num_rows === 0) {
     // Check if query ran successfully but returned no rows for this filter
    if ($stmt->error) {
        echo json_encode(["error" => "Query execution error: " . $stmt->error, "items" => []]);
    } else {
        echo json_encode(["message" => "No purchase history found for the selected criteria.", "items" => []]);
    }
} else {
    echo json_encode($purchase_items); // Directly send the array of items
}

// Close connection
$stmt->close();
$conn->close();
?>