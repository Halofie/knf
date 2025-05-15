<?php
require('header.php');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['emailID'])) {
    $emailID = $data['emailID'];

    // Optionally, also delete from login/account table if needed
    // $conn->query("DELETE FROM supplier_accounts WHERE emailID = '$emailID'");

    $stmt = $conn->prepare("DELETE FROM suppliers WHERE emailID = ?");
    $stmt->bind_param("s", $emailID);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Supplier deleted successfully!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Delete failed!"]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request!"]);
}

$conn->close();
?>
<?php
require('header.php');

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode([
        "success" => false,
        "message" => "Connection failed: " . $conn->connect_error
    ]));
}

header("Content-Type: application/json");

// Read JSON payload
$data = json_decode(file_get_contents("php://input"), true);

if (isset($data['emailID'])) {
    $categoryID = $data['emailID'];

    // 1) Fetch current rec_status
    $sql = "SELECT rec_status FROM suppliers WHERE emailId = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $categoryID);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // 2) Toggle it
        $current = (int)$row['rec_status'];
        $newStatus = $current === 1 ? 0 : 1;

        // 3) Update
        $update = $conn->prepare(
            "UPDATE suppliers SET rec_status = ? WHERE emailId = ?"
        );
        $update->bind_param("is", $newStatus, $categoryID);
        if ($update->execute()) {
            echo json_encode([
                "success" => true,
                "categoryID" => $categoryID,
                "newStatus" => $newStatus
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Update failed: " . $update->error
            ]);
        }
    } else {
        // No such category
        echo json_encode([
            "success" => false,
            "message" => "Category not found"
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Missing 'categoryType' in request"
    ]);
}

$conn->close();
?>