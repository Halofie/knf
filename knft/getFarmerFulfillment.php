<?php
header('Content-Type: application/json');

require('header.php'); // DB credentials

$response = ['status' => 'error', 'notify_status' => 0, 'message' => 'Could not fetch notification status.']; // Default to 0 (off)

// No specific farmer authentication needed to read this global flag,
// but ensuring user is logged in is good practice.
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    http_response_code(401);
    $response['message'] = 'User not logged in.';
    echo json_encode($response);
    exit;
}

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    error_log("get_farmer_fulfillment_toggle_status.php DB Error: " . $conn->connect_error);
    $response['message'] = 'Database connection error.';
    echo json_encode($response);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT value FROM update_variables WHERE topic = 'farmerFulfillmentNotify' LIMIT 1");
    if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $response['status'] = 'success';
        $response['notify_status'] = intval($row['value']); // Ensure it's 0 or 1
        $response['message'] = 'Notification status fetched.';
    } else {
        // Topic not found, assume notifications are off (or handle as an error/setup issue)
        $response['status'] = 'success'; // Success in query, but topic not set
        $response['notify_status'] = 0;
        $response['message'] = 'Fulfillment notification flag not found in settings (defaulting to off).';
        error_log("get_farmer_fulfillment_toggle_status.php: 'farmerFulfillmentNotify' topic not found in update_variables.");
    }
    $stmt->close();

} catch (Exception $e) {
    http_response_code(500);
    error_log("get_farmer_fulfillment_toggle_status.php Exception: " . $e->getMessage());
    $response['message'] = 'Server error: ' . $e->getMessage();
    // $response['status'] is already 'error'
} finally {
    $conn->close();
}

echo json_encode($response);
?>