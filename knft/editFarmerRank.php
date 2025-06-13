<?php
header('Content-Type: application/json');
require('header.php'); // Adjust path if needed

// Connect to DB
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit();
}

// Get POST data
$input = json_decode(file_get_contents('php://input'), true);
$id =  intval($input['id']);
$new_rank =  intval($input['rank']);

if ($id <= 0 || $new_rank < 0) {
    echo json_encode(["success" => false, "message" => "Invalid id or rank"]);
    exit();
}

// Update rank in farmer_rank table
$stmt = $conn->prepare("UPDATE farmer_rank SET `rank` = ? WHERE id = ?");
$stmt->bind_param("ii", $new_rank, $id);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Rank updated"]);
} else {
    echo json_encode(["success" => false, "message" => "Update failed"]);
}
$stmt->close();
$conn->close();