<?php
require('header.php');


try {

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // Get the JSON data from the request
    $data = json_decode(file_get_contents('php://input'), true);

    if (!empty($data)) {
        $weekId = $data['week_id'];
        $farmerId = $data['farmer_id'];

        // SQL query to fetch the inventory for the given week and farmer
        $sql = "
            SELECT i.product_name, c.category_name, i.price, i.quantity, i.inv_datetime FROM inventory i
            JOIN categories c ON i.category_id = c.category_id
            WHERE i.weekId = ? AND i.Farmer_id = ?
        ";

        // Prepare and bind
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $weekId, $farmerId);
        $stmt->execute();

        // Get the results
        $result = $stmt->get_result();
        $inventory = array();

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $inventory[] = $row;
            }
            $response["inventory"] = $inventory;
        } else {
            $response["message"] = "No inventory found for this week.";
        }

        $stmt->close();
    } else {
        throw new Exception("Invalid request data.");
    }

    // Close connection
    $conn->close();
} catch (Exception $e) {
    $response["error"] = $e->getMessage();
}

header('Content-Type: application/json');
echo json_encode($response);
?>