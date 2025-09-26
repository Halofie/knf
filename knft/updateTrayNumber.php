<?php
header('Content-Type: application/json');
require('header.php');
require_once 'auth_check.php';

$data = json_decode(file_get_contents('php://input'), true);
$id = isset($data['id']) ? intval($data['id']) : 0;
$trayNumber = isset($data['trayNumber']) ? $data['trayNumber'] : '';

if (!$id) {
    echo json_encode(["success" => false, "message" => "Invalid ID"]);
    exit();
}

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed"]);
    exit();
}

$sql = "UPDATE tray_management SET tray_number = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $trayNumber, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Tray number updated successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Error updating tray number"]);
}

$stmt->close();
$conn->close();