<?php
$host = 'localhost';
$dbname = 'knf';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Fetch product details
    $stmt = $pdo->query("SELECT * FROM product");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (empty($products)) die("No products found.");

    // Prepare column structure
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

    $allColumns = array_merge($fixedColumns, $productColumns);
    $pdo->exec("DROP TABLE IF EXISTS finalorder");
    $pdo->exec("CREATE TABLE finalorder (" . implode(", ", $allColumns) . ")");

    // Fetch customers
    $customers = $pdo->query("SELECT * FROM customers")->fetchAll(PDO::FETCH_ASSOC);
    $lastWeek = $pdo->query("SELECT * FROM week ORDER BY weekID DESC LIMIT 1")->fetch(PDO::FETCH_ASSOC);
    $week_id = $lastWeek['weekID'];

    // Final order summary
    $stmt = $pdo->prepare("
        SELECT customer_id, product_id, SUM(quantity) AS total_quantity
        FROM final_order
        WHERE week_id = :week_id
        GROUP BY customer_id, product_id
    ");
    $stmt->execute(['week_id' => $week_id]);
    $finalOrders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $customerOrders = [];
    foreach ($finalOrders as $order) {
        $custId = $order['customer_id'];
        $col = $productMap[$order['product_id']];
        $customerOrders[$custId][$col] = $order['total_quantity'];
    }

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
        $placeholders = array_map(fn($col) => ":$col", $columns);

        $sql = "INSERT INTO finalorder (" . implode(", ", $columns) . ") VALUES (" . implode(", ", $placeholders) . ")";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
    }

    // ✅ Step: Download finalorder as CSV
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="finalorder.csv"');

    $output = fopen('php://output', 'w');

    // Fetch final data to export
    $stmt = $pdo->query("SELECT * FROM finalorder");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Output header
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

} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
