<?php
header('Content-Type: application/json');
require('header.php');

$session_farmer_id = $_SESSION['farmer_id'];
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    error_log("DB Connection Error: " . $conn->connect_error);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'] ?? null;

    if (!$id) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ID is required']);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM inventory WHERE id = ? AND farmer_id = ? LIMIT 1");
    $stmt->bind_param("ii", $id, $session_farmer_id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Item deleted']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Deletion failed']);
    }

    $stmt->close();
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method']);
}

$conn->close();
?>