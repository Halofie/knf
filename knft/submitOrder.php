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

$error_messages = [];

foreach ($data["items"] as $product) {
    $product_id = $product['product_id'];
    $quantity = $product['quantity'];
    $rate = $product['price'];
    $tc = $product['total'];

    // Step 1: Get UoM for this product
    $unitCheckSQL = "SELECT UoM_id FROM product WHERE prod_id = ?";
    $stmt = $conn->prepare($unitCheckSQL);
    $stmt->bind_param("i", $product_id);
    $stmt->execute();
    $stmt->bind_result($uom);
    $stmt->fetch();
    $stmt->close();

    // Step 2: Validate for 'nos' that quantity is an integer
    if (strtolower($uom) === 'nos' && floor($quantity) != $quantity) {
        echo json_encode(["error" => "Decimal quantity not allowed for this product."]);
        $conn->close();
        exit;
    }

    // Step 3: Get route rate from routes table
    $routeRateSQL = "SELECT rate FROM routes WHERE id = ?";
    $stmt = $conn->prepare($routeRateSQL);
    $stmt->bind_param("i", $routeId);
    $stmt->execute();
    $stmt->bind_result($route_rate);
    $stmt->fetch();
    $stmt->close();

    // Step 4: Proceed with inserts
    $sql_final_order = "INSERT INTO final_order (week_id, customer_id, product_id, quantity, route_id, route_rate, date_time, rate, total_cost)
                        VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?)";
    $stmt = $conn->prepare($sql_final_order);
    $stmt->bind_param("iiiidddd", $week_id, $customer_id, $product_id, $quantity, $routeId, $route_rate, $rate, $tc);
    if ($stmt->execute()) {
        $stmt->close();
        $sql_order_fulfillment = "INSERT INTO order_fulfillment (week_id, customer_id, product_id, quantity, route_id,route_rate, date_time, rate, total_cost)
                                  VALUES (?, ?, ?, ?, ?,?, NOW(), ?, ?)";
        $stmt2 = $conn->prepare($sql_order_fulfillment);
        $stmt2->bind_param("iiiidddd", $week_id, $customer_id, $product_id, $quantity, $routeId,$route_rate, $rate, $tc);
        if ($stmt2->execute()) {
            $stmt2->close();
            $updateSql = "UPDATE temp_inventory SET quantity = quantity - ?
                          WHERE weekID = ? AND product_id = ? AND quantity >= ?";
            $stmt3 = $conn->prepare($updateSql);
            $stmt3->bind_param("iiii", $quantity, $week_id, $product_id, $quantity);
            if ($stmt3->execute()) {
                if ($stmt3->affected_rows == 0) {
                    $error_messages[] = "Stock update failed or insufficient stock for product ID '$product_id'.";
                }
            } else {
                echo json_encode("Error updating temp_inventory: " . $stmt3->error);
                $stmt3->close();
                $conn->close();
                exit;
            }
            $stmt3->close();
        } else {
            echo json_encode("Error: " . $stmt2->error);
            $stmt2->close();
            $conn->close();
            exit;
        }
    } else {
        echo json_encode("Error: " . $stmt->error);
        $stmt->close();
        $conn->close();
        exit;
    }
}


$conn->close();
header('Content-Type: application/json');

if (!empty($error_messages)) {
    echo json_encode(["warning" => $error_messages]);
} else {
    echo json_encode(["success" => "Order placed successfully."]);
}
?>
