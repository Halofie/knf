<?php
// filepath: c:\wamp64\www\knf\knft\getRouteInfo.php
header('Content-Type: application/json');
require('header.php');

$input = json_decode(file_get_contents('php://input'), true);
$routeId = isset($input['route_id']) ? intval($input['route_id']) : 0;

if ($routeId <= 0) {
    echo json_encode(['success' => false, 'message' => 'Invalid route ID']);
    exit;
}

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed']);
    exit;
}

$stmt = $conn->prepare("SELECT route, deliveryType, rate FROM routes WHERE id = ?");
$stmt->bind_param("i", $routeId);
$stmt->execute();
$result = $stmt->get_result();
$routeInfo = $result->fetch_assoc();

if ($routeInfo) {
    echo json_encode(['success' => true, 'data' => $routeInfo]);
} else {
    echo json_encode(['success' => false, 'message' => 'Route not found']);
}

$stmt->close();