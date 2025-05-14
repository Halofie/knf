<?php
require('header.php');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['emailID'])) {
    $emailID = $data['emailID'];

    // Optionally, also delete from login/account table if needed
    // $conn->query("DELETE FROM customer_accounts WHERE emailID = '$emailID'");

    $stmt = $conn->prepare("DELETE FROM customers WHERE emailID = ?");
    $stmt->bind_param("s", $emailID);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Customer deleted successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Delete failed!"]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request!"]);
}

$conn->close();
?>