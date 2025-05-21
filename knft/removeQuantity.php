<?php
require('header.php');

try {

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // Get the JSON data from the request
    $data = json_decode(file_get_contents('php://input'), true);
    $productId = isset($data['product_id']) ? intval($data['product_id']) : 0;
    $quantity = isset($data['quantity']) ? intval($data['quantity']) : 0;

    if ($productId > 0 && $quantity > 0) {
    // Check current quantity
        $checkSql = "SELECT quantity FROM temp_inventory WHERE product_id = ?";
        $checkStmt = $conn->prepare($checkSql);
        $checkStmt->bind_param("i", $productId);
        $checkStmt->execute();
        $checkStmt->bind_result($currentQty);
        $checkStmt->fetch();
        $checkStmt->close();
        
        if ($currentQty === null) {
            $response["message"] = "Product not found.";
        } else if ($currentQty < $quantity) {
            $response["message"] = "Insufficient quantity. Only $currentQty left.";
        } else {
            // Update the quantity in the database
            $sql = "UPDATE temp_inventory SET quantity = quantity - ? WHERE product_id = ?";
            $stmt = $conn->prepare($sql);
            $stmt->bind_param("ii", $quantity, $productId);
            $stmt->execute();
        
            if ($stmt->affected_rows > 0) {
                $response["message"] = "Purchase successful.";
            } else {
                $response["message"] = "Update failed.";
            }
        
            $stmt->close();
        }
        } else {
            $response["message"] = "Invalid product_id or quantity.";
        }

    $conn->close();
} catch (Exception $e) {
    $response["error"] = $e->getMessage();
}

header('Content-Type: application/json');
echo json_encode($response);
?>
