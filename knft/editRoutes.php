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

if (isset($data['oldRoute'], $data['newRoute'], $data['newDeliveryType'], $data['newRate'])) {
    $oldRoute = $data['oldRoute'];
    $newRoute = $data['newRoute'];
    $newDeliveryType = $data['newDeliveryType'];
    $newRate = $data['newRate'];

    // Check if the new route already exists
    $checkQuery = "SELECT * FROM routes WHERE route = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param("s", $newRoute);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0 && $oldRoute !== $newRoute) {
        echo json_encode(["success" => false, "message" => "Route already exists!"]);
        exit;
    }

    // Update query (now includes rate)
    $query = "UPDATE routes SET route = ?, deliveryType = ?, rate = ? WHERE route = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ssds", $newRoute, $newDeliveryType, $newRate, $oldRoute);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Route updated successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Update failed!"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request!"]);
}

$conn->close();
?>