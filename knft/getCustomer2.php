<?php
require('header.php');
header('Content-Type: application/json');
$response = array();
$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'];

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

// SQL query to fetch customer2
$sql = "
    SELECT c.*, r.route AS routeName 
    FROM customers c
    INNER JOIN routes r ON c.routeID = r.id
    WHERE c.emailId = ?
";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // Output data of each row
    $details = $result->fetch_assoc();
    echo json_encode(['status' => 'success', 'details' => $details]);
} else {
    echo json_encode(['status' => 'not_found', 'message' => 'No customer found with this email.', 'details' => null]);
}
// Close connection
$stmt->close();
$conn->close();
?>
