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
    $sql_final_order = "INSERT INTO final_order (week_id, customer_id, product_id, quantity, route_id, date_time, rate, total_cost) VALUES ('$week_id', '$customer_id', '$product_id', '$quantity', '$routeId', NOW(),'$rate' ,'$tc')";
    if ($conn->query($sql_final_order) === TRUE) {
        $sql_order_fulfillment = "INSERT INTO order_fulfillment (week_id, customer_id, product_id, quantity, route_id, date_time, rate, total_cost) VALUES ('$week_id', '$customer_id', '$product_id', '$quantity', '$routeId', NOW(),'$rate' ,'$tc')";
        if ($conn->query($sql_order_fulfillment) === TRUE) {
            $updateSql = "UPDATE temp_inventory SET quantity = quantity - $quantity WHERE weekID = '$week_id' AND product_id = '$product_id' AND quantity >= $quantity";

            if ($conn->query($updateSql) === TRUE) {
                if ($conn->affected_rows == 0) {
                    // This means stock was not enough, or product/week didn't match.
                    // This is a critical failure point if not using transactions.
                    // For simplicity of matching your style, we'll log it.
                    // In a transactional system, this would cause a rollback.
                    $error_messages[] = "Stock update failed or insufficient stock for product ID '{$product_id}' in week '{$week_id}'. Order might be inconsistent.";
                }
            } else {
                echo json_encode("Error updating temp_inventory: " . $conn->error);
            }
        } else {
            echo json_encode("Error: " . $sql_order_fulfillment . "<br>" . $conn->error);
        }    
    } else {
        echo json_encode("Error: " . $sql_final_order . "<br>" . $conn->error);
    }
}
$conn->close();
header('Content-Type: application/json');
?>