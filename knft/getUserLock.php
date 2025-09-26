<?php
require('header.php');
require_once 'auth_check.php';

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode([
        "success" => false,
        "message" => "Connection failed: " . $conn->connect_error
    ]));
}

$sql = "SELECT value FROM update_variables WHERE topic = 'userLock'";
$result = $conn->query($sql);

if ($result && $row = $result->fetch_assoc()) {
    $currentStatus = (int)$row['value'];
    echo json_encode([
        "success" => true,
        "Status" => $currentStatus
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Could not fetch current value."
    ]);
}

$conn->close();