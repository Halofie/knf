<?php
require('header.php');


// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['oldEmailID'], $data['customerName'], $data['routeID'], $data['contact'], $data['alternativeContact'], $data['address'], $data['newEmailID'])) {
    $oldEmailID = $data['oldEmailID'];
    $customerName = $data['customerName'];
    $routeID = $data['routeID'];
    $contact = $data['contact'];
    $alternativeContact = $data['alternativeContact'];
    $address = $data['address'];
    $newEmailID = $data['newEmailID'];

    // Check if the new email already exists
    $checkQuery = "SELECT * FROM customers WHERE emailID = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param("s", $newEmailID);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0 && $oldEmailID !== $newEmailID) {
        echo json_encode(["success" => false, "message" => "Email ID already exists!"]);
        exit;
    }

    // Update customer data
    $query = "UPDATE customers SET customerName = ?, routeID = ?, contact = ?, alternativeContact = ?, address = ?, emailID = ? WHERE emailID = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("siiisss", $customerName, $routeID, $contact, $alternativeContact, $address, $newEmailID, $oldEmailID);
    $success1 = $stmt->execute();

    // Update accounts data
    $query = "UPDATE accounts SET username = ?, email = ? WHERE email = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sss", $customerName, $newEmailID, $oldEmailID);
    $success2 = $stmt->execute();

    if ($success1 && $success2) {
        echo json_encode(["success" => true, "message" => "Customer updated successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Update failed!"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request!"]);
}
$conn->close();

?>
