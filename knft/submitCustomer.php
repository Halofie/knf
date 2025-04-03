<?php
require('header.php');
// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the JSON data from the request
$data = json_decode(file_get_contents('php://input'), true);

$customerName = $data['customerName'];
$routeID = $data['routeID'];
$contact = $data['contact'];
$alternativeContact = $data['alternativeContact'];
$address = $data['address'];
$emailID = $data['emailID'];

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO customers (customerName, routeID, contact, alternativeContact, address, emailID) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssiiss", $customerName, $routeID, $contact, $alternativeContact, $address, $emailID);

// Execute the query
if ($stmt->execute()) {
    echo "New record created successfully";
} else {
    echo "Error: " . $stmt->error;
}

// Close connections
$stmt->close();
$conn->close();
?>