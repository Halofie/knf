<?php
require('header.php');
require_once 'auth_check.php';

header("Content-Type: application/json");

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode([
        "success" => false, 
        "message" => "Connection failed: " . $conn->connect_error
    ]));
}

$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
$required_fields = ['prod_id', 'category_id', 'product', 'UoM_id', 'price'];
foreach ($required_fields as $field) {
    if (!isset($data[$field])) {
        echo json_encode([
            "success" => false,
            "message" => "Missing required field: {$field}"
        ]);
        exit();
    }
}

try {
    // Sanitize and prepare data
    $prod_id = intval($data['prod_id']);
    $category_id = $data['category_id'];
    $product = trim($data['product']);
    $UoM_id = $data['UoM_id'];
    $price = floatval($data['price']);
    $durability = isset($data['durability']) ? intval($data['durability']) : 0;
    $minQuantity = isset($data['minQuantity']) ? floatval($data['minQuantity']) : 0;
    $step = isset($data['step']) ? floatval($data['step']) : 0.01;

    // Validate data
    if ($price < 0) {
        throw new Exception("Price cannot be negative");
    }

    if ($minQuantity < 0) {
        throw new Exception("Minimum quantity cannot be negative");
    }

    // Update query with all fields
    $query = "UPDATE product 
              SET category_id = ?, 
                  product = ?, 
                  UoM_id = ?, 
                  price = ?,
                  durability = ?,
                  minQuantity = ?,
                  step = ?
              WHERE prod_id = ?";
              
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sssddddi", 
        $category_id, 
        $product, 
        $UoM_id, 
        $price,
        $durability,
        $minQuantity,
        $step,
        $prod_id
    );

    if (!$stmt->execute()) {
        throw new Exception("Failed to update product: " . $stmt->error);
    }

    if ($stmt->affected_rows === 0) {
        echo json_encode([
            "success" => false,
            "message" => "No product found with ID: {$prod_id}"
        ]);
    } else {
        echo json_encode([
            "success" => true,
            "message" => "Product updated successfully!",
            "productId" => $prod_id
        ]);
    }

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ]);
} finally {
    if (isset($stmt)) {
        $stmt->close();
    }
    $conn->close();
}
?>