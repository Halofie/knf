<?php
require('header.php');

try {
    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // SQL query to fetch products
    $sql = "SELECT * FROM product";
    $result = $conn->query($sql);

    $inventory = array();
    if ($result->num_rows > 0) {
        // Output data of each row
        while($row = $result->fetch_assoc()) {
            $inventory[] = $row;
        }
        $response["data"] = $inventory;
    } else {
        echo json_encode(array("message" => "No records found"));
        exit();
        $response["message"] = "No records found";
    }
    // Close connection
    $conn->close();
} catch (Exception $e) {
    $response["error"] = $e->getMessage();
}
// Send JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>