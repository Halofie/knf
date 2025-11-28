<?php
require('header.php');

// Allow either admin users (existing admin flow) OR customers (role 'C') to access this endpoint.
// The original `auth_check.php` enforces admin-only access and CSRF checks which blocks the
// customer-facing order placement. For the customer portal we allow session role 'C'.
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// If user is not an admin and not a customer, deny access.
$isAdmin = isset($_SESSION['is_admin']) && $_SESSION['is_admin'] === true;
$isCustomer = isset($_SESSION['role']) && $_SESSION['role'] === 'C';
if (!($isAdmin || $isCustomer)) {
    header('Content-Type: application/json');
    http_response_code(403);
    exit(json_encode(['error' => 'Access Denied: You do not have permission to access this resource.']));
}

// Note: we intentionally do not enforce the CSRF requirement from `auth_check.php` here
// for the customer-facing flow because the customer front-end does not currently send
// a CSRF token header. If you want stricter protections, add a CSRF token exchange
// between the front-end and session and validate it here.

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Validate JSON format
if (json_last_error() !== JSON_ERROR_NONE) {
    header('Content-Type: application/json');
    http_response_code(400);
    exit(json_encode(['error' => 'Invalid JSON format']));
}

// Validate required fields exist
if (!isset($data['week_id']) || !isset($data['customer_id']) || !isset($data['routeId']) || !isset($data['items'])) {
    header('Content-Type: application/json');
    http_response_code(400);
    exit(json_encode(['error' => 'Missing required fields']));
}

// Validate items is an array and not empty
if (!is_array($data['items']) || empty($data['items'])) {
    header('Content-Type: application/json');
    http_response_code(400);
    exit(json_encode(['error' => 'Order must contain at least one item']));
}

// Log received data for debugging
error_log("submitOrder.php - Received data: " . print_r($data, true));

$week_id = $data['week_id'];
$customer_id = $data['customer_id'];
$routeId = $data['routeId'];
$note = $data['note'] ?? ''; // Get note from JSON data, NULL if not provided

$error_messages = [];
    // Step 3: Get route rate from routes table
$routeRateSQL = "SELECT rate FROM routes WHERE id = ?";
$stmt = $conn->prepare($routeRateSQL);
$stmt->bind_param("i", $routeId);
$stmt->execute();
$stmt->bind_result($route_rate);
$stmt->fetch();
$stmt->close();
// First insert into orders table to get order ID (only once)
$sql_orders = "INSERT INTO orders (cust_id, weekId, routeid, routerate) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql_orders);
$stmt->bind_param("iiid", $customer_id, $week_id, $routeId, $route_rate);
if (!$stmt->execute()) {
    echo json_encode(["error" => "Error creating order: " . $stmt->error]);
    $stmt->close();
    $conn->close();
    exit;
}
$order_id = $conn->insert_id;
$stmt->close();

// Insert note into notes table
if (!empty($note)) {
    $sql_note = "INSERT INTO notes (cust_id, weekId, orderId, note) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql_note);
    $stmt->bind_param("iiis", $customer_id, $week_id, $order_id, $note);
    if (!$stmt->execute()) {
        echo json_encode(["error" => "Error adding note: " . $stmt->error]);
        $stmt->close();
        $conn->close();
        exit;
    }
    $stmt->close();
}

$total_order_cost = 0; // Initialize total order cost

foreach ($data["items"] as $product) {
    $product_id = intval($product['product_id']);
    $quantity = floatval($product['quantity']);  // Explicitly convert to float to preserve decimals
    $rate = floatval($product['price']);
    $tc = floatval($product['total']);

    // DEBUG: Log each product's quantity to verify decimal preservation
    error_log("Product ID: $product_id, Quantity: $quantity (raw: {$product['quantity']}), Rate: $rate, Total: $tc");

    // Step 1: Get UoM for this product
    $unitCheckSQL = "SELECT UoM_id FROM product WHERE prod_id = ?";
    $stmt = $conn->prepare($unitCheckSQL);
    $stmt->bind_param("i", $product_id);
    $stmt->execute();
    $stmt->bind_result($uom);
    $stmt->fetch();
    $stmt->close();

    // Step 2: Validate for 'nos' that quantity is an integer
    if (strtolower($uom) === 'nos' && floor($quantity) != $quantity) {
        echo json_encode(["error" => "Decimal quantity not allowed for this product."]);
        $conn->close();
        exit;
    }

    // Step 4: Insert into final_order with order_id
        $sql_final_order = "INSERT INTO final_order (orderId, week_id, customer_id, product_id, quantity, route_id, route_rate, date_time, rate, total_cost)
                            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)";
        $stmt = $conn->prepare($sql_final_order);
        $stmt->bind_param("iiidddddd", $order_id, $week_id, $customer_id, $product_id, $quantity, $routeId, $route_rate, $rate, $tc);
        if ($stmt->execute()) {
            $stmt->close();
            
    // Step 6: Insert into order_fulfillment with order_id
        $sql_order_fulfillment = "INSERT INTO order_fulfillment (orderId, week_id, customer_id, product_id, quantity, route_id, route_rate, date_time, rate, total_cost)
                                VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)";
        $stmt2 = $conn->prepare($sql_order_fulfillment);
        $stmt2->bind_param("iiidddddd", $order_id, $week_id, $customer_id, $product_id, $quantity, $routeId, $route_rate, $rate, $tc);
        if ($stmt2->execute()) {
            $stmt2->close();
            $updateSql = "UPDATE temp_inventory SET quantity = quantity - ? WHERE weekID = ? AND product_id = ? "; 
                          //AND quantity >= ? if u want restrict stock/ -ve inventory
            $stmt3 = $conn->prepare($updateSql);
            $stmt3->bind_param("dii", $quantity, $week_id, $product_id);
            if ($stmt3->execute()) {
                if ($stmt3->affected_rows == 0) {
                    $error_messages[] = "Stock update failed or insufficient stock for product ID '$product_id'.";
                }
            } else {
                echo json_encode("Error updating temp_inventory: " . $stmt3->error);
                $stmt3->close();
                $conn->close();
                exit;
            }
            $stmt3->close();
            $total_order_cost += $tc; // Add this product's total to order total
        } else {
            echo json_encode("Error: " . $stmt2->error);
            $stmt2->close();
            $conn->close();
            exit;
        }
    } else {
        echo json_encode("Error: " . $stmt->error);
        $stmt->close();
        $conn->close();
        exit;
    }
}

// Update orders table with total cost
$update_order_sql = "UPDATE orders SET item_total = ? WHERE orderId = ?";
$stmt = $conn->prepare($update_order_sql);
$stmt->bind_param("di", $total_order_cost, $order_id);
if (!$stmt->execute()) {
    echo json_encode(["error" => "Error updating order total: " . $stmt->error]);
    $stmt->close();
    $conn->close();
    exit;
}
$stmt->close();

$conn->close();
header('Content-Type: application/json');

if (!empty($error_messages)) {
    echo json_encode(["warning" => $error_messages]);
} else {
    echo json_encode(["success" => "Order placed successfully."]);
}
?>
