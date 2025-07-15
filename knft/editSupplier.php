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

if (isset($data['oldEmailID'], $data['supplierName'], $data['farmLocation'], $data['contact'], $data['alternativeContact'], $data['farmSize'], $data['newEmailID'])) {
    $oldEmailID = $data['oldEmailID'];
    $supplierName = $data['supplierName'];
    $farmLocation = $data['farmLocation'];
    $contact = $data['contact'];
    $alternativeContact = $data['alternativeContact'];
    $farmSize = $data['farmSize'];
    $newEmailID = $data['newEmailID'];

    // Check if the new email already exists
    $checkQuery = "SELECT * FROM suppliers WHERE emailID = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param("s", $newEmailID);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0 && $oldEmailID !== $newEmailID) {
        echo json_encode(["success" => false, "message" => "Email ID already exists!"]);
        exit;
    }

    // Update supplier data
    $query = "UPDATE suppliers SET supplierName = ?, farmLocation = ?, contact = ?, alternativeContact = ?, farmSize = ?, emailID = ? WHERE emailID = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sssssss", $supplierName, $farmLocation, $contact, $alternativeContact, $farmSize, $newEmailID, $oldEmailID);
    $success1 = $stmt->execute();
    
    $query = "UPDATE accounts SET username = ?, email = ? WHERE email = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sss", $supplierName, $newEmailID, $oldEmailID);
    $success2 = $stmt->execute();

    if ($success1 && $success2) {
        echo json_encode(["success" => true, "message" => "Supplier updated successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Update failed!"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request!"]);
}
$conn->close();
?>
