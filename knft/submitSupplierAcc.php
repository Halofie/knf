<?php
require('header.php');
require_once 'auth_check.php';
header('Content-Type: application/json');
$response = [];

try {
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // Get the JSON data from the request
    $data = json_decode(file_get_contents('php://input'), true);

    $supplierName = $data['supplierName'];
    $plainPassword = $data['password'];
    $emailID = $data['emailID'];
    $category = "F"; 

    // Check if email already exists
    $checkStmt = $conn->prepare("SELECT id FROM accounts WHERE email = ?");
    $checkStmt->bind_param("s", $emailID);
    $checkStmt->execute();
    $checkStmt->store_result();
    if ($checkStmt->num_rows > 0) {
        $response['success'] = false;
        $response['message'] = "An account with this email already exists.";
        $checkStmt->close();
        $conn->close();
        echo json_encode($response);
        exit;
    }
    $checkStmt->close();

    // Hash the password
    $hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);
    if ($hashedPassword === false) {
        throw new Exception("Password hashing failed.");
    }

    // Prepare and bind
    $stmt = $conn->prepare("INSERT INTO accounts (username, password, email, category) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $supplierName, $hashedPassword, $emailID, $category);
    // Execute the query
    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = "New supplier account created successfully";
    } else {
        $response['success'] = false;
        $response['message'] = "Error: " . $stmt->error;
    }
    // Close connections
    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    $response['success'] = false;
    $response['error'] = $e->getMessage();
}

echo json_encode($response);
?>