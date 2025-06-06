<?php
require('header.php');

// Connect to MySQL database
$con = mysqli_connect($servername, $username, $password, $dbname);
if (mysqli_connect_errno()) {
    error_log('Failed to connect to MySQL: ' . mysqli_connect_error());
    header("Location: ../login/login.html?error=server");
    exit();
}

// Check if login form data was submitted
if (!isset($_POST['username'], $_POST['password'])) {
    header("Location: ../login/login.html?error=missing");
    exit();
}

$submitted_username = $_POST['username'];
$submitted_password = $_POST['password'];

// Validate email address
if (!filter_var($submitted_username, FILTER_VALIDATE_EMAIL)) {
    header("Location: ../login/login.html?error=email");
    exit();
}

// Sanitize inputs
$sanitized_email = filter_var($submitted_username, FILTER_SANITIZE_EMAIL);

// Prepare SQL statement to prevent SQL injection 
if ($stmt = $con->prepare('SELECT id, password, category, rec_status FROM accounts WHERE email = ?')) {
    $stmt->bind_param('s', $sanitized_email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($acc_id, $hashed_password, $category, $rec_status);
        $stmt->fetch();
        $stmt->close();

        // Verify password using password_verify()
        if (password_verify($submitted_password, $hashed_password) && $rec_status == '1') {
            // Successful login - create session variables
            session_regenerate_id(true);
            $_SESSION['loggedin'] = TRUE;
            $_SESSION['email'] = $sanitized_email;
            $_SESSION['role'] = $category;
            $_SESSION['account_id'] = $acc_id;
            $_SESSION['is_admin'] = false; // Store admin ID in session

            $userLockStatus = '0'; // Default to unlocked
            $sql_lock = "SELECT value FROM update_variables WHERE topic = 'userLock'";
            if ($result_lock = $con->query($sql_lock)) {
                if ($row_lock = $result_lock->fetch_assoc()) {
                    $userLockStatus = $row_lock['value']; // Should be '0' or '1'
                }
                $result_lock->free();
            } else {
                error_log("Failed to query userLock status: " . $con->error);
                // Decide handling: proceed as unlocked or deny login? For now, proceed.
            }
            $_SESSION['userLock'] = $userLockStatus;
            
            // Redirect based on user category
            if ($category == "A") {
                $_SESSION['is_admin'] = true; // Store admin ID in session
                header("Location: admin.php");
                exit();
            } else if ($category == "F") {
                if ($stmt_supplier = $con->prepare('SELECT supplierID, supplierName FROM suppliers WHERE emailID = ?')) {
                    $stmt_supplier->bind_param('s', $sanitized_email);
                    $stmt_supplier->execute();
                    $stmt_supplier->store_result();

                    if ($stmt_supplier->num_rows > 0) {
                        $stmt_supplier->bind_result($supplier_specific_id, $supplier_name);
                        $stmt_supplier->fetch();
                        $_SESSION['farmer_id'] = $supplier_specific_id;
                        $_SESSION['farmer_name'] = $supplier_name;
                    } else {
                        error_log("Login Error: Farmer '$sanitized_email' (Account PK ID: $acc_id) has no entry in suppliers table.");
                        session_destroy();
                        header("Location: ../login/login.html?error=farmerdata_missing");
                        exit();
                    }
                    $stmt_supplier->close();
                }
                header("Location: supplier.php");
                exit();
            } else if ($category == "C") {
                if ($stmt_customer = $con->prepare('SELECT customerID, customerName, contact, address FROM customers WHERE emailId = ?')) {
                    $stmt_customer->bind_param('s', $sanitized_email);
                    $stmt_customer->execute();
                    $stmt_customer->store_result(); // Use store_result before bind_result if checking num_rows

                    if ($stmt_customer->num_rows > 0) {
                        $stmt_customer->bind_result($customer_id, $customer_name, $customer_contact, $customer_address);
                        $stmt_customer->fetch();
                        $_SESSION['customer_id'] = $customer_id;
                        $_SESSION['customer_name'] = $customer_name;
                        $_SESSION['customer_phone'] = $customer_contact;
                        $_SESSION['customer_address'] = $customer_address;
                    } else {
                        error_log("Login Error: Customer '$sanitized_email' (Account ID: $acc_id) has no entry in customers table.");
                        session_destroy();
                        header("Location: ../login/login.html?error=customerdata_missing");
                        exit();
                    }
                    $stmt_customer->close();
                }
                // $sql = "SELECT value FROM update_variables WHERE topic = 'userLock'";
                // $_SESSION['userLock'] = $con->query($sql);
                // header("Location: ../consumer/customer_dashboard.php");
                header("Location: consumer.php");
                exit();
            } else {
                error_log("Unknown category '$category' for user '$sanitized_email'");
                header("Location: ../login/login.html?error=unknowncategory");
                exit();
            }
        } else {
            // Invalid login credentials (generic message)
            header("Location: ../login/login.html?error=1");
            exit();
        }
    } else {
        // Invalid login credentials (generic message)
        header("Location: ../login/login.html?error=1");
        exit();
    }
    // $stmt->close(); // Already closed above
} else {
    error_log('Failed to prepare statement: ' . $con->error);
    header("Location: ../login/login.html?error=server");
    exit();
}
$con->close();
?>