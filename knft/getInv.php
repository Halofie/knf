<?php
require('header.php');


try {

    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    $sql = "SELECT * FROM inventory";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $inventory = array();
        while($row = $result->fetch_assoc()) {
            $inventory[] = $row;
        }
        $response["data"] = $inventory;
    } else {
        $response["message"] = "No records found";
    }

    $conn->close();
} catch (Exception $e) {
    $response["error"] = $e->getMessage();
}

header('Content-Type: application/json');
echo json_encode($response);
?>
