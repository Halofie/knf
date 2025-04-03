<?php
require('header.php');


// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['oldCategoryType'], $data['newCategoryType'], $data['newCategoryDesc'])) {
    $oldCategoryType = $data['oldCategoryType'];
    $newCategoryType = $data['newCategoryType'];
    $newCategoryDesc = $data['newCategoryDesc'];

    // Check if new categoryType already exists
    $checkQuery = "SELECT * FROM category WHERE categoryType = ?";
    $stmt = $conn->prepare($checkQuery);
    $stmt->bind_param("s", $newCategoryType);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0 && $oldCategoryType !== $newCategoryType) {
        echo json_encode(["success" => false, "message" => "Category Type already exists!"]);
        exit;
    }

    // Update query
    $query = "UPDATE category SET categoryType = ?, categoryDesc = ? WHERE categoryType = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sss", $newCategoryType, $newCategoryDesc, $oldCategoryType);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Category updated successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Update failed!"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request!"]);
}


    $stmt->close();
    $conn->close();

?>
