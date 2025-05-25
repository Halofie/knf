<?php
require('header.php');

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

$week_id = $data['week_id'];
$customer_id = $data['customer_id'];
$routeId = $data['routeId'];

foreach ($data["items"] as $product) {
    $product_id = $product['product_id'];
    $quantity = $product['quantity'];
    $rate = $product['price'];
    $tc = $product['total'];

    // Insert into final_order
    $sql = "INSERT INTO final_order (week_id, customer_id, product_id, quantity, route_id, date_time, rate, total_cost) VALUES ('$week_id', '$customer_id', '$product_id', '$quantity', '$routeId', NOW(),'$rate' ,'$tc')";
    if ($conn->query($sql) === TRUE) {
        // Decrement from temp_inventory for this week and product
        $updateSql = "UPDATE temp_inventory SET quantity = quantity - $quantity WHERE weekID = '$week_id' AND product_id = '$product_id' AND quantity >= $quantity";
        if ($conn->query($updateSql) === TRUE) {
            // Success
        } else {
            echo json_encode("Error updating temp_inventory: " . $conn->error);
        }
    } else {
        echo json_encode("Error: " . $sql . "<br>" . $conn->error);
    }
}
$conn->close();
?>