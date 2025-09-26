<?php
require('header.php');
require_once 'auth_check.php';


// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}


header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['weekID'], $data['weekdate'])) {
    $weekID = $data['weekID'];
    $weekdate = $data['weekdate'];

    // Update week data
    $query = "UPDATE week SET weekdate = ? WHERE weekID = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("si", $weekdate, $weekID);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Week updated successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Update failed!"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request!"]);
}

$conn->close();
?>
