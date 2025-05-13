<?php
require('header.php');
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
    // $contact = $data['contact'];
    $emailID = $data['emailID'];
    $category = "F"; 

    // Hash the password
    $hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);
    if ($hashedPassword === false) {
        throw new Exception("Password hashing failed.");
    }

    // Prepare and bind
    $stmt = $conn->prepare("INSERT INTO accounts (username, password, email, category) VALUES ( ?, ?, ?, ?)");
    $stmt->bind_param("ssss", $supplierName, $hashedPassword, $emailID, $category);
    // Execute the query
    if ($stmt->execute()) {
        echo "New supplier account created successfully";
    } else {
        echo "Error: " . $stmt->error;
    }
    // Close connections
    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

header('Content-Type: application/json');
echo json_encode($response);
?>