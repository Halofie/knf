<?php
header('Content-Type: application/json');
require('../knft/header.php'); // Adjust path as needed

// Connect to DB
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit();
}

// Get weekId from POST request
$data = json_decode(file_get_contents('php://input'), true);
$weekId = isset($data['weekId']) ? intval($data['weekId']) : 0;

// Validate weekId
if ($weekId <= 0) {
    echo json_encode(["success" => false, "message" => "Invalid week ID"]);
    exit();
}

// Prepared statement to prevent SQL injection
$sql = "
    SELECT 
        t.id,
        t.customerId,
        c.customerName,
        b.route AS route,
        t.trayStatus,
        t.weekId,
        t.tray_number
    FROM tray_management t
    LEFT JOIN customers c ON t.customerId = c.customerID
    LEFT JOIN routes b ON b.id = c.routeID
    WHERE t.weekId = ?
    ORDER BY t.id ASC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $weekId);
$stmt->execute();
$result = $stmt->get_result();

$data = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    $result->free();
}

echo json_encode([
    "success" => true,
    "data" => $data
]);

$stmt->close();
$conn->close();

//header('Content-Type: application/json');
//require('../knft/header.php'); // Adjust path as needed
require_once 'auth_check.php'; // Include auth guard
//
//// Connect to DB
//$conn = new mysqli($servername, $username, $password, $dbname);
//if ($conn->connect_error) {
//    echo json_encode(["success" => false, "message" => "DB connection failed"]);
//    exit();
//}
//
//
//// Query: Replace 'your_table' with the actual table name (e.g., tray_status)
//$sql = "
//    SELECT 
//    t.id,
//    t.customerId,
//    c.customerName,
//    b.route AS route,
//    t.trayStatus
//FROM tray_management t
//LEFT JOIN customers c ON t.customerId = c.customerID
//LEFT JOIN routes b ON b.id = c.routeID
//WHERE t.weekId = ?
//ORDER BY t.id ASC
//";
//
//$result = $conn->query($sql);
//
//$data = [];
//if ($result) {
//    while ($row = $result->fetch_assoc()) {
//        $data[] = $row;
//    }
//    $result->free();
//}
//
//echo json_encode([
//    "success" => true,
//    "data" => $data
//]);
//
//$conn->close();