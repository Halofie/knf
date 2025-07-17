<?php
require('header.php');
require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$weekRes = $conn->query("SELECT weekID, weekdate FROM week ORDER BY weekdate DESC LIMIT 1");
$week = $weekRes->fetch_assoc();
$week_id = $week['weekID'];
$weekdate = $week['weekdate'];

$products = [];
$pRes = $conn->query("SELECT prod_id, product, price FROM product");
while ($row = $pRes->fetch_assoc()) {
    $products[$row['prod_id']] = $row;
}

$customers = [];
$cRes = $conn->query("SELECT DISTINCT customer_id FROM final_order WHERE week_id = $week_id ORDER BY customer_id");
while ($row = $cRes->fetch_assoc()) {
    $customers[] = $row['customer_id'];
}

$customerNames = [];
if (!empty($customers)) {
    $idList = implode(",", $customers);
    $cres = $conn->query("SELECT customerID, customerName FROM customers WHERE customerID IN ($idList)");
    while ($row = $cres->fetch_assoc()) {
        $customerNames[$row['customerID']] = $row['customerName'];
    }
}

$productIDs = [];
$productFarmerRes = $conn->query("SELECT DISTINCT product_id FROM inventory WHERE weekId = $week_id");
while ($row = $productFarmerRes->fetch_assoc()) {
    $productIDs[] = $row['product_id'];
}

$inventoryRows = [];

foreach ($productIDs as $product_id) {
    $farmerRank = [];
    $rankRes = $conn->query("SELECT farmer_id, `rank` FROM farmer_rank WHERE prod_id = $product_id ORDER BY `rank` ASC");
    while ($row = $rankRes->fetch_assoc()) {
        $fid = $row['farmer_id'];
        $invRes = $conn->query("SELECT SUM(quantity) as qty FROM inventory WHERE weekId = $week_id AND product_id = $product_id AND Farmer_id = $fid");
        $invRow = $invRes->fetch_assoc();
        $available = $invRow && $invRow['qty'] !== null ? floatval($invRow['qty']) : 0.0;

        $farmerRank[] = [
            'farmer_id' => $fid,
            'rank' => $row['rank'],
            'available' => $available
        ];
    }

    $orders = [];
    $orderRes = $conn->query("SELECT id, customer_id, quantity FROM final_order WHERE week_id = $week_id AND product_id = $product_id ORDER BY id ASC");
    while ($row = $orderRes->fetch_assoc()) {
        $orders[] = $row;
    }

    foreach ($orders as $order) {
        $qtyNeeded = floatval($order['quantity']);
        $customer_id = $order['customer_id'];

        foreach ($farmerRank as &$fr) {
            if ($qtyNeeded <= 0) break;

            $take = min($qtyNeeded, $fr['available']);
            if ($take > 0) {
                $inventoryRows[] = [
                    'product_id' => $product_id,
                    'farmer_id' => $fr['farmer_id'],
                    'customer_id' => $customer_id,
                    'allocated' => $take
                ];
                $fr['available'] -= $take;
                $qtyNeeded -= $take;
            }
        }
    }
}

$displayData = [];
foreach ($inventoryRows as $row) {
    $key = $row['farmer_id'] . '_' . $row['product_id'];
    if (!isset($displayData[$key])) {
        $displayData[$key] = [
            'farmer_id' => $row['farmer_id'],
            'product_id' => $row['product_id'],
            'customer_allocated' => [],
            'total_allocated' => 0
        ];
    }
    $displayData[$key]['customer_allocated'][$row['customer_id']] =
        ($displayData[$key]['customer_allocated'][$row['customer_id']] ?? 0) + $row['allocated'];
    $displayData[$key]['total_allocated'] += $row['allocated'];
}

$farmerNames = [];
$farmerIds = array_unique(array_column($displayData, 'farmer_id'));
if (!empty($farmerIds)) {
    $idList = implode(",", $farmerIds);
    $res = $conn->query("SELECT supplierID, supplierName FROM suppliers WHERE supplierID IN ($idList)");
    while ($row = $res->fetch_assoc()) {
        $farmerNames[$row['supplierID']] = $row['supplierName'];
    }
}

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

$title = "Weekly Invoice Report " . $weekdate;
$sheet->setCellValue('A1', $title);
$sheet->mergeCells('A1:' . chr(71 + count($customers)) . '1');
$sheet->getStyle('A1')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
$sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);

$headers = [
    'Product', 'Price', 'Qty Assigned', 'Qty in Hand', 'Qty in Sale', 'Total Amount To Be Recieved', 'Farmer'
];

// Calculate total amount for each customer
$customerTotals = [];
foreach ($customers as $cid) {
    $total_sql = "SELECT SUM(fo.quantity * p.price) AS total_amount
                  FROM final_order fo
                  JOIN product p ON fo.product_id = p.prod_id
                  WHERE fo.customer_id = $cid AND fo.week_id = $week_id";
    $total_res = $conn->query($total_sql);
    $total_amount = 0;
    if ($total_res && $total_row = $total_res->fetch_assoc()) {
        $total_amount = $total_row['total_amount'] ? $total_row['total_amount'] : 0;
    }
    $customerTotals[$cid] = $total_amount;
}

// Add customer name with total amount to header
foreach ($customers as $cid) {
    $name = $customerNames[$cid] ?? $cid;
    $amt = $customerTotals[$cid];
    $headers[] = $name . " (₹" . $amt . ")";
}
$sheet->fromArray($headers, null, 'A2');
$sheet->getStyle('A2:' . chr(64 + count($headers)) . '2')->getFont()->setBold(true);

// Shift data rows down by 1 (start from row 4)
$rowNum = 3;
foreach ($displayData as $entry) {
    $product_id = $entry['product_id'];
    $farmer_id = $entry['farmer_id'];
    $prod = $products[$product_id] ?? ['product' => 'Unknown', 'price' => 0];
    $price = $prod['price'];

    $invRes = $conn->query("SELECT SUM(quantity) as qty_assigned FROM inventory WHERE weekId = $week_id AND product_id = $product_id AND Farmer_id = $farmer_id");
    $invRow = $invRes->fetch_assoc();
    $qty_assigned = $invRow && $invRow['qty_assigned'] !== null ? floatval($invRow['qty_assigned']) : 0.0;

    $fpaRes = $conn->query("SELECT SUM(assigned_quantity) as qty_in_hand FROM farmer_product_assignments WHERE week_id = $week_id AND product_id = $product_id AND assigned_farmer_id = $farmer_id");
    $fpaRow = $fpaRes->fetch_assoc();
    $qty_in_hand = $fpaRow && $fpaRow['qty_in_hand'] !== null ? floatval($fpaRow['qty_in_hand']) : 0.0;
    $qty_in_sale = $qty_assigned - $qty_in_hand;

    // Total Amount To Be Received: (Qty Assigned - Qty in Hand) * Price
    $total_amount_to_be_received = ($qty_assigned - $qty_in_sale) * floatval($price);

    $farmerName = $farmerNames[$farmer_id] ?? $farmer_id;

    $row = [
        $prod['product'],
        floatval($price),
        $qty_assigned,
        $qty_in_sale,      // "Qty in Hand" column (swapped)
        -1 * $qty_in_hand, // "Qty in Sale" column (swapped)
        $total_amount_to_be_received,
        $farmerName
    ];
    foreach ($customers as $cid) {
        $row[] = isset($entry['customer_allocated'][$cid]) ? floatval($entry['customer_allocated'][$cid]) : '';
    }
    $sheet->fromArray($row, null, 'A' . $rowNum++);
}

for ($col = 'A'; $col <= chr(64 + count($headers)); $col++) {
    $sheet->getColumnDimension($col)->setAutoSize(true);
}

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment;filename="Weekly_Invoice_Report_' . $weekdate . '.xlsx"');
header('Cache-Control: max-age=0');
$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
?>
$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
?>
