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

$categoryType = $data['categoryType'];
$categoryDesc = $data['categoryDesc'];

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO category (categoryType, categoryDesc) VALUES (?, ?)");
$stmt->bind_param("ss", $categoryType, $categoryDesc);

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
