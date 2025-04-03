<?php
require('header.php');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Read the POST request body
$data = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($data['farmer_id']) || !isset($data['weekid'])) {
    echo json_encode(["error" => "Invalid parameters"]);
    exit;
}

$farmer_id = intval($data['farmer_id']);
$weekid = intval($data['weekid']);

// Query the database
$sql = "SELECT product_name, category_id, price, quantity, unit_id, datetime 
        FROM inventory 
        WHERE farmer_id = ? AND weekid = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $farmer_id, $weekid);
$stmt->execute();
$result = $stmt->get_result();

$products = [];
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

echo json_encode($products);

// Close connection
$stmt->close();
$conn->close();
?>
