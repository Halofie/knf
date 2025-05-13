<?php
// Check if the password is provided via a form submission
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["password"])) {
    $password = $_POST["password"];
    
    // Generate the hashed password using bcrypt
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Display the hashed password
    echo "Hashed Password: " . $hashed_password;
} else {
?>
    <form method="post">
        <label for="password">Enter Password:</label>
        <input type="text" id="password" name="password" required>
        <button type="submit">Hash Password</button>
    </form>
<?php
}
?>