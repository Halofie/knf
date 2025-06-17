<?php
header('Content-Type: application/json');
require('../knft/header.php'); // Adjust path as needed

// Connect to DB
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit();
}

// Query: Replace 'your_table' with the actual table name (e.g., tray_status)
$sql = "
    SELECT 
    t.id,
    t.customerId,
    c.customerName,
    b.route AS route,
    t.trayStatus
FROM tray_management t
LEFT JOIN customers c ON t.customerId = c.customerID
LEFT JOIN routes b ON b.id = c.routeID
ORDER BY t.id ASC
";

$result = $conn->query($sql);

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

$conn->close();