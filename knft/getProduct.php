<?php
require('header.php');
// Minimal change: removed admin-only auth_check; restore original simple header usage.
header('Content-Type: application/json');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

try {
    // SQL query to fetch products
    $sql = "SELECT * FROM product ";
    $result = $conn->query($sql);
    if ($result === false) {
        throw new Exception("Query failed: " . $conn->error);
    }

    $inventory = array();
    if ($result->num_rows > 0) {
        // Output data of each row
        while($row = $result->fetch_assoc()) {
            $inventory[] = $row;
        }
        $response["data"] = $inventory;
        $response["status"] = "success";
    } else {
        echo json_encode(array("message" => "No records found"));
        exit();
        $response["message"] = "No active products found";
    }
} catch (Exception $e) {
    $response["error"] = $e->getMessage();
}
// Close connection
$conn->close();
// Send JSON response
echo json_encode($response);
?>