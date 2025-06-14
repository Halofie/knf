<?php
require('header.php');
$response = [];

try {

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $name = $data['name'];
    $contact = $data['contact'];
    $route = $data['route'];
    $order = $data['order'];

    if (!$name || !$contact || !$route || empty($order)) {
        throw new Exception("Invalid input data");
    }

    $columns = "`Timestamp`, `Name`, `Contact Number`, `Delivery / Pickup route`";
    $values = "NOW(), ?, ?, ?";
    $types = "sss";
    $params = [$name, $contact, $route];

    foreach ($order as $product => $quantity) {
        $columns .= ", `" . $conn->real_escape_string($product) . "`";
        $values .= ", ?";
        $types .= "d";
        $params[] = $quantity;
    }

    $stmt = $conn->prepare("INSERT INTO finalorders ($columns) VALUES ($values)");
    $stmt->bind_param($types, ...$params);

    if ($stmt->execute()) {
        $response['success'] = true;
        $response['message'] = "Order placed successfully";
    } else {
        throw new Exception("Failed to insert order: " . $stmt->error);
    }

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>
