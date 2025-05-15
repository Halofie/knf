<?php
require('header.php');

// Database Connection
$host = '127.0.0.1';
$dbname = 'knf';
$user = 'root';
$pass = '';

$conn = new mysqli($host, $user, $pass, $dbname);
if ($conn->connect_error) {
    die("❌ Connection failed: " . $conn->connect_error);
}

// Fetch Product Details
$productResult = $conn->query("SELECT * FROM product");
$products = $productResult->fetch_all(MYSQLI_ASSOC);
if (empty($products)) die("No products found.");

// Prepare Columns for finalorder Table
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
    // Sanitize product names to avoid SQL issues
    $safeName = preg_replace('/[^a-zA-Z0-9_]/', '_', $prod['product']);
    $productColumns[] = "`$safeName` INT DEFAULT 0";
    $productMap[$prod['prod_id']] = $safeName;
}

// Create finalorder Table
$allColumns = array_merge($fixedColumns, $productColumns);
$conn->query("DROP TABLE IF EXISTS finalorder");
$conn->query("CREATE TABLE finalorder (" . implode(", ", $allColumns) . ")");

// Fetch Customers
$customers = $conn->query("SELECT * FROM customers")->fetch_all(MYSQLI_ASSOC);
$lastWeek = $conn->query("SELECT * FROM week ORDER BY weekID DESC LIMIT 1")->fetch_assoc();
if (!$lastWeek) die("No week data found.");
$week_id = $lastWeek['weekID'];

// Initialize customerOrders Array
$customerOrders = [];
foreach ($customers as $cust) {
    $customerOrders[$cust['customerID']] = [];
}

// Get Final Order Summary
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

// Map Orders to customerOrders Array
foreach ($finalOrders as $order) {
    $custId = $order['customer_id'];
    $prodId = $order['product_id'];
    
    // Skip if product ID is missing in map
    if (!isset($productMap[$prodId])) continue;
    
    // Initialize customer data if not already set
    if (!isset($customerOrders[$custId])) {
        $customerOrders[$custId] = [];
    }
    
    // Map the order quantity
    $col = $productMap[$prodId];
    $customerOrders[$custId][$col] = (int)$order['total_quantity'];
}

// Insert into finalorder Table
foreach ($customers as $cust) {
    $custId = $cust['customerID'];

    // Fetch Route for Customer
    $routeStmt = $conn->prepare("SELECT route FROM routes WHERE id = ?");
    $routeStmt->bind_param("i", $cust['routeID']);
    $routeStmt->execute();
    $routeData = $routeStmt->get_result()->fetch_assoc();
    $route = $routeData ? $routeData['route'] : 'Unknown Route';

    // Prepare Data for Insert
    $values = [
        'Name' => $cust['customerName'],
        'Contact_Number' => $cust['contact'],
        'Delivery_Pickup_Route' => $route
    ];
    foreach ($productMap as $col) {
        $values[$col] = $customerOrders[$custId][$col] ?? 0;
    }

    // Prepare Insert Query
    $columns = array_keys($values);
    $placeholders = implode(", ", array_fill(0, count($columns), '?'));
    $types = '';
    foreach ($values as $val) {
        $types .= is_int($val) ? 'i' : 's';
    }

    $sql = "INSERT INTO finalorder (" . implode(", ", $columns) . ") VALUES ($placeholders)";
    $stmt = $conn->prepare($sql);

    // Proper Binding
    $params = array_merge([$types], array_values($values));
    $tmp = [];
    foreach ($params as $key => $value) {
        $tmp[$key] = &$params[$key];
    }
    call_user_func_array([$stmt, 'bind_param'], $tmp);

    if (!$stmt->execute()) {
        error_log("❌ Insert failed for customerID $custId: " . $stmt->error);
    }
}

// Fetch Final Data for Export
$result = $conn->query("SELECT * FROM finalorder");
$rows = $result->fetch_all(MYSQLI_ASSOC);

// Remove columns where all values are zero
if (!empty($rows)) {
    // Get all columns
    $allColumns = array_keys($rows[0]);
    
    // Find zero-only columns (except fixed columns)
    $fixedCols = ['id', 'Timestamp', 'Name', 'Contact_Number', 'Delivery_Pickup_Route'];
    $zeroColumns = [];
    
    foreach ($allColumns as $col) {
        if (in_array($col, $fixedCols)) continue; // never remove fixed columns

        $allZero = true;
        foreach ($rows as $row) {
            if ((int)$row[$col] !== 0) {
                $allZero = false;
                break;
            }
        }
        if ($allZero) {
            $zeroColumns[] = $col;
        }
    }

    // Remove zero-only columns from rows
    foreach ($rows as &$row) {
        foreach ($zeroColumns as $col) {
            unset($row[$col]);
        }
    }
    unset($row); // break reference

    // Also remove zero-only columns from header
    $finalHeaders = array_diff($allColumns, $zeroColumns);
} else {
    $finalHeaders = [];
}

// Output CSV
header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="finalorder.csv"');

$output = fopen('php://output', 'w');

if (!empty($rows)) {
    // Write headers
    fputcsv($output, $finalHeaders);

    // Write rows with final headers order
    foreach ($rows as $row) {
        $line = [];
        foreach ($finalHeaders as $col) {
            $line[] = $row[$col] ?? '';
        }
        fputcsv($output, $line);
    }
} else {
    fputcsv($output, ["No data found in finalorder"]);
}

fclose($output);
exit;
?>
