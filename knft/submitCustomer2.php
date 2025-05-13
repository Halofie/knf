<?php
require('header.php'); // Includes DB credentials and session start

$response = ['success' => false, 'message' => 'Invalid Request'];
$data = json_decode(file_get_contents('php://input'), true);

// Basic validation
if (!$data || !isset($data['emailID'], $data['password'], $data['customerName'], $data['contact'], $data['routeID'])) {
    $response['message'] = 'Missing required fields.';
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

$email = filter_var($data['emailID'], FILTER_SANITIZE_EMAIL);
$plainPassword = $data['password'];
$customerName = trim($data['customerName']);
$contact = preg_replace('/[^0-9]/', '', $data['contact']); // Sanitize phone
$alternativeContact = isset($data['alternativeContact']) ? preg_replace('/[^0-9]/', '', $data['alternativeContact']) : null;
$address = trim($data['address'] ?? '');
$routeID = filter_var($data['routeID'], FILTER_VALIDATE_INT) ? (int)$data['routeID'] : null;

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response['message'] = 'Invalid Email Format.';
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
if (empty($plainPassword) || strlen($plainPassword) < 6) { // Basic password length check
     $response['message'] = 'Password must be at least 6 characters.';
     header('Content-Type: application/json');
     echo json_encode($response);
     exit;
}
if (empty($customerName)) {
    $response['message'] = 'Customer Name cannot be empty.';
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

// Hash the password
$hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);
if ($hashedPassword === false) {
    $response['message'] = 'Failed to hash password.';
     http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    error_log("DB Connect Error: " . $conn->connect_error);
    $response['message'] = 'Database connection error.';
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

// Use transactions for atomicity
$conn->begin_transaction();

try {
    // 1. Insert into users table
    $user_role = 'Customer';
    $sql_user = "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)";
    $stmt_user = $conn->prepare($sql_user);
    if (!$stmt_user) throw new Exception("User prepare failed: " . $conn->error);
    $stmt_user->bind_param("sss", $email, $hashedPassword, $user_role);

    if (!$stmt_user->execute()) {
        // Check for duplicate email specifically
        if ($conn->errno == 1062) { // Error code for duplicate entry
             throw new Exception("Email address already registered.");
        } else {
             throw new Exception("Failed to create user account: " . $stmt_user->error);
        }
    }
    $new_user_id = $conn->insert_id; // Get the ID of the newly inserted user
    $stmt_user->close();

    // 2. Insert into user_profiles (Optional but recommended)
    $sql_profile = "INSERT INTO user_profiles (user_id, full_name, phone_primary, phone_alternative) VALUES (?, ?, ?, ?)";
    $stmt_profile = $conn->prepare($sql_profile);
     if (!$stmt_profile) throw new Exception("Profile prepare failed: " . $conn->error);
    $stmt_profile->bind_param("isss", $new_user_id, $customerName, $contact, $alternativeContact);
     if (!$stmt_profile->execute()) {
         throw new Exception("Failed to create user profile: " . $stmt_profile->error);
     }
    $stmt_profile->close();


    // 3. Insert into customers table
    $sql_customer = "INSERT INTO customers (user_id, route_id, address) VALUES (?, ?, ?)";
    $stmt_customer = $conn->prepare($sql_customer);
    if (!$stmt_customer) throw new Exception("Customer prepare failed: " . $conn->error);
    $stmt_customer->bind_param("iis", $new_user_id, $routeID, $address); // 'i' for route_id, 's' for address
     if (!$stmt_customer->execute()) {
         throw new Exception("Failed to create customer record: " . $stmt_customer->error);
     }
    $stmt_customer->close();

    // If all inserts were successful, commit the transaction
    $conn->commit();
    $response['success'] = true;
    $response['message'] = 'Customer registered successfully.';

} catch (Exception $e) {
    // An error occurred, rollback the transaction
    $conn->rollback();
    $response['success'] = false;
    $response['message'] = $e->getMessage(); // Use the specific error message
    if (strpos($e->getMessage(), 'Failed') !== false || strpos($e->getMessage(), 'prepare failed') !== false) {
         http_response_code(500); // Internal server error for query failures
    } else if (strpos($e->getMessage(), 'already registered') !== false) {
        http_response_code(409); // Conflict for duplicate email
    } else {
         http_response_code(400); // Bad request for other validation type errors potentially
    }
}

$conn->close();

header('Content-Type: application/json');
echo json_encode($response);
?>