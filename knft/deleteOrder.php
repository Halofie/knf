<?php
require('header.php');

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]));
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $week_id = $_POST["week_id"];
    $customer_id = $_POST["customer_id"];
    $product_id = $_POST["product_id"];

    // Step 1: Get quantity from the row to be deleted
    $sql_select = "SELECT quantity FROM final_order WHERE week_id = ? AND customer_id = ? AND product_id = ?";
    $stmt_select = $conn->prepare($sql_select);
    $stmt_select->bind_param("iii", $week_id, $customer_id, $product_id);
    $stmt_select->execute();
    $result = $stmt_select->get_result();

    if ($row = $result->fetch_assoc()) {
        $quantity = $row["quantity"];
        $stmt_select->close();

        // Step 2: Update the quantity in temp_inventory
        $sql_update = "UPDATE temp_inventory SET quantity = quantity + ? WHERE weekID = ? AND product_id = ?";
        $stmt_update = $conn->prepare($sql_update);
        $stmt_update->bind_param("iii", $quantity, $week_id, $product_id);
        $stmt_update->execute();
        $stmt_update->close();

        // Step 3: Delete the row from your_table
        $sql_delete = "DELETE FROM final_order WHERE week_id = ? AND customer_id = ? AND product_id = ?";
        $stmt_delete = $conn->prepare($sql_delete);
        $stmt_delete->bind_param("iii", $week_id, $customer_id, $product_id);

        if ($stmt_delete->execute()) {
            echo json_encode(["success" => true, "message" => "Row deleted and inventory updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error deleting row: " . $stmt_delete->error]);
        }

        $stmt_delete->close();
    } else {
        echo json_encode(["success" => false, "message" => "Row not found"]);
    }
}

$conn->close();
?>

