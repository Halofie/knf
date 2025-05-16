<?php
require('header.php');

// Connect using MySQLi
$conn = new mysqli($host, $user, $pass, $dbname);

// Check connection
if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

// Fetch product details
$productResult = $conn->query("SELECT * FROM product");
$products = $productResult->fetch_all(MYSQLI_ASSOC);
if (empty($products)) die("No products found.");

// Prepare columns
$fixedColumns = [
    "`id` INT AUTO_INCREMENT PRIMARY KEY",
    "`Timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    "`Name` VARCHAR(100)",
    "`Contact_Number` VARCHAR(20)",
    "`Delivery_Pickup_Route` VARCHAR(100)"
];

$productMap = [];
$productColumns = [];
foreach ($products as $prod) {
    // Make sure product names don't collide
    $safeName = "prod_" . $prod['prod_id'] . "_" . preg_replace('/[^a-zA-Z0-9_]/', '_', $prod['product']);
    $productColumns[] = "`$safeName` INT DEFAULT 0";
    $productMap[$prod['prod_id']] = $safeName;
}

// Create finalorder table
$allColumns = array_merge($fixedColumns, $productColumns);
$conn->query("DROP TABLE IF EXISTS finalorder");
$conn->query("CREATE TABLE finalorder (" . implode(", ", $allColumns) . ")");

// Fetch customers
$customers = $conn->query("SELECT * FROM customers")->fetch_all(MYSQLI_ASSOC);
$routes = $conn->query("SELECT * FROM routes")->fetch_all(MYSQLI_ASSOC);
$lastWeek = $conn->query("SELECT * FROM week ORDER BY weekID DESC LIMIT 1")->fetch_assoc();
if (!$lastWeek) die("No week data found.");
$week_id = $lastWeek['weekID'];

// Initialize customerOrders array
$customerOrders = [];
foreach ($customers as $cust) {
    $customerOrders[$cust['customerID']] = []; // Default empty
}

// Get final order summary
$stmt = $conn->prepare("
    SELECT customer_id, product_id, SUM(quantity) AS total_quantity
    FROM final_order
    WHERE week_id = ?
    GROUP BY customer_id, product_id
");
$stmt->bind_param("i", $week_id);
$stmt->execute();
$result = $stmt->get_result();
$finalOrders = $result->fetch_all(MYSQLI_ASSOC);

// Map orders to customerOrders array
foreach ($finalOrders as $order) {
    $custId = $order['customer_id'];
    $col = $productMap[$order['product_id']];
    $customerOrders[$custId][$col] = (int)$order['total_quantity'];
}

// Insert into finalorder table
foreach ($customers as $cust) {
    $custId = $cust['customerID'];
    $stmt = $conn->prepare("SELECT route FROM routes WHERE id = ?");
    $stmt->bind_param("i", $cust['routeID']);
    $stmt->execute();
    $route_way = $stmt->get_result();
    $values = [
        'Name' => $cust['customerName'],
        'Contact_Number' => $cust['contact'],
        'Delivery_Pickup_Route' => $route_way->fetch_assoc()['route']
    ];
    foreach ($productMap as $col) {
        $values[$col] = $customerOrders[$custId][$col] ?? 0;
    }

    $columns = array_keys($values);
    $placeholders = implode(", ", array_fill(0, count($columns), '?'));

    // Dynamically determine types
    $types = '';
    foreach ($values as $val) {
        $types .= is_int($val) ? 'i' : 's';
    }

    $sql = "INSERT INTO finalorder (" . implode(", ", $columns) . ") VALUES ($placeholders)";
    $stmt = $conn->prepare($sql);

    // Proper binding using references
    $params = array_merge([$types], array_values($values));
    $tmp = [];
    foreach ($params as $key => $value) {
        $tmp[$key] = &$params[$key];
    }

    call_user_func_array([$stmt, 'bind_param'], $tmp);

    if (!$stmt->execute()) {
        error_log("Insert failed for customerID $custId: " . $stmt->error);
    }
}

// ✅ Output finalorder as CSV
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="finalorder.csv"');

$output = fopen('php://output', 'w');

// Fetch final data to export
$result = $conn->query("SELECT * FROM finalorder");
$rows = $result->fetch_all(MYSQLI_ASSOC);

if (!empty($rows)) {
    fputcsv($output, array_keys($rows[0]));
    foreach ($rows as $row) {
        fputcsv($output, $row);
    }
} else {
    fputcsv($output, ["No data found in finalorder"]);
}

fclose($output);
exit;
?>





/*<?php
$host = '127.0.0.1';
$dbname = 'knf';
$user = 'root';
$pass = '';

// Connect using MySQLi
$conn = new mysqli($host, $user, $pass, $dbname);

// Check connection
if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

// Fetch product details
$productResult = $conn->query("SELECT * FROM product");
$products = $productResult->fetch_all(MYSQLI_ASSOC);
if (empty($products)) die("No products found.");

// Prepare columns
$fixedColumns = [
    "`id` INT AUTO_INCREMENT PRIMARY KEY",
    "`Timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
    "`Name` VARCHAR(100)",
    "`Contact_Number` VARCHAR(20)",
    "`Delivery_Pickup_Route` VARCHAR(100)"
];

$productMap = [];
$productColumns = [];
foreach ($products as $prod) {
    $safeName = preg_replace('/[^a-zA-Z0-9_]/', '_', $prod['product']);
    $productColumns[] = "`$safeName` INT DEFAULT 0";
    $productMap[$prod['prod_id']] = $safeName;
}

// Create finalorder table
$allColumns = array_merge($fixedColumns, $productColumns);
$conn->query("DROP TABLE IF EXISTS finalorder");
$conn->query("CREATE TABLE finalorder (" . implode(", ", $allColumns) . ")");

// Fetch customers
$customers = $conn->query("SELECT * FROM customers")->fetch_all(MYSQLI_ASSOC);
$lastWeek = $conn->query("SELECT * FROM week ORDER BY weekID DESC LIMIT 1")->fetch_assoc();
$week_id = $lastWeek['weekID'];

// Get final order summary
$stmt = $conn->prepare("
    SELECT customer_id, product_id, SUM(quantity) AS total_quantity
    FROM final_order
    WHERE week_id = ?
    GROUP BY customer_id, product_id
");
$stmt->bind_param("i", $week_id);
$stmt->execute();
$result = $stmt->get_result();
$finalOrders = $result->fetch_all(MYSQLI_ASSOC);

$customerOrders = [];
foreach ($finalOrders as $order) {
    $custId = $order['customer_id'];
    $col = $productMap[$order['product_id']];
    $customerOrders[$custId][$col] = $order['total_quantity'];
}

// Insert into finalorder table
foreach ($customers as $cust) {
    $custId = $cust['customerID'];
    $values = [
        'Name' => $cust['customerName'],
        'Contact_Number' => $cust['contact'],
        'Delivery_Pickup_Route' => $cust['routeID']
    ];
    foreach ($productMap as $col) {
        $values[$col] = $customerOrders[$custId][$col] ?? 0;
    }

    $columns = array_keys($values);
    $placeholders = implode(", ", array_fill(0, count($columns), '?'));
    $types = str_repeat('s', count($values)); // Assume all strings for simplicity

    $sql = "INSERT INTO finalorder (" . implode(", ", $columns) . ") VALUES ($placeholders)";
    $stmt = $conn->prepare($sql);

    $bindParams = [];
    foreach ($values as $val) {
        $bindParams[] = &$val;
    }

    call_user_func_array([$stmt, 'bind_param'], array_merge([$types], $bindParams));
    $stmt->execute();
}

// ✅ Output finalorder as CSV
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="finalorder.csv"');

$output = fopen('php://output', 'w');

// Fetch final data to export
$result = $conn->query("SELECT * FROM finalorder");
$rows = $result->fetch_all(MYSQLI_ASSOC);

if (!empty($rows)) {
    fputcsv($output, array_keys($rows[0]));
    foreach ($rows as $row) {
        fputcsv($output, $row);
    }
} else {
    fputcsv($output, ["No data found in finalorder"]);
}

fclose($output);
exit;
?> 
*/