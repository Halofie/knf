<?php
require('header.php');

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $uoMID = $data['UoMID'] ?? '';

    if (!$uoMID) {
        echo json_encode(['success' => false, 'message' => 'UoMID is required']);
        exit();
    }

    $sql = "DELETE FROM uom WHERE UoMID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $uoMID);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'UoM deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'UoM not found or already deleted']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete UoM']);
    }

    $stmt->close();
    $conn->close();
}
?>
