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
$stmt->bind_param("ssi", $route, $deliveryType, $rate);

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