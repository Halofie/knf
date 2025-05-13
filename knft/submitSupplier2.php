<?php
require('header.php');

$response = ['success' => false, 'message' => 'Invalid Request'];
$data = json_decode(file_get_contents('php://input'), true);

// Basic validation
if (!$data || !isset($data['emailID'], $data['password'], $data['supplierName'], $data['contact'])) {
    $response['message'] = 'Missing required fields.';
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

$email = filter_var($data['emailID'], FILTER_SANITIZE_EMAIL);
$plainPassword = $data['password'];
$supplierName = trim($data['supplierName']);
$contact = preg_replace('/[^0-9]/', '', $data['contact']);
$alternativeContact = isset($data['alternativeContact']) ? preg_replace('/[^0-9]/', '', $data['alternativeContact']) : null;
$farmLocation = trim($data['farmLocation'] ?? '');
// Validate farmSize - make sure it's numeric
$farmSize = isset($data['farmSize']) && is_numeric($data['farmSize']) ? (float)$data['farmSize'] : null;


if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response['message'] = 'Invalid Email Format.';
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
if (empty($plainPassword) || strlen($plainPassword) < 6) {
     $response['message'] = 'Password must be at least 6 characters.';
     header('Content-Type: application/json');
     echo json_encode($response);
     exit;
}
if (empty($supplierName)) {
    $response['message'] = 'Supplier Name cannot be empty.';
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

$conn->begin_transaction();

try {
    // 1. Insert into users table
    $user_role = 'Farmer'; // Role specific to suppliers
    $sql_user = "INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)";
    $stmt_user = $conn->prepare($sql_user);
    if (!$stmt_user) throw new Exception("User prepare failed: " . $conn->error);
    $stmt_user->bind_param("sss", $email, $hashedPassword, $user_role);

    if (!$stmt_user->execute()) {
        if ($conn->errno == 1062) {
             throw new Exception("Email address already registered.");
        } else {
             throw new Exception("Failed to create user account: " . $stmt_user->error);
        }
    }
    $new_user_id = $conn->insert_id;
    $stmt_user->close();

    // 2. Insert into user_profiles (Optional)
    $sql_profile = "INSERT INTO user_profiles (user_id, full_name, phone_primary, phone_alternative) VALUES (?, ?, ?, ?)";
    $stmt_profile = $conn->prepare($sql_profile);
    if (!$stmt_profile) throw new Exception("Profile prepare failed: " . $conn->error);
    $stmt_profile->bind_param("isss", $new_user_id, $supplierName, $contact, $alternativeContact);
    if (!$stmt_profile->execute()) {
         throw new Exception("Failed to create user profile: " . $stmt_profile->error);
     }
    $stmt_profile->close();


    // 3. Insert into suppliers table
    $sql_supplier = "INSERT INTO suppliers (user_id, farm_location, farm_size_acres) VALUES (?, ?, ?)";
    $stmt_supplier = $conn->prepare($sql_supplier);
     if (!$stmt_supplier) throw new Exception("Supplier prepare failed: " . $conn->error);
    // farm_size_acres is decimal, use 'd'
    $stmt_supplier->bind_param("isd", $new_user_id, $farmLocation, $farmSize);
     if (!$stmt_supplier->execute()) {
         throw new Exception("Failed to create supplier record: " . $stmt_supplier->error);
     }
    $stmt_supplier->close();

    // Commit
    $conn->commit();
    $response['success'] = true;
    $response['message'] = 'Supplier registered successfully.';

} catch (Exception $e) {
    // Rollback
    $conn->rollback();
    $response['success'] = false;
    $response['message'] = $e->getMessage();
     if (strpos($e->getMessage(), 'Failed') !== false || strpos($e->getMessage(), 'prepare failed') !== false) {
         http_response_code(500);
    } else if (strpos($e->getMessage(), 'already registered') !== false) {
        http_response_code(409);
    } else {
         http_response_code(400);
    }
}

$conn->close();

header('Content-Type: application/json');
echo json_encode($response);
?>