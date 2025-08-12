<?php
header('Content-Type: application/json');
require('header.php');

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode([]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$weekId = isset($data['weekId']) ? intval($data['weekId']) : 0;

$sql = "SELECT n.note, n.cust_id, n.weekId, n.orderId, c.customerName, c.routeID, r.route, w.weekdate
        FROM notes n
        LEFT JOIN customers c ON n.cust_id = c.customerID
        LEFT JOIN routes r ON c.routeID = r.id
        LEFT JOIN week w ON n.weekId = w.weekID
        WHERE n.weekId = ?
        ORDER BY n.orderId DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $weekId);
$stmt->execute();
$result = $stmt->get_result();

$notes = [];
while ($row = $result->fetch_assoc()) {
    $notes[] = $row;
}
echo json_encode($notes);

$stmt->close();
$conn->close();