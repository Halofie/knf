<?php
require('header.php');
require_once 'auth_check.php';

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['weekID'])) {
    $weekID = $data['weekID'];

    $stmt = $conn->prepare("DELETE FROM week WHERE weekID = ?");
    $stmt->bind_param("i", $weekID);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Week deleted successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Delete failed!"]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request!"]);
}

$conn->close();
?>