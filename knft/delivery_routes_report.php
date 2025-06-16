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
$route_sql = "SELECT id, route, deliveryType FROM routes WHERE rec_status = 1 ORDER BY route";
$route_result = $conn->query($route_sql);

$row = 1;
$max_columns = 1; // Track maximum columns used

if ($route_result->num_rows > 0) {
    while ($route = $route_result->fetch_assoc()) {
        // Fetch customers for this route who ordered in the latest week
        $cust_sql = "
            SELECT DISTINCT c.customerName
            FROM final_order f
            JOIN customers c ON f.customer_id = c.customerID
            WHERE c.routeID = {$route['id']}
              AND c.rec_status = 1
              AND f.week_id = {$latestWeekId}
            ORDER BY c.customerName
        ";
        $cust_result = $conn->query($cust_sql);

        $customers = [];
        while ($cust = $cust_result->fetch_assoc()) {
            $customers[] = $cust['customerName'];
        }

        // Create route display with deliveryType
        $route_display = $route['deliveryType'] . ' - ' . $route['route'];

        // Set route in column A
        $sheet->setCellValue('A' . $row, $route_display);

        // Set each customer in separate columns (B, C, D, etc.)
        $col = 2; // Starting from column B (2)
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