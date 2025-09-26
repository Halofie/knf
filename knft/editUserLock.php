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
    $newStatus = $currentStatus === 1 ? 0 : 1;

    $update = $conn->prepare(
        "UPDATE update_variables SET value = ? WHERE topic = 'userLock'"
    );
    $update->bind_param("i", $newStatus);

    if ($update->execute()) {
        echo json_encode([
            "success" => true,
            "newStatus" => $newStatus
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to update value."
        ]);
    }
    $update->close();
} else {
    echo json_encode([
        "success" => false,
        "message" => "Could not fetch current value."
    ]);
}

$conn->close();