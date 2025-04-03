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
        $category_id = $data['category_id'];
        $product = $data['product'];
        $UoM_id = $data['UoM_id'];
        $price = $data['price'];

        // Prepare and bind
        $stmt = $conn->prepare("INSERT INTO product (category_id, product, UoM_id, price) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("sssi", $category_id, $product, $UoM_id, $price);

        // Execute the query
        if ($stmt->execute()) {
            echo "New record created successfully";
        } else {
            echo "Error: " . $stmt->error;
        }
        // Close connections
        $stmt->close();
        $response["message"] = "Data successfully inserted";
    } else {
        throw new Exception("Invalid data format");
    }
    $conn->close();
} catch (Exception $e) {
    $response["error"] = $e->getMessage();
}
?>