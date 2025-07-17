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

    // ✅ Step 1: Get UoM for this product
    $unitCheckSQL = "SELECT UoM_id FROM product WHERE prod_id = ?";
    $stmt = $conn->prepare($unitCheckSQL);
    $stmt->bind_param("i", $product_id);
    $stmt->execute();
    $stmt->bind_result($uom);
    $stmt->fetch();
    $stmt->close();

    // ✅ Step 2: Validate for 'nos' that quantity is an integer
    if (strtolower($uom) === 'nos' && floor($quantity) != $quantity) {
        echo json_encode(["error" => "Decimal quantity not allowed for this product."]);
        $conn->close();
        exit;
    }

    // ✅ Step 3: Proceed with inserts
    $sql_final_order = "INSERT INTO final_order (week_id, customer_id, product_id, quantity, route_id, date_time, rate, total_cost)
                        VALUES ('$week_id', '$customer_id', '$product_id', '$quantity', '$routeId', NOW(),'$rate' ,'$tc')";

    if ($conn->query($sql_final_order) === TRUE) {
        $sql_order_fulfillment = "INSERT INTO order_fulfillment (week_id, customer_id, product_id, quantity, route_id, date_time, rate, total_cost)
                                  VALUES ('$week_id', '$customer_id', '$product_id', '$quantity', '$routeId', NOW(),'$rate' ,'$tc')";

        if ($conn->query($sql_order_fulfillment) === TRUE) {
            $updateSql = "UPDATE temp_inventory SET quantity = quantity - $quantity
                          WHERE weekID = '$week_id' AND product_id = '$product_id' AND quantity >= $quantity";

            if ($conn->query($updateSql) === TRUE) {
                if ($conn->affected_rows == 0) {
                    $error_messages[] = "Stock update failed or insufficient stock for product ID '$product_id'.";
                }
            } else {
                echo json_encode("Error updating temp_inventory: " . $conn->error);
                $conn->close();
                exit;
            }
        } else {
            echo json_encode("Error: " . $sql_order_fulfillment . "<br>" . $conn->error);
            $conn->close();
            exit;
        }
    } else {
        echo json_encode("Error: " . $sql_final_order . "<br>" . $conn->error);
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
