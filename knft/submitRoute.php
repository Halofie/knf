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

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO routes (route, deliveryType) VALUES (?, ?)");
$stmt->bind_param("ss", $route, $deliveryType);

// Execute the statement
if ($stmt->execute()) {
    echo "New record created successfully";
} else {
    echo "Error: " . $stmt->error;
}

// Close the connection
$stmt->close();
$conn->close();
?>