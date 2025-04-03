<?php
require('header.php');

try {
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // Get the JSON data from the request
    $data = json_decode(file_get_contents('php://input'), true);

    if (!empty($data)) {
        $stmt = $conn->prepare("INSERT INTO inventory (weekId, Farmer_id , product_id, product_name, category_id, price, quantity, unit_id, datetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("iiissdiss",$weekId, $Farmer_id, $product_id, $product_name, $category_id, $price, $quantity, $unit_id, $datetime);

        foreach ($data as $product) {
            $weekId = $product['week_id'];
            $Farmer_id = $product['farmer_Id'];
            $product_id = $product['p_id'];
            $product_name = $product['p_name'];
            $category_id = $product['cat_id'];
            $price = $product['price'];
            $quantity = $product['quantity'];
            $unit_id = $product['uom_id'];
            $datetime = $product['DateTime'];
            $stmt->execute();
        }

        $stmt->close();
        $response["message"] = "Data successfully inserted";
    } else {
        throw new Exception("Invalid data format");
    }
    // Close connections
    $conn->close();
} catch (Exception $e) {
    $response["error"] = $e->getMessage();
}

header('Content-Type: application/json');
echo json_encode($response);
?>
