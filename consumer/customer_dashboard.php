<?php
session_start();
 // Check 1: Is the user logged in?
 if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
     header("Location: ../login.html?error=notloggedin_dashboard"); // Or your main login page
     exit;
 }

 // Check 2: Is the user a Customer?
 if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'C') {
     // Not a customer, perhaps redirect to their appropriate dashboard or show error
     // For now, redirect to login or an access denied page
     error_log("Auth issue: User " . ($_SESSION['email'] ?? '') . " with role " . ($_SESSION['role'] ?? '') . " tried to access customer dashboard.");
     header("Location: ../access_denied.html?error=wrongrole");
     exit;
 }

 // If we are here, user is a logged-in customer.
 // Fetch customer-specific data to display on the dashboard.
 // We'll need $_SESSION['customer_id'] (set at login)
 // and $_SESSION['email']

 $customer_id = $_SESSION['customer_id'] ?? null;
 $customer_email = $_SESSION['email'] ?? 'Customer'; // Fallback name
 $customer_name = $_SESSION['customer_name'] ?? $customer_email; // Assume customer_name is also in session after login
 $customer_phone = $_SESSION['customer_phone'] ?? 'N/A';
 $customer_address = $_SESSION['customer_address'] ?? 'N/A';

 // You might want to re-fetch fresh data from the DB instead of relying solely on session for details
 // For example, if their address changed in another session.
 // For now, we'll use session data if available.

 ?>
 <!doctype html>
 <html lang="en">
 <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Welcome, <?php echo htmlspecialchars($customer_name); ?>!</title>
     <!-- Link your CSS: Bootstrap, your custom CSS for this dashboard -->
     <link href="../public/css/bootstrap.min.css" rel="stylesheet">
     <link rel="stylesheet" href="../public/css/customer_dashboard.css"> <!-- Create this CSS file -->
     <link rel="icon" href="../public/Assets/pic.jpeg">
     <!-- Font Awesome for icons (optional but nice) -->
     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
 </head>
 <body class="bg-light"> <!-- Example body class -->

     <!-- Navigation Bar (similar to home.html but with customer context) -->
     <nav class="navbar navbar-expand-lg navbar-dark bg-success shadow-sm">
         <div class="container">
             <a class="navbar-brand" href="#">
                 <img src="../public/Assets/pic.jpeg" alt="KNF Logo" width="40" height="40" class="d-inline-block align-text-top rounded-circle me-2">
                 Kovai Natural Farms
             </a>
             <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown" aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
                 <span class="navbar-toggler-icon"></span>
             </button>
             <div class="collapse navbar-collapse" id="navbarNavDropdown">
                 <ul class="navbar-nav ms-auto">
                     <li class="nav-item">
                         <a class="nav-link active" aria-current="page" href="customer_dashboard.php">
                             <i class="fas fa-tachometer-alt me-1"></i>Dashboard
                         </a>
                     </li>
                     <li class="nav-item">
                         <a class="nav-link" href="orderfr.php">
                             <i class="fas fa-shopping-basket me-1"></i>Order Products
                         </a>
                     </li>
                     <li class="nav-item">
                         <a class="nav-link" href="orderfr.php#two"> <!-- Link to history section -->
                             <i class="fas fa-history me-1"></i>My Orders
                         </a>
                     </li>
                     <li class="nav-item dropdown">
                         <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                             <i class="fas fa-user-circle me-1"></i><?php echo htmlspecialchars($customer_name); ?>
                         </a>
                         <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuLink">
                             <li><a class="dropdown-item" href="edit_profile.php"><i class="fas fa-user-edit me-2"></i>Edit Profile</a></li>
                             <li><a class="dropdown-item" href="change_password.php"><i class="fas fa-key me-2"></i>Change Password</a></li>
                             <li><hr class="dropdown-divider"></li>
                             <li><a class="dropdown-item" href="../knft/logout.php"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                         </ul>
                     </li>
                 </ul>
             </div>
         </div>
     </nav>
     <!-- End Navigation Bar -->

     <div class="container mt-4">
         <div class="row">
             <!-- Sidebar / Profile Info Column -->
             <div class="col-md-4 col-lg-3 mb-4">
                 <div class="card shadow-sm">
                     <div class="card-header bg-primary text-white">
                         <i class="fas fa-id-card me-2"></i>My Profile
                     </div>
                     <div class="card-body">
                         <div class="text-center mb-3">
                             <!-- You can add a profile picture here if you have one -->
                             <i class="fas fa-user-circle fa-5x text-primary"></i>
                         </div>
                         <h5 class="card-title text-center"><?php echo htmlspecialchars($customer_name); ?></h5>
                         <p class="card-text"><i class="fas fa-envelope me-2 text-muted"></i><?php echo htmlspecialchars($customer_email); ?></p>
                         <p class="card-text"><i class="fas fa-phone me-2 text-muted"></i><?php echo htmlspecialchars($customer_phone); ?></p>
                         <p class="card-text"><i class="fas fa-map-marker-alt me-2 text-muted"></i><?php echo nl2br(htmlspecialchars($customer_address)); ?></p>
                         <a href="edit_profile.php" class="btn btn-outline-primary btn-sm w-100 mt-2"><i class="fas fa-edit me-1"></i>Edit Profile</a>
                     </div>
                 </div>
                 <!-- Quick Links Card -->
                 <div class="card shadow-sm mt-3">
                     <div class="card-header bg-info text-white">
                         <i class="fas fa-link me-2"></i>Quick Actions
                     </div>
                     <ul class="list-group list-group-flush">
                         <li class="list-group-item"><a href="orderfr.php" class="text-decoration-none text-success"><i class="fas fa-plus-circle me-2"></i>Place New Order</a></li>
                         <li class="list-group-item"><a href="orderfr.php#two" class="text-decoration-none text-info"><i class="fas fa-receipt me-2"></i>View Order History</a></li>
                         <!-- Add more links as needed -->
                     </ul>
                 </div>
             </div>

             <!-- Main Content Area -->
             <div class="col-md-8 col-lg-9">
                 <div class="alert alert-success" role="alert">
                     <h4 class="alert-heading">Welcome back, <?php echo htmlspecialchars($customer_name); ?>!</h4>
                     <p>This is your personal dashboard. From here you can place new orders, view your past purchases, and manage your account details.</p>
                     <hr>
                     <p class="mb-0">Happy shopping with Kovai Natural Farms!</p>
                 </div>

                 <!-- Placeholder for other dashboard content -->
                 <div class="card shadow-sm mt-4">
                     <div class="card-header">
                        <i class="fas fa-bell me-2"></i>Notifications / Recent Activity (Example)
                     </div>
                     <div class="card-body">
                         <p>No new notifications at this time.</p>
                         <!-- You could fetch and display recent order statuses here -->
                     </div>
                 </div>
                 <div class="card shadow-sm mt-4">
                     <div class="card-header">
                        <i class="fas fa-star me-2"></i>Featured Products (Example)
                     </div>
                     <div class="card-body">
                         <p>Check out our latest seasonal produce!</p>
                         <!-- You could fetch and display a few featured products -->
                     </div>
                 </div>
             </div>
         </div>
     </div>

     <!-- Footer (optional) -->
     <footer class="text-center p-3 mt-5 bg-white shadow-top">
         Kovai Natural Farms © <?php echo date("Y"); ?>
     </footer>

     <script src="../public/js/bootstrap.bundle.min.js"></script> <!-- Bootstrap 5 JS bundle -->
     <!-- Add any dashboard-specific JS if needed -->
     <!-- <script src="../public/js/customer_dashboard.js"></script> -->
 </body>
 </html>