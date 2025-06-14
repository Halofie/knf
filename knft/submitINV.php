<?php
error_reporting(E_ALL); // Report all PHP errors.
ini_set('display_errors', 0); // Prevent errors from being sent to the browser.
ini_set('log_errors', 1);
header('Content-Type: application/json');
require('header.php');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}
$response = [];

try {   
    // Get the JSON data from the request
    $data = json_decode(file_get_contents('php://input'), true);
    if (!empty($data)) {
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

            $sql = "INSERT INTO inventory (weekId, Farmer_id , product_id, product_name, category_id, price, quantity, unit_id, inv_datetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("iisssdds",$weekId, $Farmer_id, $product_id, $product_name, $category_id, $price, $quantity, $unit_id);
            $stmt->execute();
        }
        $stmt->close();
        $response["status"] = "success";
        $response["message"] = "Data successfully inserted into inventory";
    } else {
        throw new Exception("Invalid data format");
    }
    // Close connections
    $conn->close();
} catch (Exception $e) {
    $response["error"] = $e->getMessage();
}
echo json_encode($response);
?>