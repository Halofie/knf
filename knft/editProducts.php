<?php
require('header.php');


// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['prod_id'], $data['category_id'], $data['product'], $data['UoM_id'], $data['price'])) {
    $prod_id = $data['prod_id'];
    $category_id = $data['category_id'];
    $product = $data['product'];
    $UoM_id = $data['UoM_id'];
    $price = $data['price'];

    // Update query
    $query = "UPDATE product SET category_id = ?, product = ?, UoM_id = ?, price = ? WHERE prod_id = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sssdi", $category_id, $product, $UoM_id, $price, $prod_id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Product updated successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Update failed!"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request!"]);
}
$conn->close();

?>
