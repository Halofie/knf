<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
// CORS headers
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

session_start();
?>