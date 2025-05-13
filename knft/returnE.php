<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("HTTP/1.1 200 OK");
    exit();
}
header('Content-Type: application/json');
$response = array();
session_start();
// Check if the email exists in the session
$email = isset($_SESSION['email']) ? $_SESSION['email'] : null;
// Return the email as a JSON response
echo json_encode(['email' => $email]);
?>
