<?php
require('header.php');


// Connect to MySQL database
$con = mysqli_connect($servername, $username, $password, $dbname);
if (mysqli_connect_errno()) {
    error_log('Failed to connect to MySQL: ' . mysqli_connect_error());
    exit('Login failed. Please try again later.');
}

// Check if login form data was submitted
if (!isset($_POST['username'], $_POST['password'])) {
    exit('Please fill both the username and password fields!');
}

$submitted_username = $_POST['username'];
$submitted_password = $_POST['password'];

// Validate email address
if (!filter_var($submitted_username, FILTER_VALIDATE_EMAIL)) {
    exit('Invalid email format!');
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
        if (password_verify($submitted_password, $hashed_password) && $rec_status == '1') {  //Fixed the condition to check rec_status
            // Successful login - create session variables
            session_regenerate_id(true);
            $_SESSION['loggedin'] = TRUE;
            $_SESSION['email'] = $sanitized_email;
            $_SESSION['account_id'] = $acc_id;

            // Redirect based on user category
            if ($category == "A") {
                header("Location: admin.php");
                exit();
            } else if ($category == "F") {
                if ($stmt_supplier = $con->prepare('SELECT supplierID FROM suppliers WHERE emailID = ?')) {
                    $stmt_supplier->bind_param('s', $sanitized_email);
                    $stmt_supplier->execute();
                    $stmt_supplier->store_result();

                    if ($stmt_supplier->num_rows > 0) {
                        $stmt_supplier->bind_result($supplier_specific_id);
                        $stmt_supplier->fetch();
                        $_SESSION['farmer_id'] = $supplier_specific_id; // This is the crucial part
                    } else {
                        error_log("Login Error: Farmer '$sanitized_email' (Account PK ID: $acc_id) has no entry in suppliers table.");
                        // Destroy session and redirect with error to prevent partial login
                        session_destroy();
                        header("Location: login.html?error=farmerdatamissing");
                        exit();
                    }
                    $stmt_supplier->close();
                }
                header("Location: supplier.php");
                exit();
            } else if ($category == "C") {
                header("Location: consumer.php");
                exit();
            } else {
                // Handle unknown category if necessary
                error_log("Unknown category '$category' for user '$sanitized_email'");
                exit('Login successful, but redirect failed. Please contact support.');
            }
        } else {
            // Invalid login credentials (generic message)
            exit('Invalid login credentials!');
        }
    } else {
        // Invalid login credentials (generic message)
        exit('Invalid login credentials!');
    }
    $stmt->close();
} else {
    error_log('Failed to prepare statement: ' . $con->error);
    exit('Login failed. Please try again later.');
}
$con->close();
?>
