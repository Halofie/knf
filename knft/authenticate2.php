<?php
require('header.php'); // Includes session_start() and db connection details ($servername, $username, $password, $dbname)

// Response array
$response = ['success' => false, 'message' => 'Invalid request.'];

// Check if login form data was submitted
if (!isset($_POST['username'], $_POST['password'])) {
    $response['message'] = 'Please fill both the email and password fields!';
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

// Sanitize and validate email
$email = filter_var($_POST['username'], FILTER_SANITIZE_EMAIL);
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response['message'] = 'Invalid email format!';
    header('Content-Type: application/json');
    echo json_encode($response);
    exit();
}

$passwordh = $_POST['password'];

// Create DB connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(['error' => 'Connection failed: ' . $conn->connect_error]));
}

// Prepare SQL statement to fetch user by email
// Use the new 'users' table and columns
$sql = "SELECT user_id, password_hash, role FROM users WHERE email = ? AND is_active = TRUE LIMIT 1";
if ($stmt = $conn->prepare($sql)) {
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($user_id, $hashed_password_from_db, $role);
        $stmt->fetch();

        // Verify password using password_verify()
        if (password_verify($passwordh, $hashed_password_from_db)) {
            // Successful login - regenerate session ID and set session variables
            session_regenerate_id(true); // Regenerate ID to prevent session fixation
            $_SESSION['loggedin'] = true;
            $_SESSION['user_id'] = $user_id; // Store user_id instead of email
            $_SESSION['email'] = $email;     // Keep email if needed elsewhere
            $_SESSION['role'] = $role;       // Store the role ('Admin', 'Farmer', 'Customer')

            $response['success'] = true;
            $response['message'] = 'Login successful.';
            $response['role'] = $role; // Send role back to JS for redirection
             // Redirect based on user category
             if ($role == "A") {
                header("Location: admin.php");
                exit();
            } else if ($role == "F") {
                header("Location: supplier.php");
                exit();
            } else if ($role == "C") {
                header("Location: consumer.php");
                exit();
            }
        } else {
            // Invalid password
            $response['message'] = 'Invalid email or password.';
        }
    } else {
        // User not found or inactive
        $response['message'] = 'Invalid email or password.';
    }
    $stmt->close();
} else {
    // Log detailed error server-side
    error_log("Failed to prepare SQL statement: " . $conn->error);
    $response['message'] = 'Login query failed.';
    http_response_code(500);
}

$conn->close();

// Send JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>