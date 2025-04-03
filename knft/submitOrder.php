<?php
require('header.php');

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get the raw POST data
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Extract data from the decoded JSON
$week_id = $data['week_id'];
$customer_id = $data['customer_id'];
$product_id = $data['product_id'];
$quantity = $data['quantity'];
$routeId = $data['routeId'];
$date_time = $data['date_time'];
$rate = $data ['price'];
$tc = $data ['total'];

$sql = "INSERT INTO final_order (week_id, customer_id, product_id, quantity, route_id, date_time, rate, total_cost) VALUES ('$week_id', '$customer_id', '$product_id', '$quantity', '$routeId', '$date_time','$rate' ,'$tc')";

if ($conn->query($sql) === TRUE) {
    echo "Data inserted successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>
