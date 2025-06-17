<?php
header('Content-Type: application/json');
require('header.php'); // Adjust path if needed

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit();
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);
$id = isset($input['id']) ? intval($input['id']) : 0;

if ($id <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid id"]);
    exit();
}

// Get current trayStatus
$stmt = $conn->prepare("SELECT trayStatus FROM tray_management WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$stmt->bind_result($currentStatus);
if (!$stmt->fetch()) {
    echo json_encode(["success" => false, "message" => "Row not found"]);
    $stmt->close();
    $conn->close();
    exit();
}
$stmt->close();

// Toggle status (assuming 1/0)
$newStatus = $currentStatus == 1 ? 0 : 1;

// Update trayStatus
$update = $conn->prepare("UPDATE tray_management SET trayStatus = ? WHERE id = ?");
$update->bind_param("ii", $newStatus, $id);

if ($update->execute()) {
    echo json_encode(["success" => true, "newStatus" => $newStatus]);
} else {
    echo json_encode(["success" => false, "message" => "Update failed"]);
}
$update->close();
$conn->close();