<?php
require('header.php');

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $uoMID = $data['UoMID'] ?? '';

    if (!$uoMID) {
        echo json_encode(['success' => false, 'message' => 'UoMID is required']);
        exit();
    }

    $sql = "DELETE FROM uom WHERE UoMID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('s', $uoMID);

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(['success' => true, 'message' => 'UoM deleted successfully']);
        } else {
            echo json_encode(['success' => false, 'message' => 'UoM not found or already deleted']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to delete UoM']);
    }

    $stmt->close();
    $conn->close();
}
?>
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

if (isset($data['route_id'])) {
    $route_id = $data['route_id'];

    $stmt = $conn->prepare("DELETE FROM routes WHERE id = ?");
    $stmt->bind_param("i", $route_id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Route deleted successfully!"]);
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

if (isset($data['id'])) {
    $productsID = (int)$data['id'];

    // 1) Fetch current rec_status
    $sql = "SELECT rec_status FROM uom WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $productsID);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // 2) Toggle it
        $current = (int)$row['rec_status'];
        $newStatus = $current === 1 ? 0 : 1;

        // 3) Update
        $update = $conn->prepare(
            "UPDATE uom SET rec_status = ? WHERE id = ?"
        );
        $update->bind_param("ii", $newStatus, $productsID);
        if ($update->execute()) {
            echo json_encode([
                "success" => true,
                "productsID" => $productsID,
                "newStatus" => $newStatus
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Update failed: " . $update->error
            ]);
        }
    } else {
        // No such products
        echo json_encode([
            "success" => false,
            "message" => "products not found"
        ]);
    }
} else {
    echo json_encode([
        "success" => false,
        "message" => "Missing 'prod_id' in request"
    ]);
}

$conn->close();



