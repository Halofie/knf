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
$contact = $data['contact'];
$emailID = $data['emailID'];
$category = "F"; 

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO accounts (username, password, email, category) VALUES ( ?, ?, ?, ?)");
$stmt->bind_param("ssss", $supplierName, $contact, $emailID, $category);
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