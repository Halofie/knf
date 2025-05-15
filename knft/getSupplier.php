<?php
require('header.php');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// SQL query to fetch supplier
$sql = "SELECT supplierID, supplierName, farmLocation, contact, alternativeContact, farmSize, emailID FROM suppliers";
$result = $conn->query($sql);

$units = array();
if ($result->num_rows > 0) {
    // Output data of each row
    while($row = $result->fetch_assoc()) {
        $units[] = $row;
    }
} else {
    echo json_encode(array("message" => "Supplier not found"));
    exit();
}

// Close connection
$conn->close();
// Send JSON response
header('Content-Type: application/json');
echo json_encode($units);
?>