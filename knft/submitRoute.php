<?php
require('header.php');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the JSON data from the request
$data = json_decode(file_get_contents("php://input"), true);

$route = $data['route'];
$deliveryType = $data['deliveryType'];
$rate = $data['rate'];

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO routes (route, deliveryType, rate) VALUES (?, ?, ?)");
$stmt->bind_param("ssd", $route, $deliveryType, $rate);

// Execute the statement
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'New record created successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $stmt->error]);
}

// Close the connection
$stmt->close();
$conn->close();
?>