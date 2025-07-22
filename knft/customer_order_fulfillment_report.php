<?php
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

// Fetch customers
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

// Fetch fulfilled orders
$orders = [];
foreach ($customers as $cid => $cname) {
    $orders[$cid] = [];
    $sql = "SELECT p.product AS product_full, o.quantity, o.date_time
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

// Excel Download
if (isset($_GET['download']) && $_GET['download'] == '1') {
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Customer Orders');
    $currentRow = 1;

    foreach ($customers as $cid => $cname) {
        $sheet->setCellValue('A' . $currentRow, $cname);
        $sheet->mergeCells('A' . $currentRow . ':C' . $currentRow);
        $sheet->getStyle('A' . $currentRow)->getFont()->setBold(true)->setSize(14);
        $currentRow++;

        // Headers
        $sheet->setCellValue('A' . $currentRow, 'Particulars');
        $sheet->setCellValue('B' . $currentRow, 'Qty');
        $sheet->setCellValue('C' . $currentRow, 'Date/Time');
        $sheet->getStyle('A' . $currentRow . ':C' . $currentRow)->getFont()->setBold(true);
        $sheet->getStyle('A' . $currentRow . ':C' . $currentRow)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        $currentRow++;

        $totalQty = 0;
        if (isset($orders[$cid])) {
            foreach ($orders[$cid] as $order) {
                $sheet->setCellValue('A' . $currentRow, $order['product_full']);
                $sheet->setCellValue('B' . $currentRow, $order['quantity']);
                $sheet->setCellValue('C' . $currentRow, $order['date_time']);
                $totalQty += floatval($order['quantity']);
                $sheet->getStyle('A' . $currentRow . ':C' . $currentRow)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
                $currentRow++;
            }
        }

        // Qty in Sale row (assuming opening stock is 0)
        $qtyInSale = 0 - $totalQty;
        $sheet->setCellValue('A' . $currentRow, 'Qty in Sale');
        $sheet->setCellValue('B' . $currentRow, $qtyInSale);
        $sheet->setCellValue('C' . $currentRow, '');
        $sheet->getStyle('A' . $currentRow . ':C' . $currentRow)->getFont()->setBold(true);
        $currentRow++;

        // Additional rows
        $sheet->setCellValue('A' . $currentRow, 'Do you want to get the delivery by auto ?');
        $sheet->mergeCells('A' . $currentRow . ':C' . $currentRow);
        $currentRow++;

        $sheet->setCellValue('A' . $currentRow, 'Select 1 for Yes (meaning, you are picking up from our godown)');
        $sheet->mergeCells('A' . $currentRow . ':C' . $currentRow);
        $currentRow++;

        $sheet->setCellValue('A' . $currentRow, 'Select 0 for No (meaning, you are picking your item from our vehicles)');
        $sheet->mergeCells('A' . $currentRow . ':C' . $currentRow);
        $currentRow++;

        $currentRow++;
    }

    $sheet->getColumnDimension('A')->setAutoSize(true);
    $sheet->getColumnDimension('B')->setAutoSize(true);
    $sheet->getColumnDimension('C')->setAutoSize(true);

    $writer = new Xlsx($spreadsheet);
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="customer_order_fulfillment_report.xlsx"');
    header('Cache-Control: max-age=0');
    $writer->save('php://output');
    $conn->close();
    exit;
}
?>

<!-- HTML UI -->
<form action="customer_order_fulfillment_report.php" method="get" style="margin-bottom:15px;">
    <button type="submit" name="download" value="1">Download Customer Order Fulfillment Report (Excel)</button>
</form>

<style>
    table { border-collapse: collapse; width: 100%; margin-bottom: 20px; }
    th, td { border: 1px solid #aaa; padding: 6px; }
    th { background: #f0f0f0; font-weight: bold; }
    .customer-section { margin-bottom: 30px; }
    .customer-name { font-weight: bold; font-size: 18px; margin-bottom: 10px; color: #333; }
</style>

<h2>Customer Order Fulfillment Report</h2>

<?php foreach ($customers as $cid => $cname): ?>
    <div class="customer-section">
        <?php
            $totalQty = 0;
            if (isset($orders[$cid])) {
                foreach ($orders[$cid] as $order) {
                    $totalQty += floatval($order['quantity']);
                }
            }
            $qtyInSale = 0 - $totalQty; 
        ?>
        <div class="customer-name">
            <?= htmlspecialchars($cname) ?> (Total Qty: <?= $totalQty ?>, Qty in Sale: <?= $qtyInSale ?>)
        </div>
        <table>
            <tr>
                <th>Particulars</th>
                <th>Qty</th>
                <th>Date/Time</th>
            </tr>
            <?php if (isset($orders[$cid])): ?>
                <?php foreach ($orders[$cid] as $order): ?>
                    <tr>
                        <td><?= htmlspecialchars($order['product_full']) ?></td>
                        <td><?= htmlspecialchars($order['quantity']) ?></td>
                        <td><?= htmlspecialchars($order['date_time']) ?></td>
                    </tr>
                <?php endforeach; ?>
            <?php endif; ?>
        </table>
    </div>
<?php endforeach; ?>

<?php $conn->close(); ?>
