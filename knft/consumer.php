<?php
// Start the session
session_start();

// Check if user is logged in; redirect to login page if not authenticated
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true || $_SESSION['role'] !== 'C') {
    header("Location: ../login/login.html");
    exit();
}

// Redirect to admin dashboard if email exists in session
if (isset($_SESSION['email'])) {
    header("Location: ../consumer/orderfr.php");
    exit();
} else {
    echo "Access denied. No email provided.";
}
?>
