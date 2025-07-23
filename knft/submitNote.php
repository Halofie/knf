<?php
header('Content-Type: application/json');
require('header.php');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Connection failed: ' . $conn->connect_error]);
    exit();
}

// Get JSON input
$data = json_decode(file_get_contents('php://input'), true);

if (isset($data['cust_id'], $data['note'], $data['weekId'])) {
    $cust_id = intval($data['cust_id']);
    $note = $data['note'];
    $weekId = intval($data['weekId']);

    $stmt = $conn->prepare("INSERT INTO notes (cust_id, note, weekId) VALUES (?, ?, ?)");
    $stmt->bind_param("isi", $cust_id, $note, $weekId);

    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Record inserted successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Insert failed: ' . $stmt->error]);
    }
    $stmt->close();
} else {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
}

$conn->close();
?>