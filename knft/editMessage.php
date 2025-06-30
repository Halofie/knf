<?php
// filepath: c:\wamp64\www\knf\consumer\editMessage.php

header('Content-Type: application/json');
require('header.php'); // Adjust path if needed

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'DB connection failed']);
    exit();
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);
$newTopic = isset($input['topic']) ? trim($input['topic']) : '';

if ($newTopic === '') {
    echo json_encode(['success' => false, 'message' => 'Topic is required']);
    $conn->close();
    exit();
}

// Update topic in update_variables where id = 3
$stmt = $conn->prepare("UPDATE update_variables SET topic = ? WHERE id = 3");
$stmt->bind_param("s", $newTopic);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Topic updated successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Update failed']);
}

$stmt->close();
$conn->close();