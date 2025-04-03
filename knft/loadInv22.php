<?php
require('header.php');
try {

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }


    // Query to insert data from inventory into temp_inventory based on the last weekId
    $sql = "INSERT INTO temp_inventory (weekId, product_id, product_name, category_id, price, quantity, unit_id)
            SELECT weekId, product_id, product_name, category_id, price, SUM(quantity) as quantity, unit_id
            FROM inventory
            WHERE weekId = 4
            GROUP BY product_id, product_name, category_id, price, unit_id";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $weekId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $response["message"] = "Data successfully inserted into temp_inventory.";
    } else {
        $response["message"] = "No products found for the last week.";
    }

    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    $response["error"] = $e->getMessage();
}

header('Content-Type: application/json');
echo json_encode($response);
?>
