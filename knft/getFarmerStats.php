<?php
// filepath: c:\wamp64\www\knf\knft\getFarmerStats.php
header('Content-Type: application/json');
error_reporting(0); // Suppress PHP warnings that could break JSON
ini_set('display_errors', 0);

// Include your database connection
require_once('header.php');

try {
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        echo json_encode(['error' => 'Connection failed: ' . $conn->connect_error]);
        exit();
    }

    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['error' => 'Invalid JSON input']);
        exit();
    }

    $farmerId = isset($data['farmer_id']) ? intval($data['farmer_id']) : 0;
    $weekId = isset($data['week_id']) ? intval($data['week_id']) : 0;

    if (!$farmerId || !$weekId) {
        echo json_encode(['error' => 'Missing farmer_id or week_id', 'received' => $data]);
        exit();
    }

    // Get current inventory stats
    $sql = "SELECT 
                COUNT(DISTINCT product_id) as productCount,
                COALESCE(SUM(price * quantity), 0) as totalValue,
                COALESCE(SUM(quantity), 0) as totalQuantity
            FROM inventory 
            WHERE farmer_id = ? AND weekId = ?";
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        echo json_encode(['error' => 'Prepare failed: ' . $conn->error]);
        exit();
    }
    
    $stmt->bind_param("ii", $farmerId, $weekId);
    $stmt->execute();
    $result = $stmt->get_result();
    $stats = $result->fetch_assoc();
    
    // Format the response
    $response = [
        'productCount' => intval($stats['productCount'] ?? 0),
        'totalValue' => number_format(floatval($stats['totalValue'] ?? 0), 2),
        'totalQuantity' => number_format(floatval($stats['totalQuantity'] ?? 0), 2),
        'debug' => [
            'farmer_id' => $farmerId,
            'week_id' => $weekId,
            'raw_stats' => $stats
        ]
    ];
    
    echo json_encode($response);

} catch (Exception $e) {
    echo json_encode(['error' => 'Exception: ' . $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    if (isset($conn)) $conn->close();
}
?>