<?php
error_reporting(E_ALL);
// For local/dev environments we show errors; in production you may want to log instead.
ini_set('display_errors', 1);
// CORS headers (original behavior) — wildcard allowed in development.
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