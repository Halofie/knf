<?php
require('header.php');
require_once 'auth_check.php';

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode([
        "success" => false,
        "message" => "Connection failed: " . $conn->connect_error
    ]));
}

header("Content-Type: application/json");

// Read JSON payload
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['id'])) {
    $productsID = (int)$data['id'];

    // 1) Fetch current rec_status
    $sql = "SELECT rec_status FROM routes WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $productsID);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // 2) Toggle it
        $current = (int)$row['rec_status'];
        $newStatus = $current === 1 ? 0 : 1;

        // 3) Update
        $update = $conn->prepare(
            "UPDATE routes SET rec_status = ? WHERE id = ?"
        );
        $update->bind_param("ii", $newStatus, $productsID);
        if ($update->execute()) {
            echo json_encode([
                "success" => true,
                "productsID" => $productsID,
                "newStatus" => $newStatus
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Update failed: " . $update->error
            ]);
        }
    } else {
        // No such products
        echo json_encode([
            "success" => false,
            "message" => "products not found"
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Missing 'id' in request"
    ]);
}

$conn->close();
