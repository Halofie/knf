<?php
header('Content-Type: application/json');
require('header.php');

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(['error' => 'Connection failed']);
    exit();
}

$stats = [];

try {
    // Get total customers
    $result = $conn->query("SELECT COUNT(*) as total FROM customers");
    $stats['customers'] = $result->fetch_assoc()['total'];

    // Get total farmers/suppliers
    $result = $conn->query("SELECT COUNT(*) as total FROM suppliers");
    $stats['farmers'] = $result->fetch_assoc()['total'];

    // Get total products
    $result = $conn->query("SELECT COUNT(*) as total FROM product");
    $stats['products'] = $result->fetch_assoc()['total'];

    // Get total orders (from custorder table)
    $result = $conn->query("SELECT COUNT(*) as total FROM custorder");
    $stats['orders'] = $result->fetch_assoc()['total'];

    // Get current week info
    $result = $conn->query("SELECT weekdate FROM week ORDER BY weekID DESC LIMIT 1");
    $row = $result->fetch_assoc();
    $stats['current_week'] = $row ? $row['weekdate'] : 'N/A';

    // Get recent orders count (last 7 days)
    $result = $conn->query("SELECT COUNT(*) as total FROM custorder WHERE weekId = (SELECT weekID FROM week ORDER BY weekID DESC LIMIT 1)");
    $stats['recent_orders'] = $result ? $result->fetch_assoc()['total'] : 0;

    echo json_encode($stats);

} catch (Exception $e) {
    echo json_encode(['error' => 'Query failed: ' . $e->getMessage()]);
}

$conn->close();
?>