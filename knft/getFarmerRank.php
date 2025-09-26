<?php
header('Content-Type: application/json');
require('../knft/header.php'); // Adjust the path as needed
require_once 'auth_check.php';

// Connect to DB
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit();
}

// Fetch farmer ranks with product and farmer names
$sql = "
    SELECT 
        fr.id,
        fr.rank,
        fr.farmer_id,
        fr.prod_id,
        p.product AS product_name,
        s.supplierName AS farmer_name
    FROM farmer_rank fr
    LEFT JOIN product p ON fr.prod_id = p.prod_id
    LEFT JOIN suppliers s ON fr.farmer_id = s.supplierID
    ORDER BY fr.prod_id, fr.rank ASC
";

$result = $conn->query($sql);

$data = [];
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    $result->free();
}

echo json_encode([
    "success" => true,
    "ranks" => $data
]);

$conn->close();