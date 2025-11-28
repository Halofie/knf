<?php
session_start();
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true || !isset($_SESSION['role']) || $_SESSION['role'] !== 'C') {
    header("Location: ../login.html?error=notloggedin_dashboard");
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

    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,300,400,700" rel="stylesheet">
    <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"> -->
    
    <!-- CSS -->
    <link href="../public/css/bootstrap.min.css" rel="stylesheet">
    <!-- <link rel="stylesheet" href="../public/css/order.css"> -->
    <link rel="stylesheet" href="../public/css/common.css">
    <link rel="stylesheet" href="../public/css/customer_dashboard.css">
    <link rel="icon" href="../public/Assets/pic.jpeg">
</head>
<body class="paleGreen">
    <!-- Unified Sidebar -->
    <div class="offcanvas offcanvas-start sidebar" tabindex="-1" id="offcanvasExample">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title">
                <i class="fas fa-shopping-basket me-2"></i>KNF Customer
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas"></button>
        </div>
        <div class="offcanvas-body">
            <div class="text-center mb-4">
                <img src="../public/Assets/pic.jpeg" class="profile" alt="Customer Profile">
                <h6 class="mt-2 text-success"><?php echo htmlspecialchars($customer_name); ?></h6>
            </div>
            <nav>
                <a href="#dashboard" class="active">
                    <i class="fas fa-home me-2"></i>Dashboard
                </a>
                <a href="#profile">
                    <i class="fas fa-user me-2"></i>My Profile
                </a>
                <a href="orderfr.php" class="btn btn-success btn-lg">
                    <i class="fas fa-shopping-cart me-2"></i>Place New Order
                </a>
                <a href="orderfr.php#order-history" class="btn btn-primary btn-lg">
                    <i class="fas fa-history me-2"></i>View Order History
                </a>
                <a href="../home.html">
                    <i class="fas fa-home me-2"></i>Home
                </a>
                <a href="../knft/logout.php">
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                </a>
            </nav>
        </div>
    </div>

    <!-- Top Bar -->
    <div class="container-fluid top-navbar p-0">
        <div class="row align-items-center darkGreen">
            <div class="col-auto">
                <button class="btn btn-link text-white p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample">
                    <img src="../public/Assets/three-bars.svg" alt="Menu" style="width: 24px;">
                </button>
            </div>
            <div class="col-auto d-none d-lg-block">
                <img src="../public/Assets/pic.jpeg" class="profile rounded-circle border p-0 border-dark" alt="KNF logo">
            </div>
            <div class="col color-paleGreen">
                <h1 class="mb-0"><?php echo htmlspecialchars($customer_name); ?></h1>
                <p class="mb-0">Phone: <?php echo htmlspecialchars($customer_phone); ?></p>
                <p class="mb-0">Email: <?php echo htmlspecialchars($customer_email); ?></p>
                <p class="mb-0">Address: <?php echo htmlspecialchars($customer_address); ?></p>
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

    <main class="container-fluid" style="margin-top: 2rem;">
        <!-- Dashboard Section -->
        <section id="dashboard" class="content-section">
            <h2 class="section-title">Customer Dashboard</h2>
            <!-- Welcome Alert -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="alert alert-success animate-slide-up">
                        <h4 class="alert-heading">
                            <i class="fas fa-hand-paper me-2"></i>Welcome back, <?php echo htmlspecialchars($customer_name); ?>!
                        </h4>
                        <p class="mb-0">This is your personal dashboard. From here you can place new orders, view your past purchases, and manage your account details.</p>
                        <hr>
                        <p class="mb-0">
                            <i class="fas fa-leaf me-1"></i>Happy shopping with Kovai Natural Farms!
                        </p>
                    </div>
                </div>
            </div>

            <div class="row g-4 mb-5">
                <div class="col-md-6">
                    <div class="card animate-slide-up">
                        <div class="card-header">
                            <i class="fas fa-plus-circle me-2"></i>Quick Actions
                        </div>
                        <div class="card-body">
                            <div class="d-grid gap-2">
                                <a href="orderfr.php" class="btn btn-success btn-lg">
                                    <i class="fas fa-shopping-cart me-2"></i>Place New Order
                                </a>
                                <a href="orderfr.php#two" class="btn btn-primary btn-lg">
                                    <i class="fas fa-history me-2"></i>View Order History
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div class="row">
                <div class="col-12">
                    <div class="card animate-slide-up">
                        <div class="card-header">
                            <i class="fas fa-user me-2"></i>Profile Summary
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <table class="table table-borderless">
                                        <tr>
                                            <td><strong><i class="fas fa-user me-2"></i>Name:</strong></td>
                                            <td><?php echo htmlspecialchars($customer_name); ?></td>
                                        </tr>
                                        <tr>
                                            <td><strong><i class="fas fa-envelope me-2"></i>Email:</strong></td>
                                            <td><?php echo htmlspecialchars($customer_email); ?></td>
                                        </tr>
                                        <tr>
                                            <td><strong><i class="fas fa-phone me-2"></i>Phone:</strong></td>
                                            <td><?php echo htmlspecialchars($customer_phone); ?></td>
                                        </tr>
                                        <tr>
                                            <td><strong><i class="fas fa-map-marker-alt me-2"></i>Address:</strong></td>
                                            <td><?php echo nl2br(htmlspecialchars($customer_address)); ?></td>
                                        </tr>
                                    </table>
                                </div>
                                <div class="col-md-4 text-center">
                                    <i class="fas fa-user-circle fa-5x text-success mb-3"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Profile Section - DISABLED (Incomplete functionality) -->
        <section id="profile" class="content-section" style="display: none;">
            <h2 class="section-title">My Profile</h2>
            <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>Profile editing is currently unavailable. Please contact support to update your information.
            </div>
            <!--
            
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="card animate-slide-up">
                        <div class="card-header">
                            <i class="fas fa-user-edit me-2"></i>Edit Profile Information
                        </div>
                        <div class="card-body">
                            <form id="profileForm">
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="customerName" class="form-label">Full Name</label>
                                        <input type="text" class="form-control" id="customerName" value="<?php echo htmlspecialchars($customer_name); ?>">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="customerEmail" class="form-label">Email Address</label>
                                        <input type="email" class="form-control" id="customerEmail" value="<?php echo htmlspecialchars($customer_email); ?>" readonly>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6 mb-3">
                                        <label for="customerPhone" class="form-label">Phone Number</label>
                                        <input type="tel" class="form-control" id="customerPhone" value="<?php echo htmlspecialchars($customer_phone); ?>">
                                    </div>
                                    <div class="col-md-6 mb-3">
                                        <label for="customerAddress" class="form-label">Address</label>
                                        <textarea class="form-control" id="customerAddress" rows="3"><?php echo htmlspecialchars($customer_address); ?></textarea>
                                    </div>
                                </div>
                                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button type="button" class="btn btn-secondary me-md-2" onclick="showSection('dashboard')">Cancel</button>
                                    <button type="submit" class="btn btn-success">
                                        <i class="fas fa-save me-1"></i>Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                    
                    <!-- Change Password Card -->
                    <div class="card mt-4 animate-slide-up">
                        <div class="card-header">
                            <i class="fas fa-key me-2"></i>Change Password
                        </div>
                        <div class="card-body">
                            <form id="passwordForm">
                                <div class="mb-3">
                                    <label for="currentPassword" class="form-label">Current Password</label>
                                    <input type="password" class="form-control" id="currentPassword" required>
                                </div>
                                <div class="mb-3">
                                    <label for="newPassword" class="form-label">New Password</label>
                                    <input type="password" class="form-control" id="newPassword" required>
                                </div>
                                <div class="mb-3">
                                    <label for="confirmPassword" class="form-label">Confirm New Password</label>
                                    <input type="password" class="form-control" id="confirmPassword" required>
                                </div>
                                <div class="d-grid">
                                    <button type="submit" class="btn btn-warning">
                                        <i class="fas fa-key me-1"></i>Change Password
                                    </button>
                                </div>  
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            -->
        </section>
    </main>
            
    <!-- Footer -->
    <footer class="text-center py-4 mt-5" style="background: linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%); border-top: 2px solid rgba(76,175,80,0.1);">
        <div class="container">
            <p class="mb-0 text-muted">
                <i class="fas fa-leaf me-2 text-success"></i>
                © 2025 Kovai Natural Farmers - Customer Portal. All rights reserved.
            </p>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="../public/js/bootstrap.min.js"></script>
    <script src="../public/js/clock.js"></script>
    <script src="../public/js/customer_dashboard.js"></script> 
</body>
</html>