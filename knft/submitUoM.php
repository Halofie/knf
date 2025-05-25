<?php
require('header.php');
header('Content-Type: application/json');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']);
    exit;
}

// Get the JSON data from the request
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['UoMID']) || !isset($data['UoM']) || trim($data['UoMID']) === '' || trim($data['UoM']) === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'UoM ID and Name are required.']);
    exit;
}

$uomID = $data['UoMID'];
$UoM = $data['UoM'];

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO uom (UoMID, UoM) VALUES (?, ?)");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Prepare failed: ' . $conn->error]);
    $conn->close();
    exit;
}
$stmt->bind_param("ss", $uomID, $UoM);

// Execute the query
if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'New record created successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $stmt->error]);
}
$stmt->close();
$conn->close();
?>