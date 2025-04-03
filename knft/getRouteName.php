<?php

require('header.php');
header('Content-Type: application/json');
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(['error' => 'Database connection failed: ' . $conn->connect_error]));
}

// Get the routeID from the POST request
$data = json_decode(file_get_contents('php://input'), true);
$routeID = $data['routeID'];

// Fetch the route name based on the routeID
$sql = "SELECT routeName FROM routes WHERE routeID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $routeID);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode(['routeName' => $row['routeName']]);
} else {
    echo json_encode(['error' => 'Route not found']);
}

$stmt->close();
$conn->close();
?>