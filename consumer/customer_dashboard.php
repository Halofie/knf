<?php
session_start();
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true || !isset($_SESSION['role']) || $_SESSION['role'] !== 'C') {
    header("Location: ../login.html?error=notloggedin_dashboard"); // Or your main login page
    exit;
}

$customer_id = $_SESSION['customer_id'] ?? null;
$customer_email = $_SESSION['email'] ?? 'Customer';
$customer_name = $_SESSION['customer_name'] ?? $customer_email;
$customer_phone = $_SESSION['customer_phone'] ?? 'N/A';
$customer_address = $_SESSION['customer_address'] ?? 'N/A';

?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome, <?php echo htmlspecialchars($customer_name); ?>!</title>
    <link href="../public/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../public/css/order.css">
    <link rel="stylesheet" href="../public/css/common.css">
    <link rel="stylesheet" href="../public/css/customer_dashboard.css"> <!-- Create this CSS file -->
    <link rel="icon" href="../public/Assets/pic.jpeg">
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,300,400,700" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css">
</head>
<body class="paleGreen">

<!-- Top Bar (same as orderfr.php) -->
<div class="container-fluid">
    <div class="row align-items-center p-2 darkGreen">
        <div class="col-auto d-flex align-items-center">
            <button class="btn p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample">
                <img src="../public/Assets/three-bars.svg" alt="Menu" style="width: 24px;">
            </button>
        </div>
        <div class="col-2 d-none d-lg-flex justify-content-center">
            <img src="../public/Assets/pic.jpeg" class="profile rounded-circle border p-0 border-dark" alt="logo">
        </div>
        <div class="col-6 color-paleGreen">
            <h1 id="name"><?php echo htmlspecialchars($customer_name); ?></h1>
            <p class="navinfo m-0" id="phone"><?php echo htmlspecialchars($customer_phone); ?></p>
            <p class="navinfo m-0" id="address"><?php echo htmlspecialchars($customer_address); ?></p>
        </div>
        <div class="col-3 d-flex justify-content-end align-items-center">
            <div class="d-flex align-items-center gap-2">
                <a class="btn" href="customer_dashboard.php">
                    <i class="fas fa-tachometer-alt me-1"></i>Dashboard
                </a>
                <a class="btn" href="orderfr.php">
                    <i class="fas fa-shopping-basket me-1"></i>Order Products
                </a>
                <a class="btn" href="orderfr.php#two">
                    <i class="fas fa-history me-1"></i>My Orders
                </a>
                <div class="dropdown">
                    <a class="btn dropdown-toggle" href="#" id="navbarDropdownMenuLink" data-bs-toggle="dropdown">
                        <i class="fas fa-user-circle me-1"></i><?php echo htmlspecialchars($customer_name); ?>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdownMenuLink">
                        <li><a class="dropdown-item" href="edit_profile.php"><i class="fas fa-user-edit me-2"></i>Edit Profile</a></li>
                        <li><a class="dropdown-item" href="change_password.php"><i class="fas fa-key me-2"></i>Change Password</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="../knft/logout.php"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Offcanvas Sidebar -->
<div class="offcanvas offcanvas-start sidebar" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
    <div class="offcanvas-header">
        <h5 class="offcanvas-title" id="offcanvasExampleLabel">MENU</h5>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
    </div>
    <div class="offcanvas-body">
        <div class="col d-flex justify-content-center">
            <img src="../public/Assets/pic.jpeg" class="profile rounded-circle border p-0 border-dark" alt="logo">
        </div>
        <div>
            <a class="btn" href="customer_dashboard.php">Dashboard</a>
            <a class="btn" href="orderfr.php">Order Products</a>
            <a class="btn" href="orderfr.php#two">My Orders</a>
            <a class="btn" href="../knft/logout.php">Logout</a>
        </div>
    </div>
</div>

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
                        <i class="fas fa-user-circle fa-5x text-success"></i>
                    </div>
                    <h5 class="card-title text-center text-success"><?php echo htmlspecialchars($customer_name); ?></h5>
                    <p class="card-text"><i class="fas fa-envelope me-2 text-muted"></i><?php echo htmlspecialchars($customer_email); ?></p>
                    <p class="card-text"><i class="fas fa-phone me-2 text-muted"></i><?php echo htmlspecialchars($customer_phone); ?></p>
                    <p class="card-text"><i class="fas fa-map-marker-alt me-2 text-muted"></i><?php echo nl2br(htmlspecialchars($customer_address)); ?></p>
                    <a href="edit_profile.php" class="btn btn-outline-primary btn-sm w-100 mt-2"><i class="fas fa-edit me-1"></i>Edit Profile</a>
                </div>
            </div>
            <!-- Quick Links Card -->
            <div class="card shadow-sm mt-3">
                <div class="card-header section-title bg-info text-white">
                    <i class="fas fa-link me-2"></i>Quick Actions
                </div>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item"><a href="orderfr.php" class="text-decoration-none text-success"><i class="fas fa-plus-circle me-2"></i>Place New Order</a></li>
                    <li class="list-group-item"><a href="orderfr.php#two" class="text-decoration-none text-info"><i class="fas fa-receipt me-2"></i>View Order History</a></li>
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

            <!-- Notifications Card -->
            <div class="card shadow-sm mt-4">
                <div class="card-header section-title bg-success text-white">
                    <i class="fas fa-bell me-2"></i>Notifications / Recent Activity
                </div>
                <div class="card-body">
                    <p>No new notifications at this time.</p>
                </div>
            </div>
            <!-- Featured Products Card -->
            <div class="card shadow-sm mt-4">
                <div class="card-header section-title bg-success text-white">
                    <i class="fas fa-star me-2"></i>Featured Products
                </div>
                <div class="card-body">
                    <p>Check out our latest seasonal produce!</p>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Footer (optional) -->
<footer class="text-center p-3 mt-5 bg-white shadow-top">
    Kovai Natural Farms © <?php echo date("Y"); ?>
</footer>

<script src="../public/js/bootstrap.min.js"></script> 
</body>
</html>