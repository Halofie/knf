<?php
require('header.php'); // Ensure this file contains DB credentials and session handling

header('Content-Type: application/json'); // Ensure JSON response

$conn = new mysqli($servername, $username, $password, $dbname);

// Check database connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Database connection failed: " . $conn->connect_error]));
}

// Read the POST request body
$data = json_decode(file_get_contents("php://input"), true);

// Validate input
if (!isset($data['customer_id']) || !isset($data['week_id'])) {
    echo json_encode(["error" => "Invalid parameters"]);
    exit;
}

$customer_id = intval($data['customer_id']);
$week_id = intval($data['week_id']);

// Prepare query
$sql = "SELECT * FROM final_order WHERE customer_id = ? AND week_id = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(['error' => 'Database query preparation failed: ' . $conn->error]);
    exit;
}

$stmt->bind_param('ii', $customer_id, $week_id);
$stmt->execute();
$result = $stmt->get_result();

$orders = [];
while ($row = $result->fetch_assoc()) {
    $orders[] = $row;
}

// Close resources
$stmt->close();
$conn->close();

// Return JSON response
echo json_encode($orders);
?>
