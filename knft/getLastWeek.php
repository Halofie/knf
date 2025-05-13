<?php
header('Content-Type: application/json');
require('header.php');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// SQL query to fetch units of measure
$sql = "SELECT * FROM week WHERE weekID=(SELECT max(weekID) FROM week)";
$result = $conn->query($sql);

$units = array();
if ($result->num_rows > 0) {
    // Output data of each row
    while($row = $result->fetch_assoc()) {
        $units[] = $row;
    }
} else {
    echo json_encode(array("message" => "No units found"));
    exit();
}
// Close connection
$conn->close();
// Send JSON response
echo json_encode($units);
?>