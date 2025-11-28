<?php
session_start();

// Check if the user is logged in and has the 'F' (Farmer/Supplier) role
if (!isset($_SESSION['loggedin']) || !isset($_SESSION['role']) || $_SESSION['role'] !== 'F') {
    // Not logged in or not a farmer/supplier, redirect to login
    header("Location: ../login/login.php");
    exit();
}

// User is authenticated and is a farmer/supplier, redirect to farmer dashboard
header("Location: ../producer/addinv.php");
exit();
?>
