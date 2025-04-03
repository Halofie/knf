<?php
require('header.php');

try {

    // Create a connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check the connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // Step 1: Fetch the latest weekID
    $sql = "SELECT weekID FROM week ORDER BY weekID DESC LIMIT 1";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $weekId = $row['weekID'];
    } else {
        throw new Exception("No week data found.");
    }

    // Step 2: Insert data into temp_inventory
    $sql = "INSERT INTO temp_inventory (weekID, product_id, price, quantity, datetime)
            SELECT weekID, product_id, price, SUM(quantity) as quantity, datetime
            FROM inventory
            WHERE weekID = ?
            GROUP BY product_id, category_id, price";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        throw new Exception("Failed to prepare SQL statement: " . $conn->error);
    }

    $stmt->bind_param("i", $weekId);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $response["message"] = "Data successfully inserted into temp_inventory.";
    } else {
        $response["message"] = "No products found for the selected week.";
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
} catch (Exception $e) {
    $response["error"] = $e->getMessage();
}

// Return the response as JSON
header('Content-Type: application/json');
echo json_encode($response);
?>
