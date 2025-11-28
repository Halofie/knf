<?php
session_start();
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'F') {
    header("Location: ../login/login.php");
    exit();
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Google Font -->
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;600;700;800&display=swap" rel="stylesheet">
    <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"> -->

    <!-- Custom CSS -->
    <link href="../public/css/bootstrap.min.css" rel="stylesheet">
    <!-- <link rel="stylesheet" href="../public/css/admin2.css"> -->
    <link rel="stylesheet" href="../public/css/addinv.css">
    <link rel="icon" href="../public/Assets/pic.jpeg">

    <title>KNF Farmer Dashboard</title>
</head>
<body class="paleGreen">
    <!-- Enhanced Offcanvas Sidebar -->
    <div class="offcanvas offcanvas-start sidebar " tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title">
                <i class="fas fa-seedling me-2"></i>KNF Farmer
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <div class="text-center mb-4">
                <img src="../public/Assets/pic.jpeg" class=" profile" alt="KNF logo">
                <h6 class="mt-2 text-success" id="farmer-name-sidebar">Farmer Dashboard</h6>
            </div>
            <nav>
                <a href="#dashboard" class="active">
                    <i class="fas fa-home me-2"></i>Dashboard
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
                <button class="btn btn-link text-white p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                    <img src="../public/Assets/three-bars.svg" alt="Menu">
                </button>
            </div>
            <div class="col-auto d-none d-lg-block">
                <img src="../public/Assets/pic.jpeg" class="profile rounded-circle border p-0 border-dark" alt="KNF logo">
            </div>
            <div class="col color-paleGreen">
                <h1 class="mb-0" id="name">Loading...</h1>
                <p class="mb-0" id="phone">Contact: Loading...</p>
                <p class="mb-0" id="address">Location: Loading...</p>
                <p class="mb-0" id="week">Current Week: Loading...</p>
            </div>
            <div class="col-auto">
            <div class="clock text-end">
                <div class="fas fa-clock me-1">
                    <div class="clock">date</div>
                </div>
            </div>
        </div>
    </div>

    <!-- Enhanced Main Content -->
    <main class="container-fluid" style="margin-top: 2rem;">
        <section id="dashboard" class="content-section">
            <div class="row">
                <div class="col-12">
                    <h2 class="text-center mb-4 text-success">
                        <i class="fas fa-seedling me-2"></i>Farmer Dashboard
                    </h2>
                    <!-- Quick Stats Cards -->
                    <div class="row g-4 mb-5">
                        <div class="col-md-4">
                            <div class="card text-center animate-slide-up">
                                <div class="card-body">
                                    <i class="fas fa-seedling fa-3x text-success mb-3"></i>
                                    <h5>Products in Inventory</h5>
                                    <h3 class="text-success" id="total-products-count">0</h3>
                                    <small class="text-muted">Current week</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card text-center animate-slide-up">
                                <div class="card-body">
                                    <i class="fas fa-shopping-cart fa-3x text-primary mb-3"></i>
                                    <h5>Pending Orders</h5>
                                    <h3 class="text-primary" id="pending-orders-count">0</h3>
                                    <small class="text-muted">To fulfill</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card text-center animate-slide-up">
                                <div class="card-body">
                                    <i class="fas fa-coins fa-3x text-warning mb-3"></i>
                                    <h5>Inventory Value</h5>
                                    <h3 class="text-warning" id="inventory-value">₹0.00</h3>
                                    <small class="text-muted">Current week</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row g-4">
                        <h2 class="section-title">Add Product to Inventory</h2>
                        <div class="row justify-content-center">
                            <div class="col-lg-8 col-xl-6">
                                <div class="card-body">
                                    <div class="row g-3 align-items-end">
                                        <div class="col-md-6">
                                            <label for="itmProduct" class="form-label">Select Product</label>
                                            <select class="form-select itmProduct" name="itmProduct" id="itmProduct">
                                                <option value="">Loading products...</option>
                                            </select>
                                        </div>
                                        <div class="col-md-4">
                                            <label for="itmQuantity" class="form-label">Quantity</label>
                                            <input type="number" class="form-control" name="itmQuantity" id="itmQuantity" required min="1" placeholder="Enter quantity">
                                        </div>
                                        <div class="col-md-2">
                                            <button type="button" class="ADDPRODUCT btn btn-success w-100">
                                                <i class="fas fa-plus me-1"></i>Add
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div id="add-item-result" class="alert mt-3" style="display: none;"></div>
                        </div>
                        <div class="items items-enhanced">
                            <div class="item item-enhanced d-none border py-3 m-3 container h-auto">
                                <h4 class="item-title m-3">Spinach</h4>
                                <div class="d-block container d-flex">
                                    <div class="col-10 d-flex">
                                        <table class="table table-enhanced table-striped border">
                                            <thead class="table-head-enhanced">
                                                <tr>
                                                    <th scope="col">PRODUCT ID</th>
                                                    <th scope="col">QUANTITY</th>
                                                    <th scope="col">UNIT MEASURE</th>
                                                    <th scope="col">PRICE/unit</th>
                                                    <th scope="col">TOTAL</th>
                                                </tr>
                                            </thead>
                                        </table>
                                    </div>
                                    <div class="col-2 m-1 d-none d-sm-block container text-center action-buttons">
                                        <button type="button" class="col mt-1 btn btn-enhanced btn-success">EDIT</button>
                                        <button type="button" class="col mt-1 btn btn-enhanced btn-danger">DELETE</button>
                                    </div>
                                </div>
                                <div class="col-2 m-1 d-sm-none d-inline container text-center action-buttons-mobile">
                                    <button type="button" class="col mt-1 btn btn-enhanced btn-success">EDIT</button>
                                    <button type="button" class="col mt-1 btn btn-enhanced btn-danger">DELETE</button>
                                </div>
                            </div>
                        </div>
                        <div class="submit-section mt-4 text-center">
                            <button type="button" class="col btn btn-enhanced my-2 mx-5 submission btn-success">SUBMIT SELECTION</button>
                        </div>
                        <div id="submission-result" class="alert-enhanced m-3 alert" style="display: none;"></div>

                        <h2 class="section-title">Current Week Inventory</h2>
                        <div class="col-12">
                            <div class="card shadow-sm animate-slide-up">
                                <div class="card-body p-0">
                                    <div class="table-responsive">
                                        <table class="table table-hover mb-0">
                                            <thead>
                                                <tr>
                                                    <th><i class="fas fa-box me-1"></i>Product Name</th>
                                                    <th><i class="fas fa-tags me-1"></i>Category</th>
                                                    <th><i class="fas fa-rupee-sign me-1"></i>Price</th>
                                                    <th><i class="fas fa-weight me-1"></i>Quantity</th>
                                                    <th class="text-center"><i class="fas fa-cogs me-1"></i>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody class="currentinventory-body">
                                                <!-- Current inventory data will load here -->
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div id="currentinventory-result" class="alert mt-3" style="display: none;"></div>
                        </div>
                    </div>
                    
                    <div class="row mt-4">
                        <div class="col-12">
                            <h2 class="section-title">Inventory History</h2>
                            <div class="row">
                                <div class="col-lg-4 mb-4">
                                    <div class="card shadow-sm">
                                        <div class="card-body">
                                            <form id="weekForm">
                                                <div class="mb-3">
                                                    <label for="weekDropdown" class="form-label">Choose Week</label>
                                                    <select class="form-select" id="weekDropdown" required>
                                                        <option value="">Loading weeks...</option>
                                                    </select>
                                                </div>
                                                <div class="d-grid">
                                                    <button type="submit" class="btn btn-primary">
                                                        <i class="fas fa-search me-1"></i>Show Inventory
                                                    </button>
                                                </div>
                                            </form>
                                            <!-- Copy to Current Week Button -->
                                            <button type="button" id="copyToCurrentWeekBtn" class="btn btn-success w-100 mt-3" style="display:none;">
                                                <i class="fas fa-copy me-2"></i>
                                                Copy to Current Week
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-lg-8 mb-4">
                                    <div class="card shadow-sm">
                                        <div class="card-body p-0">
                                            <div class="table-responsive">
                                                <table class="table table-hover mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>Product Name</th>
                                                            <th>Category</th>
                                                            <th>Price</th>
                                                            <th>Quantity</th>
                                                            <th>Date Added</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody class="inventory-body">
                                                        <!-- Historical inventory data will load here -->
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                    <div id="inventory-result" class="alert mt-3" style="display: none;"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row mt-4">
                        <div class="col-12">
                            <div id="farmerFulfillmentReportSection">
                                <h2 class="section-title">Fulfillment Checklist</h2>
                                <div class="row justify-content-center">
                                    <div class="col-lg-8">
                                        <div class="card shadow-sm">
                                            <div class="card-body">
                                                <form id="farmerChecklistWeekForm">
                                                    <div class="mb-3">
                                                        <label for="farmerChecklistWeekDropdown" class="form-label">Select Week</label>
                                                        <div class="input-group">
                                                            <select class="form-select" id="farmerChecklistWeekDropdown" required>
                                                                <option value="">Loading weeks...</option>
                                                            </select>
                                                            <button type="submit" class="btn btn-primary">
                                                                <i class="fas fa-search me-1"></i>View Tasks
                                                            </button>
                                                        </div>
                                                    </div>
                                                </form>
                                                
                                                <!-- Checklist Messages -->
                                                <div id="farmer-checklist-message" class="alert mt-3" style="display: none;"></div>
                                                
                                                <!-- Checklist Display Area -->
                                                <div id="farmerChecklistDisplayArea" class="mt-3">
                                                    <div class="text-center p-4 text-muted" id="no-checklist-message">
                                                        <i class="fas fa-clipboard-list fa-3x mb-3"></i>
                                                        <h5>Select a Week</h5>
                                                        <p>Choose a week to view your fulfillment checklist and customer orders.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="text-center py-4 mt-5" style="background: linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%); border-top: 2px solid rgba(76,175,80,0.1);">
        <div class="container">
            <p class="mb-0 text-muted">
                <i class="fas fa-seedling me-2 text-success"></i>
                © 2025 Kovai Natural Farmers - Farmer Portal. All rights reserved.
            </p>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="../public/js/jquery.js"></script>
    <script src="../public/js/bootstrap.min.js"></script>
    <script src="../public/js/addinv.js"></script>
    <script src="../public/js/clock.js"></script>  
</body>
</html>