<?php
require 'vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

function fetchOrders() {
    // Replace with your database connection details
    $conn = new mysqli('localhost', 'root', '', 'knf');

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $sql = "
        SELECT 
            o.id, 
            o.date_time AS Timestamp, 
            c.customerName AS Name,
            c.contact AS Contact_Number,
            r.route AS Delivery_Pickup_Route,
            p.product AS Product_Name, 
            o.quantity,
            o.rate,
            o.total_cost, 
            o.route_id
        FROM 
            final_order o
        JOIN 
            customers c ON o.customer_id = c.customerID
        JOIN 
            product p ON o.product_id = p.prod_id
        JOIN 
            routes r ON o.route_id = r.id
    ";

    $result = $conn->query($sql);

    $orders = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }
    }
    $conn->close();
    return $orders;
}

function generateExcel($orders) {
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // Set headers
    $headers = [
        'id', 'Timestamp', 'Name', 'Contact_Number', 'Delivery_Pickup_Route', 'Product_Name', 
        'quantity', 'rate', 'total_cost', 'route_id'
    ];

    $col = 0;
    foreach ($headers as $header) {
        $sheet->setCellValueByColumnAndRow($col, 1, $header);
        $col++;
    }

    // Add data
    $row = 2;
    foreach ($orders as $order) {
        $col = 0;
        foreach ($headers as $header) {
            if (isset($order[$header])) {
                $sheet->setCellValueByColumnAndRow($col, $row, $order[$header]);
            } else {
                $sheet->setCellValueByColumnAndRow($col, $row, '');
            }
            $col++;
        }
        $row++;
    }

    // Set headers to force download
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="orders.xlsx"');
    header('Cache-Control: max-age=0');

    // Save Excel file to output
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}

$orders = fetchOrders();
generateExcel($orders);
?>