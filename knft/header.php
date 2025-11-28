<?php
error_reporting(E_ALL);

// Configure error handling for production
// Errors are logged but not displayed to users
ini_set('display_errors', '0');  // Never display errors to users
ini_set('log_errors', '1');       // Always log errors

// Create logs directory if it doesn't exist
$log_dir = __DIR__ . '/../logs';
if (!file_exists($log_dir)) {
    @mkdir($log_dir, 0755, true);
}
ini_set('error_log', $log_dir . '/php_errors.log');

// CORS headers - configured for production
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}
$response = array();
// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "knf";

$host = $servername;
$user = $username;
$pass = $password;

// Start session using the default params (keeps behavior consistent with original repo)
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}
?>