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

$weekdate = $data['weekdate'];

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO week (weekdate) VALUES (?)");
$stmt->bind_param("s", $weekdate); // 's' for string


// Execute the query
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'New record created successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $stmt->error]);
}

// Close connections
$stmt->close();
$conn->close();
?>
