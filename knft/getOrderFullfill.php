<?php
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);
require('header.php'); // Adjust path if needed
require_once 'auth_check.php';
header('Content-Type: application/json');

// Connect to DB
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "DB connection failed"]);
    exit();
}

// Get week_id from POST JSON
$input = json_decode(file_get_contents('php://input'), true);
$week_id = isset($input['week_id']) ? intval($input['week_id']) : 0;
$get_mode = isset($input['get_mode']) ? intval($input['get_mode']) : 0;

if ($week_id === 0) {
    echo json_encode(["success" => false, "message" => "Invalid week_id"]);
    exit();
}

if($get_mode == 0) {
    // Query with JOINs
    $sql = "
        SELECT 
            o.id,
            o.rec_date_time,
            c.customerName,
            p.product,
            fo.quantity AS ordered_quantity,
            o.quantity AS fulfill_quantity,
            o.rate,
            o.total_cost,
            o.route_id,
            p.UoM_id as uom
        FROM order_fulfillment o
        JOIN customers c ON o.customer_id = c.customerID
        JOIN product p ON o.product_id = p.prod_id
        JOIN final_order fo ON fo.week_id = o.week_id AND fo.customer_id = o.customer_id AND fo.product_id = o.product_id
        WHERE o.week_id = ?
        ORDER BY o.rec_date_time ASC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $week_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode([
        "success" => true,
        "orders" => $data
    ]);
    $stmt->close();
    $conn->close();
    exit();
}else if($get_mode == 1) {
    // Query with JOINs
    $sql = "
        SELECT 
            o.id,
            o.rec_date_time,
            c.customerName,
            p.product,
            fo.quantity AS ordered_quantity,
            o.quantity AS fulfill_quantity,
            o.rate,
            o.total_cost,
            o.route_id,
            p.UoM_id as uom
        FROM order_fulfillment o
        JOIN customers c ON o.customer_id = c.customerID
        JOIN product p ON o.product_id = p.prod_id
        JOIN final_order fo ON fo.week_id = o.week_id AND fo.customer_id = o.customer_id AND fo.product_id = o.product_id
        WHERE o.week_id = ?
        ORDER BY o.customer_id ASC, o.rec_date_time ASC
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $week_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "orders" => $data
    ]);
    $stmt->close();
    $conn->close();
    exit();
}else if($get_mode == 2) {
    // Query with JOINs
    $sql = "
        SELECT 
            o.id,
            o.rec_date_time,
            c.customerName,
            p.product,
            fo.quantity AS ordered_quantity,
            o.quantity AS fulfill_quantity,
            o.rate,
            o.total_cost,
            o.route_id,
            p.UoM_id as uom
        FROM order_fulfillment o
        JOIN customers c ON o.customer_id = c.customerID
        JOIN product p ON o.product_id = p.prod_id
        JOIN final_order fo ON fo.week_id = o.week_id AND fo.customer_id = o.customer_id AND fo.product_id = o.product_id
        WHERE o.week_id = ?
        ORDER BY o.product_id ASC, o.rec_date_time ASC
    ";
    
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $week_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
    
    echo json_encode([
        "success" => true,
        "orders" => $data
    ]);
    $stmt->close();
    $conn->close();
    exit();
}else if($get_mode == 3) {
    $uomOrderArr = [];
    $uomResult = $conn->query("SELECT UoMID FROM uom WHERE rec_status = 1 ORDER BY id ASC");
    while ($uomRow = $uomResult->fetch_assoc()) {
        $uomOrderArr[] = $uomRow['UoMID'];
    }
    // If no UOMs found, fallback to empty string to avoid SQL error
    $uomOrder = count($uomOrderArr) > 0 ? "'" . implode("','", $uomOrderArr) . "'" : "''";

    $sql = "
        SELECT 
            o.id,
            o.rec_date_time,
            c.customerName,
            p.product,
            fo.quantity AS ordered_quantity,
            o.quantity AS fulfill_quantity,
            o.rate,
            o.total_cost,
            o.route_id,
            p.UoM_id as uom
        FROM order_fulfillment o
        JOIN customers c ON o.customer_id = c.customerID
        JOIN product p ON o.product_id = p.prod_id
        JOIN final_order fo ON fo.week_id = o.week_id AND fo.customer_id = o.customer_id AND fo.product_id = o.product_id
        WHERE o.week_id = ?
        ORDER BY FIELD(p.UoM_id, $uomOrder), o.rec_date_time ASC
    ";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $week_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    echo json_encode([
        "success" => true,
        "orders" => $data
    ]);
    $stmt->close();
    $conn->close();
    exit();
}