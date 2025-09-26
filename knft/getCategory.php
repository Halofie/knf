<?php
require('header.php');
require_once 'auth_check.php';

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// SQL query to fetch category
$sql = "SELECT categoryID, categoryType, categoryDesc, rec_status FROM category";
$result = $conn->query($sql);

$units = array();
if ($result->num_rows > 0) {
    // Output data of each row
    while($row = $result->fetch_assoc()) {
        $units[] = $row;
    }
} else {
    echo json_encode(array("message" => "No category found"));
    exit();
}
// Close connection
$conn->close();

// Send JSON response
header('Content-Type: application/json');
echo json_encode($units);
?>
