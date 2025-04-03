<?php
require('header.php');

header('Content-Type: application/json');
$input = json_decode(file_get_contents('php://input'), true);
$email = $input['customer_id'];
try {

    $conn = new mysqli($servername, $username, $password, $dbname);

    $sql = "SELECT weekID FROM week ORDER BY weekID DESC LIMIT 1";
    $result = $conn->query($sql);
    $row = $result->fetch_assoc();
    $weekId = $row['weekID'];

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    $sql = "SELECT * FROM final_order WHERE customer_id = ? AND week_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $email,$weekId);
    $stmt->execute();
    $result = $stmt->get_result();

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
