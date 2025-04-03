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

$supplierName = $data['supplierName'];
$farmLocation = $data['farmLocation'];
$contact = $data['contact'];
$alternativeContact = $data['alternativeContact'];
$farmSize = $data['farmSize'];
$emailID = $data['emailID'];

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO suppliers (supplierName, farmLocation, contact, alternativeContact, farmSize, emailID) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssiiis", $supplierName, $farmLocation, $contact, $alternativeContact, $farmSize, $emailID);

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