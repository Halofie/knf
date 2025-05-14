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

if (isset($data['prod_id'])) {
    $prod_id = $data['prod_id'];

    $stmt = $conn->prepare("DELETE FROM product WHERE prod_id = ?");
    $stmt->bind_param("i", $prod_id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Product deleted successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Delete failed!"]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request!"]);
}

$conn->close();
?>