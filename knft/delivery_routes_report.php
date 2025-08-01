<?php
require('header.php');
require_once 'vendor/autoload.php'; // Make sure PhpSpreadsheet is installed via Composer

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$latestWeekIdQuery = "SELECT weekID, weekDate FROM week ORDER BY weekID DESC LIMIT 1";
$result = $conn->query($latestWeekIdQuery);

if ($result && $row = $result->fetch_assoc()) {
    $latestWeekId = $row['weekID'];
    $thatWeekDate = date('Y-m-d', strtotime($row['weekDate']));
} else {
    die("Could not fetch latest week id");
}

// Create new Spreadsheet object
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Fetch routes
$route_sql = "SELECT id, route, deliveryType, rate FROM routes WHERE rec_status = 1 ORDER BY route";
$route_result = $conn->query($route_sql);

$row = 1;
$max_columns = 1; // Track maximum columns used

// Step 1: Build customer-to-route count map for the latest week
$customerRouteCount = [];
$customerRouteSql = "
    SELECT c.customerName, COUNT(DISTINCT f.route_id) as route_count
    FROM final_order f
    JOIN customers c ON f.customer_id = c.customerID
    WHERE c.rec_status = 1
      AND f.week_id = {$latestWeekId}
    GROUP BY c.customerName
";
$customerRouteResult = $conn->query($customerRouteSql);
while ($crRow = $customerRouteResult->fetch_assoc()) {
    $customerRouteCount[$crRow['customerName']] = $crRow['route_count'];
}

if ($route_result->num_rows > 0) {
    while ($route = $route_result->fetch_assoc()) {
        // Fetch unique customers for this route/deliveryType who ordered in the latest week
        $cust_sql = "
            SELECT DISTINCT c.customerName
            FROM final_order f
            JOIN customers c ON f.customer_id = c.customerID
            WHERE f.route_id = {$route['id']}
              AND c.rec_status = 1
              AND f.week_id = {$latestWeekId}
            ORDER BY c.customerName
        ";
        $cust_result = $conn->query($cust_sql);

        $customers = [];
        while ($cust = $cust_result->fetch_assoc()) {
            $name = $cust['customerName'];
            // Step 2: Mark customer if they ordered for multiple routes
            if (isset($customerRouteCount[$name]) && $customerRouteCount[$name] > 1) {
                $name .= ' *';
            }
            $customers[] = $name;
        }

        // Create route display with deliveryType
        $route_display = $route['route'] . ' - ' . $route['deliveryType'];

        // Set route in column A
        $sheet->setCellValue('A' . $row, $route_display);

        // Set rate in column B with rupees symbol
        $sheet->setCellValue('B' . $row, '₹ ' . $route['rate']);

        // Set each customer in separate columns (C, D, E, etc.)
        $col = 3; // Starting from column C (3)
        foreach ($customers as $customer) {
            $sheet->setCellValueByColumnAndRow($col, $row, $customer);
            $col++;
        }

        // Track maximum columns used
        $max_columns = max($max_columns, $col - 1);

        $row++;
    }
}

for ($col = 1; $col <= $max_columns; $col++) {
    $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
    $sheet->getColumnDimension($columnLetter)->setAutoSize(true);
}

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment;filename="delivery_route_report_' . $thatWeekDate . '.xlsx"');
header('Cache-Control: max-age=0');


// Write file to output
$writer = new Xlsx($spreadsheet);
$writer->save('php://output');

$conn->close();