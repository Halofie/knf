<?php
require('header.php');
error_reporting(E_ALL);
ini_set('display_errors', 1);
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}

$response = array();

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// SQL query to delete all records from temp_inventory
$sql = "TRUNCATE TABLE temp_inventory";

if ($conn->query($sql) === TRUE) {
    echo "Table temp_inventory cleared successfully.";
} else {
    echo "Error clearing table: " . $conn->error;
}

// Close connection
$conn->close();
?>
