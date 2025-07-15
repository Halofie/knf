<?php
require('header.php');
// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the JSON data from the request
$data = json_decode(file_get_contents('php://input'), true);

$customerName = $data['customerName'];
$routeID = $data['routeID'];
$contact = $data['contact'];
$alternativeContact = $data['alternativeContact'];
$address = $data['address'];
$emailID = $data['emailID'];

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO customers (customerName, routeID, contact, alternativeContact, address, emailID) VALUES (?, ?, ?, ?, ?, ?)");
$stmt->bind_param("ssiiss", $customerName, $routeID, $contact, $alternativeContact, $address, $emailID);



// Execute the query
if ($stmt->execute()) {
    $cust_id = $stmt->insert_id;
    // Insert into tray_management
    $trayStmt = $conn->prepare("INSERT INTO tray_management (customerId, trayStatus) VALUES (?, ?)");
    $tray_status = 0;
    $trayStmt->bind_param("ii", $cust_id, $tray_status);
    if ($trayStmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'New record created successfully and tray status initialized']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Customer created, but tray status insert failed: ' . $trayStmt->error]);
    }
    $trayStmt->close();
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $stmt->error]);
}

// Close connections
$stmt->close();
$conn->close();
?>