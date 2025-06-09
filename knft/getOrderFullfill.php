<?php
header('Content-Type: application/json');
require('header.php'); // Adjust path if needed

// Connect to DB
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit();
}

// Get week_id from POST JSON
$input = json_decode(file_get_contents('php://input'), true);
$week_id = isset($input['week_id']) ? intval($input['week_id']) : 0;
if ($week_id === 0) {
    echo json_encode(["success" => false, "message" => "Invalid week_id"]);
    exit();
}

// Query with JOINs
$sql = "
    SELECT 
        o.id,
        o.rec_date_time,
        c.customerName,
        p.product,
        o.quantity,
        o.rate,
        o.total_cost,
        o.route_id
    FROM order_fulfillment o
    JOIN customers c ON o.customer_id = c.customerID
    JOIN product p ON o.product_id = p.prod_id
    WHERE o.week_id = ?
    ORDER BY o.rec_date_time DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $week_id);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode([
    "success" => true,
    "orders" => $data
]);

$stmt->close();
$conn->close();