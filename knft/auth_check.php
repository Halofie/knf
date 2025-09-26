<?php
// Reusable script to ensure the user is a logged-in admin and to enforce CSRF for state-changing requests.
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

// Check if the user is logged in and is an admin.
if (!isset($_SESSION['loggedin']) || !isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    // If not, send a 403 Forbidden response with a JSON error message.
    header('Content-Type: application/json');
    http_response_code(403);
    exit(json_encode(['error' => 'Access Denied: You do not have permission to access this resource.']));
}

// CSRF protection: for non-GET, non-OPTIONS requests require a matching token.
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
if (!in_array($method, ['GET', 'OPTIONS'])) {
    // Prefer token from X-CSRF-Token header, fallback to POST body field 'csrf_token'
    $csrfHeader = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
    $csrfPost = $_POST['csrf_token'] ?? null;
    $token = $csrfHeader ?: $csrfPost;

    if (empty($token) || empty($_SESSION['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $token)) {
        header('Content-Type: application/json');
        http_response_code(403);
        exit(json_encode(['error' => 'Invalid or missing CSRF token.']));
    }
}
?>