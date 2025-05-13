<?php
require('header.php');

try {
    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    $sql = "SELECT weekID FROM week ORDER BY weekID DESC LIMIT 1";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $weekID = $row['weekID'];
        $sql = "SELECT * FROM temp_inventory WHERE weekID = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $weekID);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $data = array();
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
            $response["data"] = $data;
        } else {
            $response["message"] = "No data found for the specified week.";
        }

        $stmt->close();
    } else {
        throw new Exception("No week data found.");
    }
    // Retrieve weekID from the reques
    $conn->close();
} catch (Exception $e) {
    $response["error"] = $e->getMessage();
}
header('Content-Type: application/json');
echo json_encode($response);
?>