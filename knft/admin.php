<?php
// Start the session
session_start();

// Check if user is logged in; redirect to login page if not authenticated
if (!isset($_SESSION["loggedin"]) || $_SESSION["loggedin"] !== true || $_SESSION['role'] !== 'A') {
    header("Location: ../login/login.html");
    exit();
}

// Redirect to admin dashboard if email exists in session
if (isset($_SESSION['email'])) {
    header("Location: ../admin/admin.html");
    exit();
} else {
    echo "Access denied. No email provided.";
}
?>
