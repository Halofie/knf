<?php
require('header.php');

session_start();


// Connect to MySQL database
$con = mysqli_connect($servername, $username, $password, $dbname);
if (mysqli_connect_errno()) {
    exit('Failed to connect to MySQL: ' . mysqli_connect_error());
}

// Check if login form data was submitted
if (!isset($_POST['username'], $_POST['password'])) {
    exit('Please fill both the username and password fields!');
}

// Validate email address
if (!filter_var($_POST['username'], FILTER_VALIDATE_EMAIL)) {
    exit('Invalid email address!');
}

// Sanitize inputs
$username = filter_var($_POST['username'], FILTER_SANITIZE_EMAIL);

// Prepare SQL statement to prevent SQL injection
if ($stmt = $con->prepare('SELECT password, category FROM accounts WHERE email = ?')) {
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($hashed_password, $category);
        $stmt->fetch();

        // Verify password using password_verify()
        if ($_POST['password']== $hashed_password){
            // Successful login - create session variables
            session_regenerate_id();
            $_SESSION['loggedin'] = TRUE;
            $_SESSION['email'] = $username;

            // Redirect based on user category
            if ($category == "A") {
                header("Location: admin.php");
                exit();
            } else if ($category == "F") {
                header("Location: supplier.php");
                exit();
            } else if ($category == "C") {
                header("Location: consumer.php");
                exit();
            }
        } else {
            // Invalid login credentials (generic message)
            exit('Invalid login credentials!');
        }
    } else {
        // Invalid login credentials (generic message)
        exit('Invalid login credentials!');
    }
    $stmt->close();
} else {
    exit('Failed to prepare statement!');
}
$con->close();
?>
