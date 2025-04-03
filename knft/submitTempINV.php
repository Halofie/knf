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
        // Prepare the SQL statement for inserting into temp_inventory
        $stmt = $conn->prepare("INSERT INTO temp_inventory (weekID, product_id, quantity, price, datetime) VALUES (?, ?, ?, ?)");
        $stmt->bind_param("iiids", $product_id, $weekID, $quantity, $price, $datetime);

        // Loop through the incoming data
        foreach ($data as $product) {
            $weekID = $product['week_id']; // Current week's ID
            $product_id = $product['p_id'];
            $quantity = $product['quantity'];
            $price = $product['price'];
            $datetime = $product['DateTime'];

            // Execute the prepared statement
            $stmt->execute();
        }

        $stmt->close();
        $response["message"] = "Data successfully inserted into temp_inventory for the current week.";
    } else {
        throw new Exception("Invalid data format or no data provided.");
    }
    // Close the database connection
    $conn->close();
} catch (Exception $e) {
    $response["error"] = $e->getMessage();
}

// Send the response
header('Content-Type: application/json');
echo json_encode($response);
?>
