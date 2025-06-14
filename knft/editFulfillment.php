<?php
header('Content-Type: application/json');
require('header.php'); // Adjust path if needed

// Connect to DB
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit();
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);
$id = isset($input['id']) ? intval($input['id']) : 0;
$quantity = isset($input['quantity']) ? intval($input['quantity']) : 0;

if ($id <= 0 || $quantity < 0) {
    echo json_encode(["success" => false, "message" => "Invalid id or quantity"]);
    exit();
}

// Get current rate for this order
$stmt = $conn->prepare("SELECT rate FROM order_fulfillment WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$stmt->bind_result($rate);
if (!$stmt->fetch()) {
    echo json_encode(["success" => false, "message" => "Order not found"]);
    $stmt->close();
    $conn->close();
    exit();
}
$stmt->close();

// Calculate new total
$total = $quantity * $rate;

// Update quantity and total_cost
$update = $conn->prepare("UPDATE order_fulfillment SET quantity = ?, total_cost = ? WHERE id = ?");
$update->bind_param("ddi", $quantity, $total, $id);

if ($update->execute()) {
    echo json_encode(["success" => true, "message" => "Order updated"]);
} else {
    echo json_encode(["success" => false, "message" => "Update failed"]);
}
$update->close();
$conn->close();