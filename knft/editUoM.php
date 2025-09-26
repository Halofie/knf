<?php
require('header.php');
require_once 'auth_check.php';
header('Content-Type: application/json');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $oldUoMID = $data['oldUoMID'];
    $newUoMID = $data['newUoMID'];
    $uomName = $data['UoM'];

    // Check if new UoMID already exists
    $checkSql = "SELECT * FROM uom WHERE UoMID = ?";
    $stmtCheck = $conn->prepare($checkSql);
    $stmtCheck->bind_param("s", $newUoMID);
    $stmtCheck->execute();
    $result = $stmtCheck->get_result();
    
    if ($result->num_rows > 0 && $oldUoMID !== $newUoMID) {
        echo json_encode(['message' => 'Error: New UoMID already exists!']);
        exit();
    }
    
    // Update query
    $sql = "UPDATE uom SET UoMID = ?, UoM = ? WHERE UoMID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('sss', $newUoMID, $uomName, $oldUoMID);

    if ($stmt->execute()) {
        echo json_encode(['message' => 'UoM updated successfully']);
    } else {
        echo json_encode(['message' => 'Failed to update UoM']);
    }

    $stmt->close();
    $conn->close();
}
?>
