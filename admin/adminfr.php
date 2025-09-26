<?php
session_start();
if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    header("Location: ../login/login.php");
    exit();
}
?>

<script>
    // Expose the per-session CSRF token to admin JavaScript safely
    window.CSRF_TOKEN = '<?php echo htmlspecialchars($_SESSION['csrf_token'] ?? '', ENT_QUOTES); ?>';
</script>

<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Google Font -->
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@200;300;400;600;700;800&display=swap" rel="stylesheet">
    <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"> -->

    <!-- Bootstrap CSS -->
    <link href="../public/css/bootstrap.min.css" rel="stylesheet" >
    <link rel="stylesheet" href="../public/css/admin.css">
    <link rel="icon" href="../public/Assets/pic.jpeg">

    <title>KNF Admin Panel</title>
</head>
<body class="paleGreen">
    <!-- this is the offcanvas-->
    <div class="offcanvas offcanvas-start sidebar " tabindex="-1" id="offcanvasExample">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title">
                <i class="fas fa-leaf me-2"></i>KNF Admin
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <div class="text-center mb-4">
                <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="KNF Logo">
                <h6 class="mt-2 text-success">Admin Dashboard</h6>
            </div>
            <nav>
                <a href="#" class="active">
                    <i class="fas fa-home me-2"></i>Dashboard
                </a>
                <a href="#one">
                    <i class="fas fa-ruler me-2"></i>UOM Master
                </a>
                <a href="#two">
                    <i class="fas fa-tags me-2"></i>Category Master
                </a>
                <a href="#three">
                    <i class="fas fa-box me-2"></i>Product Master
                </a>
                <a href="#four">
                    <i class="fas fa-route me-2"></i>Route Master
                </a>
                <a href="#five">
                    <i class="fas fa-users me-2"></i>Customer Registration
                </a>
                <a href="#six">
                    <i class="fas fa-user-tie me-2"></i>Supplier Registration
                </a>
                <a href="#seven">
                    <i class="fas fa-calendar me-2"></i>Week Master
                </a>
                <a href="#eight">
                    <i class="fas fa-clipboard-check me-2"></i>Order Fulfillment
                </a>
                <a href="../knft/logout.php">
                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                </a>
            </nav>
        </div>
    </div>
      
    <!-- the top bar -->
    <div class="container-fluid top-navbar p-0">
        <div class="row align-items-center darkGreen">
            <div class="col-auto">
                <button class="btn btn-link text-white p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                    <img src="../public/Assets/three-bars.svg">
                </button>
            </div>
            <div class="col-auto d-none d-lg-block">
                <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="KNF Logo">
            </div>
            <div class="col color-paleGreen" >
                <h1 class="mb-0">WELCOME </h1>
                <h2>ADMIN</h2>
                <p class="mb-0">Kovai Natural Farmers Management</p>
            </div>
            <div class="col-auto">
                <div id="clock" class="clock text-end">
                    <!-- The rest of the elements will be updated by the script -->
                </div>
            </div>
        </div>
    </div>

    <main class="container-fluid" style="margin-top: 2rem;">
        <div class="row">
            <div class="col-12">
                <section class="mb-5">
                    <h2 class="section-title">System Overview</h2>
                    <div class="row g-4">
                        <div class="col-md-3">
                            <div class="card text-center animate-slide-up">
                                <div class="card-body">
                                    <i class="fas fa-users fa-3x text-success mb-3"></i>
                                    <h5>Total Customers</h5>
                                    <h3 class="text-success" id="total-customers">
                                        <i class="fas fa-spinner fa-spin"></i>
                                    </h3>
                                    <small class="text-muted">Registered users</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card text-center animate-slide-up" style="animation-delay: 0.1s;">
                                <div class="card-body">
                                    <i class="fas fa-user-tie fa-3x text-primary mb-3"></i>
                                    <h5>Total Farmers</h5>
                                    <h3 class="text-primary" id="total-farmers">
                                        <i class="fas fa-spinner fa-spin"></i>
                                    </h3>
                                    <small class="text-muted">Suppliers</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card text-center animate-slide-up" style="animation-delay: 0.2s;">
                                <div class="card-body">
                                    <i class="fas fa-box fa-3x text-warning mb-3"></i>
                                    <h5>Total Products</h5>
                                    <h3 class="text-warning" id="total-products">
                                        <i class="fas fa-spinner fa-spin"></i>
                                    </h3>
                                    <small class="text-muted">Available items</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card text-center animate-slide-up" style="animation-delay: 0.3s;">
                                <div class="card-body">
                                    <i class="fas fa-shopping-cart fa-3x text-info mb-3"></i>
                                    <h5>Total Orders</h5>
                                    <h3 class="text-info" id="total-orders">
                                        <i class="fas fa-spinner fa-spin"></i>
                                    </h3>
                                    <small class="text-muted">All time</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Master Data Management -->
                <section class="mb-5">
                    <h2 class="section-title">Master Data Management</h2>
                    <div class="row g-3">
                        <div class="col-md-4">
                            <a href="#one" class="btn btn-success w-100 py-3 text-start">
                                <i class="fas fa-ruler me-3"></i>
                                <div>
                                    <strong>Unit of Measure</strong>
                                    <small class="d-block opacity-75">Manage measurement units</small>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="#two" class="btn btn-primary w-100 py-3 text-start">
                                <i class="fas fa-tags me-3"></i>
                                <div>
                                    <strong>Category Master</strong>
                                    <small class="d-block opacity-75">Manage product categories</small>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="#three" class="btn btn-success w-100 py-3 text-start">
                                <i class="fas fa-box me-3"></i>
                                <div>
                                    <strong>Product Master</strong>
                                    <small class="d-block opacity-75">Manage products</small>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="#four" class="btn btn-info w-100 py-3 text-start">
                                <i class="fas fa-route me-3"></i>
                                <div>
                                    <strong>Route Master</strong>
                                    <small class="d-block opacity-75">Manage delivery routes</small>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="#seven" class="btn btn-warning w-100 py-3 text-start">
                                <i class="fas fa-calendar me-3"></i>
                                <div>
                                    <strong>Week Master</strong>
                                    <small class="d-block opacity-75">Manage weekly cycles</small>
                                </div>
                            </a>
                        </div>
                    </div>
                </section>

                <!-- User Management -->
                <section class="mb-5">
                    <h2 class="section-title">User Management</h2>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <a href="#five" class="btn btn-primary w-100 py-3 text-start">
                                <i class="fas fa-users me-3"></i>
                                <div>
                                    <strong>Customer Registration</strong>
                                    <small class="d-block opacity-75">Add and manage customers</small>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-6">
                            <a href="#six" class="btn btn-success w-100 py-3 text-start">
                                <i class="fas fa-user-tie me-3"></i>
                                <div>
                                    <strong>Supplier Registration</strong>
                                    <small class="d-block opacity-75">Add and manage farmers</small>
                                </div>
                            </a>
                        </div>
                    </div>
                </section>

                <!-- Order Management -->
                <section class="mb-5">
                    <h2 class="section-title">Order Management</h2>
                    <div class="row g-3">
                        <div class="col-md-4">
                            <a href="#eight" class="btn btn-success w-100 py-3 text-start">
                                <i class="fas fa-ruler me-3"></i>
                                <div>
                                    <strong>Order Fulfillment</strong>
                                    <small class="d-block opacity-75">Manage order fulfillment</small>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="#nine" class="btn btn-primary w-100 py-3 text-start">
                                <i class="fas fa-tags me-3"></i>
                                <div>
                                    <strong>Farmer Rank</strong>
                                    <small class="d-block opacity-75">Manage farmer ranks</small>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="#ten" class="btn btn-info w-100 py-3 text-start">
                                <i class="fas fa-route me-3"></i>
                                <div>
                                    <strong>Allocate Orders to Farmers</strong>
                                    <small class="d-block opacity-75">Manage orders allocation</small>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="#eleven" class="btn btn-success w-100 py-3 text-start">
                                <i class="fas fa-box me-3"></i>
                                <div>
                                    <strong>Tray Status</strong>
                                    <small class="d-block opacity-75">Manage tray statuses</small>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="../knft/loadTempInventory.php" class="btn btn-warning w-100 py-3 text-start">
                                <i class="fas fa-calendar me-3"></i>
                                <div>
                                    <strong>Fill Temp Inventory</strong>
                                    <small class="d-block opacity-75">Load Temp_Inventory</small>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a id="lockButton" class="btn btn-info w-100 py-3 text-start">
                                <i class="fas fa-calendar me-3"></i>
                                <div>
                                    <strong>Activate Purchase Lock</strong>
                                    <small class="d-block opacity-75">purchase lock / unlock button</small>
                                </div>
                            </a>
                        </div>
                    </div>
                </section>

                <!-- Report Management -->
                <section class="mb-5">
                    <h2 class="section-title">Report Management</h2>
                    <div class="row g-3">
                        <div class="col-md-4">
                            <a href="../knft/transferFile.php" class="btn btn-success w-100 py-3 text-start">
                                <i class="fas fa-ruler me-3"></i>
                                <div>
                                    <strong>Raw Orders Report</strong>
                                    <small class="d-block opacity-75">Download raw orders</small>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="../knft/customer_order_fulfillment_report.php?download=1" class="btn btn-primary w-100 py-3 text-start">
                                <i class="fas fa-tags me-3"></i>
                                <div>
                                    <strong>Customer Order Fulfillment Report</strong>
                                    <small class="d-block opacity-75">Download customer order fulfillment report</small>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="../knft/delivery_routes_report.php?download=1" class="btn btn-success w-100 py-3 text-start">
                                <i class="fas fa-box me-3"></i>
                                <div>
                                    <strong>Delivery Routes Report</strong>
                                    <small class="d-block opacity-75">Download delivery routes report</small>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="../knft/weekly_report.php?download=1" class="btn btn-info w-100 py-3 text-start">
                                <i class="fas fa-route me-3"></i>
                                <div>
                                    <strong>Weekly Report</strong>
                                    <small class="d-block opacity-75">Download weekly report</small>
                                </div>
                            </a>
                        </div>
                        <div class="col-md-4">
                            <a href="../knft/weekly_invoice_report.php?download=1" class="btn btn-warning w-100 py-3 text-start">
                                <i class="fas fa-calendar me-3"></i>
                                <div>
                                    <strong>Weekly Invoice Report</strong>
                                    <small class="d-block opacity-75">Download weekly invoice report</small>
                                </div>
                            </a>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    </main>

    <div class="container d-flex justify-content-center">
        <div class="col-10 mt-3 text-md-start text-center mb-3">            
            <h2 class="mt-4">User Lock message</h2>
            <p class="mt-4  p-4 shadow rounded b-2 text-md-start text-center fw-bold">Current Lock message: <span id="lock-message"><?php echo htmlspecialchars($_SESSION['cust_msg'] ?? '', ENT_QUOTES, 'UTF-8'); ?> </span> </p>
        </div>
    </div>

    <!-- page 1 uom-->
    <div class="page" id="one">
        <div class="container-fluid top-navbar p-0">
            <div class="row align-items-center darkGreen">
                <div class="col-auto">
                    <button class="btn btn-link text-white p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                        <img src="../public/Assets/three-bars.svg">
                    </button>
                </div>
                <div class="col-auto d-none d-lg-block">
                    <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="KNF Logo">
                </div>
                <div class="col color-paleGreen" >
                    <h1 class="mb-0">UOM Master</h1>
                    <p class="mb-0">Unit of Measure Management</p>
                </div>
                <div class="col-auto">
                    <div id="clock" class="clock text-end">
                        <!-- The rest of the elements will be updated by the script -->
                    </div>
                </div>
            </div>
        </div>
        <main class="container-fluid" style="margin-top: 2rem;">
            <!-- Breadcrumb Navigation -->
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#" class="text-success"><i class="fas fa-home me-1"></i>Dashboard</a></li>
                    <li class="breadcrumb-item active" aria-current="page">UOM Master</li>
                </ol>
            </nav>
            <div class="d-flex justify-content-center">
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card-body">
                        <form class="mb-3" id="uomForm">
                            <label for="UoM" class="form-label">UoM Name</label>
                            <input type="text" class="form-control" name="UoM" id="UoM" required placeholder="e.g., Kilogram, Liter">
                            
                            <label for="UoMID" class="form-label">UoM ID</label>
                            <input type="text" class="form-control" name="UoMID" id="UoMID" required placeholder="e.g., kg, l">

                            <button type="submit" class="btn btn-success mt-2 submit-uom">Add UOM</button>
                        </form>
                    </div>
                </div>
            </div>
            <div id="result-uom" class="m-3 alert" style="display: none;"></div>
            <div class="uomHolder m-3 p-2 White w-auto h-auto" style="animation-delay: 0.1s;">
                <h5 class="text-center mb-3">Existing UoMs</h5>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th scope="col">UoM ID</th>
                                    <th scope="col">UoM Name</th>
                                    <th scope="col" style="width: 200px;">Action</th>
                                </tr>
                            </thead>
                            <tbody class="uom-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- page 2 category page-->
    <div class="page" id="two">
        <div class="container-fluid top-navbar p-0">
            <div class="row align-items-center darkGreen">
                <div class="col-auto">
                    <button class="btn btn-link text-white p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                        <img src="../public/Assets/three-bars.svg">
                    </button>
                </div>
                <div class="col-auto d-none d-lg-block">
                    <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="KNF Logo">
                </div>
                <div class="col color-paleGreen" >
                    <h1 class="mb-0">Category Master</h1>
                    <p class="mb-0">Category Management</p>
                </div>
                <div class="col-auto">
                    <div id="clock" class="clock text-end">
                        <!-- The rest of the elements will be updated by the script -->
                    </div>
                </div>
        </div>
        <main class="container-fluid" style="margin-top: 2rem;">
            <!-- Breadcrumb Navigation -->
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#" class="text-success"><i class="fas fa-home me-1"></i>Dashboard</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Category Master</li>
                </ol>
            </nav>
            <div class="d-flex justify-content-center">
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card-body">
                        <form class="mb-3" id="categoryForm">
                            <label for="categoryDesc" class="form-label">Category Name</label>
                            <input type="text" class="form-control" name="categoryDesc" id="categoryDesc" required placeholder="e.g., Vegetables, Fruits">
                            
                            <label for="categoryType" class="form-label">category ID</label>
                            <input type="text" class="form-control" name="categoryType" id="categoryType" required placeholder="e.g., VEG, FRT">
                
                            <button type="submit" class="btn btn-success mt-2 submit-category">Add Category</button>
                        </form>
                    </div>
                </div>
            </div>
            <div id="result-category" class="m-3 alert" style="display: none;"></div>
            <div class="categoryHolder m-3 p-2 White w-auto h-auto" style="animation-delay: 0.1s;">
                <h5 class="text-center mb-3">Existing Categories</h5>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">Category ID</th>
                                    <th scope="col">Category Name</th>
                                    <th scope="col" style="width: 200px;">Action</th>
                                </tr>
                            </thead>
                            <tbody class="category-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- page 3 product-->
    <div class="page" id="three">
        <div class="container-fluid top-navbar p-0">
            <div class="row align-items-center darkGreen">
                <div class="col-auto">
                    <button class="btn btn-link text-white p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                        <img src="../public/Assets/three-bars.svg">
                    </button>
                </div>
                <div class="col-auto d-none d-lg-block">
                    <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="KNF Logo">
                </div>
                <div class="col color-paleGreen" >
                    <h1 class="mb-0">Product Master</h1>
                    <p class="mb-0">Product Management</p>
                </div>
                <div class="col-auto">
                    <div id="clock" class="clock text-end">
                        <!-- The rest of the elements will be updated by the script -->
                    </div>
                </div>
        </div>
        <main class="container-fluid" style="margin-top: 2rem;">
            <!-- Breadcrumb Navigation -->
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#" class="text-success"><i class="fas fa-home me-1"></i>Dashboard</a></li>
                    <li class="breadcrumb-item active" aria-current="page">UOM Master</li>
                </ol>
            </nav>
            <div class="d-flex justify-content-center">
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card-body">
                        <form id="productForm">
                            <h5 class="text-center mb-3">Add New Product</h5>
                            <label for="itmProduct" class="form-label">Product Name:</label>
                            <input type="text" class="form-control" name="itmProduct" id="itmProduct" required placeholder="e.g., Tomato, Carrot">

                            <label for="itmCategory" class="form-label">Category:</label>
                            <select class="form-select itmCategory" name="itmCategory" id="itmCategory" required>
                                <option value="">Select Category...</option>
                            </select>

                            <label for="itmUoM" class="form-label">UoM:</label>
                            <select class="form-select itmUoM" name="itmUoM" id="itmUoM" required>
                                <option value="">Select UoM...</option>
                            </select>

                            <label for="itmRate" class="form-label">Base Rate/UoM:</label>
                            <input type="number" step="0.01" class="form-control itmRate" name="itmRate" id="itmRate" required placeholder="0.00">

                            <label for="itmMinQuantity" class="form-label">Minimum Order Quantity:</label>
                            <input type="number" step="0.01" class="form-control itmMinQuantity" name="itmMinQuantity" id="itmMinQuantity" required placeholder="0">

                            <label for="itmStep" class="form-label">Step:</label>
                            <input type="number" step="0.01" class="form-control itmStep" name="itmStep" id="itmStep" required placeholder="0.5">

                            <label for="itmDurability" class="form-label">Durability (days):</label>
                            <input type="number" class="form-control itmDurability" name="itmDurability" id="itmDurability" required placeholder="7">

                            <div class="text-center mt-3">
                                <button type="button" class="ADDPRODUCT btn btn-success">Add Product</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div id="result-product" class="m-3 alert" style="display: none;"></div>
            <div class="productHolder m-3 p-2 White w-auto h-auto">
                <h5 class="text-center mb-3">Existing Products</h5>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-success table-hover">
                            <thead>
                            <tr>
                                <th scope="col">ID</th>
                                <th scope="col">Category ID</th>
                                <th scope="col">Product</th>
                                <th scope="col">UoM ID</th>
                                <th scope="col">Minimum Quantity</th>
                                <th scope="col">Step size</th>
                                <th scope="col">Durability</th>
                                <th scope="col">Rate/UoM</th>
                                <th scope="col" style="width: 200px;">Action</th>
                            </tr>
                            </thead>
                            <tbody class="product-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- page 4 route-->
    <div class="page" id="four">
        <div class="container-fluid top-navbar p-0">
            <div class="row align-items-center darkGreen">
                <div class="col-auto">
                    <button class="btn btn-link text-white p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                        <img src="../public/Assets/three-bars.svg">
                    </button>
                </div>
                <div class="col-auto d-none d-lg-block">
                    <img src="../public/Assets/pic.jpeg" class="profile rounded-circle border p-0 border-dark" alt="Logo">
                </div>
                <div class="col color-paleGreen">
                    <h1 class="mb-0">Route Master</h1>
                    <p class="mb-0">Manage Delivery Routes</p>
                </div>
                <div class="col-auto">
                    <div id="clock" class="clock text-end">
                        <!-- The rest of the elements will be updated by the script -->
                    </div>
                </div>
            </div>
        </div>

        <main class="container-fluid" style="margin-top: 2rem;">
            <!-- Breadcrumb Navigation -->
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#" class="text-success"><i class="fas fa-home me-1"></i>Dashboard</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Route Master</li>
                </ol>
            </nav>
            <div class="d-flex justify-content-center">
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card-body">
                        <form class="mb-3" id="routeForm">
                            <label for="route" class="form-label">Route</label>
                            <input type="text" class="form-control" name="route" id="route" required placeholder="e.g., City A to City B">

                            <label class="form-label mt-2">Delivery Type</label><br>
                            <div class="form-check">
                                <input type="radio" id="pd" name="deliveryType" value="PD" class="form-check-input" required>
                                <label for="pd" class="form-check-label">Personal Delivery</label>
                            </div>
                            <div class="form-check">
                                <input type="radio" id="vd" name="deliveryType" value="VD" class="form-check-input" required>
                                <label for="vd" class="form-check-label">Van Delivery</label>
                            </div>

                            <label for="rate" class="form-label mt-2">Delivery Charge</label>
                            <input type="number" min="0" step="0.01" class="form-control" name="rate" id="rate" required placeholder="e.g., 50.00">

                            <button type="submit" class="btn btn-success mt-3 submit-route">Add Route</button>
                        </form>
                    </div>
                </div>
            </div>
            <div id="result-route" class="m-3 alert" style="display: none;"></div>
            <div class="routeHolder m-3 p-2 White w-auto h-auto" style="animation-delay: 0.1s;">
                <h5 class="text-center mb-3">Existing Routes</h5>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th scope="col">Route</th>
                                    <th scope="col">Delivery Type</th>
                                    <th scope="col">Rate</th>
                                    <th scope="col" style="width: 200px;">Action</th>
                                </tr>
                            </thead>
                            <tbody class="route-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- page 5 customer form-->
    <div class="page" id="five">
        <div class="container-fluid top-navbar p-0">
            <div class="row align-items-center darkGreen">
                <div class="col-auto">
                    <button class="btn btn-link text-white p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                        <img src="../public/Assets/three-bars.svg">
                    </button>
                </div>
                <div class="col-auto d-none d-lg-block">
                    <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="KNF Logo">
                </div>
                <div class="col color-paleGreen" >
                    <h1 class="mb-0">Customer Registration</h1>
                    <p class="mb-0">Manage Customer Information</p>
                </div>
                <div class="col-auto">
                    <div id="clock" class="clock text-end">
                        <!-- The rest of the elements will be updated by the script -->
                    </div>
                </div>
        </div>
        <main class="container-fluid" style="margin-top: 2rem;">
            <!-- Breadcrumb Navigation -->
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#" class="text-success"><i class="fas fa-home me-1"></i>Dashboard</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Customer Registration</li>
                </ol>
            </nav>
            <div class="d-flex justify-content-center">
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card-body">
                        <form class="mb-3" id="customerForm">
                            <label for="customerName" class="form-label">Customer Name</label>
                            <input type="text" class="form-control" name="customerName" id="customerName" required>
                            
                            <label scope="row" for="routeID" class="form-label">Assign Route</label>
                            <select class="form-select routeID" name="routeID" id="routeID" required>
                                <option value="">Select Route...</option>
                            </select>

                            <label for="contact" class="form-label">Contact No</label>
                            <input type="tel" class="form-control" name="contact" id="contact" required pattern="[0-9]{10,}" title="Enter a valid phone number">

                            <label for="alternativeContact" class="form-label">Alternative Contact No</label>
                            <input type="tel" class="form-control" name="alternativeContact" id="alternativeContact">

                            <label for="address" class="form-label">Address</label>
                            <textarea class="form-control" name="address" id="address" rows="2" required></textarea>

                            <label for="emailID" class="form-label">Email ID</label>
                            <input type="email" class="form-control" name="emailID" id="emailID" required>

                            <label for="customerPassword" class="form-label">Password</label>
                            <input type="password" class="form-control" name="password" id="customerPassword" required>

                            <input type="submit" class="btn btn-success mt-2 submit-customer" value="Register Customer">
                        </form>
                    </div>
                </div>
            </div>
            <div id="result-customer" class="m-3 alert" style="display: none;"></div>
            <div class="customerHolder m-3 p-2 White w-auto h-auto">
                <h5 class="text-center mb-3">Existing Customers</h5>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-success table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">Customer Name</th>
                                    <th scope="col">Route ID</th>
                                    <th scope="col">Contact No</th>
                                    <th scope="col">Alternative Contact No</th>
                                    <th scope="col">Address</th>
                                    <th scope="col">Email ID</th>
                                    <th scope="col" style="width: 200px;">Action</th>
                                </tr>
                            </thead>
                            <tbody class="customer-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- page 6 supplier form-->
    <div class="page" id="six">
        <div class="container-fluid top-navbar p-0">
            <div class="row align-items-center darkGreen">
                <div class="col-auto">
                    <button class="btn btn-link text-white p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                        <img src="../public/Assets/three-bars.svg">
                    </button>
                </div>
                <div class="col-auto d-none d-lg-block">
                    <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="KNF Logo">
                </div>
                <div class="col color-paleGreen" >
                    <h1 class="mb-0">Supplier Registration</h1>
                    <p class="mb-0">Manage Supplier Information</p>
                </div>
                <div class="col-auto">
                    <div id="clock" class="clock text-end">
                        <!-- The rest of the elements will be updated by the script -->
                    </div>
                </div>
        </div>
        <main class="container-fluid" style="margin-top: 2rem;">
            <!-- Breadcrumb Navigation -->
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#" class="text-success"><i class="fas fa-home me-1"></i>Dashboard</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Supplier Registration</li>
                </ol>
            </nav>
            <div class="d-flex justify-content-center">
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card-body">
                        <form class="mb-3" id="supplierForm">
                            <label for="supplierName" class="form-label">Farmer Name</label>
                            <input type="text" class="form-control" name="supplierName" id="supplierName" required>
                            
                            <label for="farmLocation" class="form-label">Farm Location</label>
                            <input type="text" class="form-control" name="farmLocation" id="farmLocation" required>

                            <label for="contact" class="form-label">Contact No</label>
                            <input type="tel" class="form-control" name="contact" id="contact" required pattern="[0-9]{10,}" title="Enter a valid phone number">

                            <label for="alternativeContact" class="form-label">Alternative Contact No</label>
                            <input type="tel" class="form-control" name="alternativeContact" id="alternativeContact">

                            <label for="farmSize" class="form-label">Farm Size (In Acres)</label>
                            <input type="number" class="form-control" name="farmSize" id="farmSize" required>

                            <label for="emailID" class="form-label">Email ID</label>
                            <input type="email" class="form-control" name="emailID" id="emailID" required>

                            <label for="supplierPassword" class="form-label">Password</label>
                            <input type="password" class="form-control" name="password" id="supplierPassword" required>

                            <input type="submit" class="btn btn-success mt-2 submit-supplier" value="Submit">
                        </form>
                    </div>
                </div>
            </div>
            <div id="result-supplier" class="m-3 alert" style="display: none;"></div>
            <div class="supplierHolder m-3 p-2 White w-auto h-auto">
                <h5 class="text-center mb-3">Existing Suppliers</h5>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-success table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">Farmer Name</th>
                                    <th scope="col">Farm Location</th>
                                    <th scope="col">Contact No</th>
                                    <th scope="col">Alternative Contact No</th>
                                    <th scope="col">Farm Size</th>
                                    <th scope="col">Email ID</th>
                                    <th scope="col" style="width: 200px;">Action</th>
                                </tr>
                            </thead>
                            <tbody class="supplier-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- PAGE 7 WEEK MASTER -->
    <div class="page" id="seven">
        <div class="container-fluid top-navbar p-0">
            <div class="row align-items-center darkGreen">
                <div class="col-auto">
                    <button class="btn btn-link text-white p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                        <img src="../public/Assets/three-bars.svg">
                    </button>
                </div>
                <div class="col-auto d-none d-lg-block">
                    <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="KNF Logo">
                </div>
                <div class="col color-paleGreen" >
                    <h1 class="mb-0">Week Master</h1>
                    <p class="mb-0">Week Management</p>
                </div>
                <div class="col-auto">
                    <div id="clock" class="clock text-end">
                        <!-- The rest of the elements will be updated by the script -->
                    </div>
                </div>
        </div>
        <main class="container-fluid" style="margin-top: 2rem;">
            <!-- Breadcrumb Navigation -->
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#" class="text-success"><i class="fas fa-home me-1"></i>Dashboard</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Week Master</li>
                </ol>
            </nav>
            <div class="d-flex justify-content-center">
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card-body">
                        <form class="mb-3" id="weekForm" >
                            <label for="weekDate" class="form-label">ENTER WEEK DATE IN DDMMYY format</label>
                            <input type="date" class="form-control" name="weekDate" id="weekDate" required>
                            <input type="hidden" id="formattedWeekDate" name="formattedWeekDate">
                            <input type="submit" class="btn btn-success mt-2 submit-week" value="Submit">
                        </form>
                    </div>
                </div>
            </div>
            <div id="result-week" class="m-3 alert" style="display: none;"></div>
            <div class="weekHolder m-3 p-2 White w-auto h-auto" style="animation-delay: 0.1s;">
                <h5 class="text-center mb-3">Existing Weeks</h5>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th scope="col">Week ID</th>
                                    <th scope="col">Week Date (YYYY-MM-DD)</th>
                                    <th scope="col" style="width: 200px;">Action</th>
                                </tr>
                            </thead>
                            <tbody class="week-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- PAGE 8 Order fullfill -->
    <div class="page" id="eight">
        <div class="container-fluid top-navbar p-0">
            <div class="row align-items-center darkGreen">
                <div class="col-auto">
                    <button class="btn btn-link text-white p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                        <img src="../public/Assets/three-bars.svg">
                    </button>
                </div>
                <div class="col-auto d-none d-lg-block">
                    <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="KNF Logo">
                </div>
                <div class="col color-paleGreen" >
                    <h1 class="mb-0">Order fulfillment Master</h1>
                    <p class="mb-0">Order Management</p>
                </div>
                <div class="col-auto">
                    <div id="clock" class="clock text-end">
                        <!-- The rest of the elements will be updated by the script -->
                    </div>
                </div>
        </div>
        <main class="container-fluid" style="margin-top: 2rem;">
            <!-- Breadcrumb Navigation -->
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#" class="text-success"><i class="fas fa-home me-1"></i>Dashboard</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Order fulfillment Master</li>
                </ol>
            </nav>
            <div class="d-flex justify-content-center">
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card-body">
                        <form class="mb-3" id="fullfillweekForm">
                            <label for="weekDropdown" class="form-label label-enhanced">Select Week</label>
                            <select class="form-select form-control-enhanced" id="weekDropdown" required>
                                <option value="">Loading weeks...</option>
                            </select>
                            <div class="mb-3 mt-3">
                                <label class="form-label fw-bold">Order By:</label>
                                <div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="radio" name="get_mode" id="modeTimestamp" value="0" checked>
                                        <label class="form-check-label" for="modeTimestamp">Timestamp</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="radio" name="get_mode" id="modeCustomer" value="1">
                                        <label class="form-check-label" for="modeCustomer">Customer</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="radio" name="get_mode" id="modeProduct" value="2">
                                        <label class="form-check-label" for="modeProduct">Product</label>
                                    </div>
                                    <div class="form-check form-check-inline">
                                        <input class="form-check-input" type="radio" name="get_mode" id="modeUom" value="3">
                                        <label class="form-check-label" for="modeUom">UOM</label>
                                    </div>
                                </div>
                            </div>
                            <input type="submit" class="btn-success btn-enhanced m-3 submit-week btn" value="Load Inventory">
                        </form>
                    </div>
                </div>
            </div>
            <div id="result-week" class="m-3 alert" style="display: none;"></div>
            <div class="fulFillHolder m-3 p-2 White w-auto h-auto" style="animation-delay: 0.1s;">
                <h5 class="text-center mb-3">Existing Weeks</h5>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-success table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">Date</th>
                                    <th scope="col">Customer</th>
                                    <th scope="col">Product</th>
                                    <th scope="col">Ordered Quantity and Rate</th>
                                    <th scope="col">Fulfill Quantity</th>
                                    <th scope="col">Updated Quantity</th>
                                    <th scope="col" style="width: 200px;">Action</th>
                                </tr>
                            </thead>
                            <tbody class="fulfill-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- PAGE 9 farmer rank -->
    <div class="page" id="nine">
        <div class="container-fluid top-navbar p-0">
            <div class="row align-items-center darkGreen">
                <div class="col-auto">
                    <button class="btn btn-link text-white p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                        <img src="../public/Assets/three-bars.svg">
                    </button>
                </div>
                <div class="col-auto d-none d-lg-block">
                    <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="KNF Logo">
                </div>
                <div class="col color-paleGreen" >
                    <h1 class="mb-0">Farmer Rank Master</h1>
                    <p class="mb-0">Farmer Rank Management</p>
                </div>
                <div class="col-auto">
                    <div id="clock" class="clock text-end">
                        <!-- The rest of the elements will be updated by the script -->
                    </div>
                </div>
        </div>
        <main class="container-fluid" style="margin-top: 2rem;">
            <!-- Breadcrumb Navigation -->
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#" class="text-success"><i class="fas fa-home me-1"></i>Dashboard</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Farmer Rank Master</li>
                </ol>
            </nav>
            <div class="farmerRankHolder m-3 p-2 White w-auto h-auto" style="animation-delay: 0.1s;">
                <h5 class="text-center mb-3">Farmer Ranks</h5>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th scope="col">Product Name</th>
                                    <th scope="col">Farmer Name</th>
                                    <th scope="col">Rank</th>
                                    <th scope="col">New Rank</th>
                                    <th scope="col" style="width: 200px;">Action</th>
                                </tr>
                            </thead>
                            <tbody class="farmer-rank-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <!-- PAGE TEN: FARMER ORDER ALLOCATION & NOTIFICATION -->
    <div class="page" id="ten">
        <div class="container-fluid top-navbar p-0">
            <div class="row align-items-center darkGreen">
                <div class="col-auto">
                    <button class="btn btn-link text-white p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                        <img src="../public/Assets/three-bars.svg">
                    </button>
                </div>
                <div class="col-auto d-none d-lg-block">
                    <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="KNF Logo">
                </div>
                <div class="col color-paleGreen" >
                    <h1 class="mb-0">Order Allocation to Farmers</h1>
                    <p class="mb-0">Order Allocation Management</p>
                </div>
                <div class="col-auto">
                    <div id="clock" class="clock text-end">
                        <!-- The rest of the elements will be updated by the script -->
                    </div>
                </div>
        </div>
        <main class="container-fluid" style="margin-top: 2rem;">
            <!-- Breadcrumb Navigation -->
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#" class="text-success"><i class="fas fa-home me-1"></i>Dashboard</a></li>
                    <li class="breadcrumb-item active" aria-current="page">Order Allocation to Farmers</li>
                </ol>
            </nav>
            <div class="d-flex justify-content-center">
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card-body">
                        <h4 class="card-title text-center mb-4">Finalize Week & Assign Orders</h4>
                        <p class="text-muted text-center mb-3">
                            This process will assign customer orders for the selected week to farmers based on their rank and available inventory.
                            It will also enable the fulfillment checklist visibility for farmers.
                        </p>
                        <form class="mb-3" id="allocationForm">
                            <div class="mb-3">
                                <label for="allocationWeekId" class="form-label fw-bold">Select Week to Process:</label>
                                <select id="allocationWeekId" class="form-select form-select-lg" required>
                                    <option value="" selected disabled>Loading weeks...</option>
                                    <!-- Weeks will be populated by JavaScript -->
                                </select>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn btn-primary btn-lg">
                                    <i class="fas fa-cogs me-2"></i>Run Allocation & Notify Farmers
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div id="allocationResult" class="mt-4 alert" style="display:none;"></div>
        </main>
    </div>

    <!-- Page 11: tray management -->
    <div class="page" id="eleven">
        <div class="container-fluid top-navbar p-0">
            <div class="row align-items-center darkGreen">
                <div class="col-auto">
                    <button class="btn btn-link text-white p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                        <img src="../public/Assets/three-bars.svg">
                    </button>
                </div>
                <div class="col-auto d-none d-lg-block">
                    <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="KNF Logo">
                </div>
                <div class="col color-paleGreen" >
                    <h1 class="mb-0">Tray Management</h1>
                    <p class="mb-0">Tray Management</p>
                </div>
                <div class="col-auto">
                <div class="clock text-end">
                    <div class="fas fa-clock me-1">
                        <div class="clock">date</div>
                    </div>
                </div>
            </div>
        </div>
        <main class="container-fluid" style="margin-top: 2rem;">
            <!-- Breadcrumb Navigation -->
            <nav aria-label="breadcrumb" class="mb-4">
                <ol class="breadcrumb">
                    <li class="breadcrumb-item"><a href="#" class="text-success"><i class="fas fa-home me-1"></i>Dashboard</a></li>
                    <li class="breadcrumb-item active" aria-current="page">UOM Master</li>
                </ol>
            </nav>
            <div class="d-flex justify-content-center">
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card-body">
                        <form id="trayWeekForm" class="mb-3">
                            <div class="col-md">
                                <label for="trayWeekDropdown" class="form-label fw-bold text-success mb-1">
                                    <i class="fas fa-calendar-alt me-2"></i>Select Week:
                                </label>
                                <select class="form-select form-select-lg shadow-sm" id="trayWeekDropdown" style="border: 2px solid #28a745; border-radius: 12px;">
                                    <option value="" selected>Loading weeks...</option>
                                </select>
                            </div>
                            <div class="col-md-auto">
                                <button type="submit" class="btn btn-lg btn-success shadow-sm w-100" style="border-radius: 12px;">
                                    <i class="fas fa-search me-2"></i>Show Tray Status
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <div class="trayStatusHolder m-3 p-2 White w-auto h-auto">
                <h5 class="text-center mb-3">Tray Status</h5>
                <div class="card-body p-0">
                    <div class="table-responsive">
                        <table class="table table-success table-hover">
                            <thead>
                                <tr>
                                    <th scope="col">Customer</th>
                                    <th scope="col">Route</th>
                                    <th scope="col">Tray number</th>
                                    <th scope="col">Tray Status</th>
                                    <th scope="col">Edit Tray</th>
                                    <th scope="col" style="width: 200px;">Toggle</th>
                                </tr>
                            </thead>
                            <tbody class="tray-status-body"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        <main>
    </div>

    <!-- Floating Notes Button -->
    <a class="notes-float-btn" data-bs-toggle="offcanvas" data-bs-target="#adminNotesOffcanvas" aria-controls="adminNotesOffcanvas" title="View Customer Notes">
        <i class="fas fa-sticky-note me-2"></i>
        <span class="d-none d-md-inline ms-2">Customer Notes</span>
    </a>

    <!-- Offcanvas for Customer Notes -->
    <div class="offcanvas offcanvas-end" tabindex="-1" id="adminNotesOffcanvas" aria-labelledby="adminNotesOffcanvasLabel">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="adminNotesOffcanvasLabel"><i class="fas fa-sticky-note me-2"></i>Customer Notes</h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body p-0">
            <div id="admin-notes-list" class="list-group list-group-flush">
                <div class="text-center p-4 text-muted" id="notes-loading-msg">
                    <i class="fas fa-spinner fa-spin fa-2x"></i><br>Loading notes...
                </div>
            </div>
        </div>
    </div>
    
    <!-- Footer -->
    <footer class="text-center py-4 mt-5" style="background: linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%); border-top: 2px solid rgba(76,175,80,0.1);">
        <div class="container">
            <p class="mb-0 text-muted">
                <i class="fas fa-leaf me-2 text-success"></i>
                © 2025 Kovai Natural Farmers. All rights reserved.
            </p>
        </div>
    </footer>

    <!-- Scripts -->
    <script src="../public/js/jquery.js" ></script>
    <script src="../public/js/bootstrap.min.js"></script>
    <script src="../public/js/clock.js"></script>
    <script src="../public/js/admin.js"></script>
</body>
</html>
