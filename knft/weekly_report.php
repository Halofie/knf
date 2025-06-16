<?php
require('header.php');
require 'vendor/autoload.php'; // Make sure this path is correct

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Fetch the latest week
$week_sql = "SELECT weekID, weekdate FROM week ORDER BY weekdate DESC LIMIT 1";
$week_res = $conn->query($week_sql);

if ($week_res && $week_res->num_rows > 0) {
    $week_row = $week_res->fetch_assoc();
    $weekID = $week_row['weekID'];
    $weekdate = $week_row['weekdate'];

    // Fetch customers who placed orders in the latest week, with route info
    $sql = "SELECT c.customerName, c.contact, r.deliveryType, r.route
            FROM final_order f
            JOIN customers c ON f.customer_id = c.customerID
            LEFT JOIN routes r ON c.routeID = r.id
            WHERE f.week_id = '$weekID'
            GROUP BY c.customerID
            ORDER BY c.customerName ASC";
    $result = $conn->query($sql);

    // Create Spreadsheet
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // Set title
    $title = "Delivery " . $weekdate;
    $sheet->setCellValue('A1', $title);
    // Merge title across columns A-E
    $sheet->mergeCells('A1:E1');
    // Center the title
    $sheet->getStyle('A1')->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
    // Style title: bold and bigger font
    $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(16);

    // Set header (start from row 2)
    $sheet->setCellValue('A2', 'S.no');
    $sheet->setCellValue('B2', 'Tray No');
    $sheet->setCellValue('C2', 'Name');
    $sheet->setCellValue('D2', 'Phone Number');
    $sheet->setCellValue('E2', 'Delivery/PickUp HUB on below route');
    // Make header bold
    $sheet->getStyle('A2:E2')->getFont()->setBold(true);

    foreach (range('A', 'E') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }

    // Fill data
    $rowNum = 3;
    $sno = 1;
    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $routeInfo = '';
            if (!empty($row['deliveryType']) && !empty($row['route'])) {
                $routeInfo = $row['deliveryType'] . ' - ' . $row['route'];
            }
            $sheet->setCellValue('A' . $rowNum, $sno);
            $sheet->setCellValue('B' . $rowNum, ''); // Tray No blank
            $sheet->setCellValue('C' . $rowNum, $row['customerName']);
            $sheet->setCellValue('D' . $rowNum, $row['contact']);
            $sheet->setCellValue('E' . $rowNum, $routeInfo);
            $rowNum++;
            $sno++;
        }
    }

    // Output to browser as XLSX
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="Delivery_Report_Week_'.$weekdate.'.xlsx"');
    header('Cache-Control: max-age=0');

    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
} else {
    echo "No week data found.";
}

$conn->close();
?>