<?php
require('header.php');
require_once 'auth_check.php';

try {

    // Create a connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check the connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    // SQL query to delete all records from temp_inventory
    $sql = "TRUNCATE TABLE temp_inventory";
    
    if ($conn->query($sql) === TRUE) {
        echo "Table temp_inventory cleared successfully.";
    } else {
        echo "Error clearing table: " . $conn->error;
    }
    $sql = "TRUNCATE TABLE farmer_rank";
    
    if ($conn->query($sql) === TRUE) {
        echo "Table temp_inventory cleared successfully.";
    } else {
        echo "Error clearing table: " . $conn->error;
    }
    // Check if temp_inventory is empty
    $checkSql = "SELECT COUNT(*) as cnt FROM temp_inventory";
    $checkResult = $conn->query($checkSql);
    $row = $checkResult->fetch_assoc();
    if ($row['cnt'] > 0) {
        $response["message"] = "Temp inventory is not empty. Please clear temp inventory first.";
    } else {
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
        $sql = "INSERT INTO temp_inventory (weekID, product_id, price, quantity, temp_inv_datetime)
                SELECT weekID, product_id, price, SUM(quantity) as quantity, inv_datetime
                FROM inventory
                WHERE weekID = ?
                GROUP BY product_id, category_id, price";

        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("Failed to prepare SQL statement: " . $conn->error);
        }

        $stmt->bind_param("i", $weekId);
        $stmt->execute();

        $sql = "INSERT INTO farmer_rank (farmer_id, prod_id, `rank`)
            SELECT 
                Farmer_id, 
                product_id, 
                RANK() OVER (PARTITION BY product_id ORDER BY earliest_time ASC) AS `rank`
            FROM (
                SELECT 
                    Farmer_id, 
                    product_id, 
                    MIN(rec_date_time) AS earliest_time
                FROM inventory
                WHERE weekID = ?
                GROUP BY product_id, Farmer_id
            ) AS sub;
        ";
        

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

        $stmt->close();
    }

    $conn->close();
} catch (Exception $e) {
    $response["error"] = $e->getMessage();
}

// Return the response as JSON
header('Content-Type: application/json');
echo json_encode($response);
?>