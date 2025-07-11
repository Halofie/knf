<?php
// First, you need to install PhpSpreadsheet via Composer:
// composer require phpoffice/phpspreadsheet

require_once 'vendor/autoload.php';
require('header.php');

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Style\Border;

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8");

// Fetch all customers with fulfilled orders
$customers = [];
$sql = "SELECT DISTINCT c.customerID, c.customerName 
        FROM order_fulfillment o
        JOIN customers c ON o.customer_id = c.customerID
        WHERE o.rec_status = 1
        ORDER BY c.customerName";
$result = $conn->query($sql);
while ($row = $result->fetch_assoc()) {
    $customers[$row['customerID']] = $row['customerName'];
}

// Fetch fulfilled orders for each customer
$orders = [];
foreach ($customers as $cid => $cname) {
    $sql = "SELECT p.product AS product_full, o.quantity 
        FROM order_fulfillment o
        JOIN product p ON o.product_id = p.prod_id
        WHERE o.customer_id = ? AND o.rec_status = 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $cid);
    $stmt->execute();
    $res = $stmt->get_result();
    while ($row = $res->fetch_assoc()) {
        $orders[$cid][] = $row;
    }
    $stmt->close();
}

// Handle Excel download with PhpSpreadsheet
if (isset($_GET['download']) && $_GET['download'] == '1') {
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Customer Orders');
    
    $currentRow = 1;
    
    foreach ($customers as $cid => $cname) {
        // Customer name (bold, larger font)
        $sheet->setCellValue('A' . $currentRow, $cname);
        $sheet->mergeCells('A' . $currentRow . ':B' . $currentRow);
        $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true)->setSize(14);
        $currentRow++;
        
        // Headers
        $sheet->setCellValue('A' . $currentRow, 'Particulars');
        $sheet->setCellValue('B' . $currentRow, 'Qty');
        $sheet->getStyle('A' . $currentRow . ':B' . $currentRow)->getFont()->setBold(true);
        $sheet->getStyle('A' . $currentRow . ':B' . $currentRow)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        $currentRow++;
        
        // Order data
        if (isset($orders[$cid])) {
            foreach ($orders[$cid] as $order) {
                $sheet->setCellValue('A' . $currentRow, $order['product_full']);
                $sheet->setCellValue('B' . $currentRow, $order['quantity']);
                $sheet->getStyle('A' . $currentRow . ':B' . $currentRow)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
                $currentRow++;
            }
        }
        
        // Delivery questions
        $sheet->setCellValue('A' . $currentRow, 'Do you want to get the delivery by auto ?');
        $sheet->mergeCells('A' . $currentRow . ':B' . $currentRow);
        $currentRow++;
        
        $sheet->setCellValue('A' . $currentRow, 'Select 1 for Yes (meaning, you are picking up from our godown)');
        $sheet->mergeCells('A' . $currentRow . ':B' . $currentRow);
        $currentRow++;
        
        $sheet->setCellValue('A' . $currentRow, 'Select 0 for No (meaning, you are picking your item from our vehicles)');
        $sheet->mergeCells('A' . $currentRow . ':B' . $currentRow);
        $currentRow++;
        
        // Empty row between customers
        $currentRow++;
    }
    
    // Auto-size columns
    $sheet->getColumnDimension('A')->setAutoSize(true);
    $sheet->getColumnDimension('B')->setAutoSize(true);
    
    // Generate and download the file
    $writer = new Xlsx($spreadsheet);
    
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="customer_order_fulfillment_report.xlsx"');
    header('Cache-Control: max-age=0');
    
    $writer->save('php://output');
    
    $conn->close();
    exit;
}

// Find max rows needed for HTML display
$maxRows = 0;
foreach ($orders as $orderList) {
    $maxRows = max($maxRows, count($orderList));
}

// HTML output
?>
<!-- Download Button -->
<form action="customer_order_fulfillment_report.php" method="get" style="margin-bottom:15px;">
    <button type="submit" name="download" value="1">Download Customer Order Fulfillment Report (Excel)</button>
</form>

<style>
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #aaa; padding: 6px; }
    th { background: #f0f0f0; font-weight: bold !important; }
    .customer-section { margin-bottom: 30px; }
    .customer-name { 
        font-weight: bold !important; 
        font-size: 18px; 
        margin-bottom: 10px; 
        color: #333;
    }
    .particulars-header, .qty-header { 
        font-weight: bold !important; 
    }
</style>

<h2>Customer Order Fulfillment Report</h2>

<?php foreach ($customers as $cid => $cname): ?>
    <div class="customer-section">
        <div class="customer-name" style="font-weight: bold; font-size: 18px; margin-bottom: 10px;"><?php echo htmlspecialchars($cname); ?></div>
        <table>
            <tr>
                <th class="particulars-header" style="font-weight: bold;">Particulars</th>
                <th class="qty-header" style="font-weight: bold;">Qty</th>
            </tr>
            <?php if (isset($orders[$cid])): ?>
                <?php foreach ($orders[$cid] as $order): ?>
                    <tr>
                        <td><?php echo htmlspecialchars($order['product_full']); ?></td>
                        <td><?php echo htmlspecialchars($order['quantity']); ?></td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </table>
    </div>
<?php endforeach; ?>

<?php
$conn->close();
?>