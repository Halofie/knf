<?php
session_start();
if (!isset($_SESSION['is_admin']) || $_SESSION['is_admin'] !== true) {
    header("Location: ../login/login.html");
    exit();
}
?>

<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

    <!-- Google Font -->
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,300,400,700" rel="stylesheet">

    <!-- Bootstrap CSS -->
    <link href="../public/css/bootstrap.min.css" rel="stylesheet" >
    <!-- <script src="../public/js/jquery.js"></script> -->

    <!-- Custom CSS -->
    <link rel="stylesheet" href="../public/css/admin.css">
    <link rel="icon" href="../public/Assets/pic.jpeg">

    <title>Kovai Natural Farmers</title>
</head>
<body class="paleGreen">
    <!-- this is the offcanvas-->
    <div class="offcanvas offcanvas-start sidebar " tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
        <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="offcanvasExampleLabel">MENU</h5>
            <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div class="offcanvas-body">
            <div class="col d-flex justify-content-center">
                <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="logo">
            </div>
            <div>
                <a class="btn" href="../home.html">HOME</a>
                <a class="btn" href="#one">UOM MASTER</a>
                <a class="btn" href="#two">CATEGORY MASTER</a>
                <a class="btn" href="#three">PRODUCT MASTER</a>
                <a class="btn" href="#four">ROUTE MASTER</a>
                <a class="btn" href="#five">CUSTOMER REGISTRATION</a>
                <a class="btn" href="#six">SUPPLIER REGISTRATION</a>
                <a class="btn" href="#seven">WEEK MASTER</a>
                <a class="btn" href="#eight">ORDER FULFILL</a>
                <a class="btn" href="#nine">FARMER RANK</a>
                <a class="btn" href="#ten">ALLOCATE TO FARMERS</a>
                <a class="btn" href="#eleven">TRAY STATUS</a>


                <a class="btn" href="../knft/logout.php">LOGOUT</a>
            </div>
        </div>
    </div>
      
    <!-- the top bar -->
    <div class=" h-auto  p-2 d-flex justify-content-between row darkGreen d-fixed">
        <div class="col-1 d-flex justify-content-center ">
            <button class="btn d-block p-0 " type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                <img src="../public/Assets/three-bars.svg">
            </button>
        </div>
        <div class="col-2 d-none d-lg-flex justify-content-center">
            <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="logo">
        </div>
        <div class="col-6 color-paleGreen" >
            <h1>WELCOME </h1>
            <h2>ADMIN</h2>
        </div>
        <div class="col-3 d-flex justify-content-end">
            <div class="m-0 d-block color-paleGreen justify-content-end">
                <div class="clock">date</div>
            </div>
        </div>
    </div>

    <div class="container d-flex justify-content-center">
        <div class="col-10 mt-3 text-md-start text-center mb-3">
            <h2 class="mt-4">Masters</h2>
            <a class="btn m-2 btn-primary" href="#one">Unit of Measure Master</a>
            <a class="btn m-2 btn-primary" href="#two">Category Master</a>
            <a class="btn m-2 btn-primary" href="#three">Product Master</a>
            <a class="btn m-2 btn-primary" href="#four">Route Master</a>
            <a class="btn m-2 btn-primary" href="#seven">Week Master</a>

            <h2 class="mt-4">Registrations</h2>
            <a class="btn m-2 btn-primary" href="#five">Customer Registration</a>
            <a class="btn m-2 btn-primary" href="#six">Supplier Registration</a>

            <h2 class="mt-4">Ranking and Fullfillment</h2>
            <a class="btn m-2 btn-primary" href="#eight">Order Fulfillment</a>
            <a class="btn m-2 btn-primary" href="#nine">Farmer Rank</a>
            <a class="btn m-2 btn-primary" href="#eleven">Tray Status</a>

            <h2 class="mt-4">Week Flow Controllers</h2>
            <a class="btn m-2 btn-primary" href="#ten">Allocate Orders to Farmers</a>
            <!-- <a class="btn m-3 btn-primary" href="../knft/trunc_temp.php">clear Temp_inv</a> -->
            <a class="btn m-2 btn-primary" href="../knft/loadTempInventory.php">load Temp_inv</a>
            <a class="btn m-2" id="lockButton">lock/unlock button</a>

            <h2 class="mt-4">Reports</h2>
            <a class="btn m-2 btn-secondary" href="../knft/transferFile.php">Download Orders</a>
            <a class="btn m-2 btn-secondary" href="../knft/customer_order_fulfillment_report.php?download=1">Download Customer Order Fulfillment Report</a>
            <a class="btn m-2 btn-secondary" href="../knft/delivery_routes_report.php?download=1">Download Delivery Routes Report</a>
            <a class="btn m-2 btn-secondary" href="../knft/weekly_report.php?download=1">Download Weekly Report</a>
            <a class="btn m-2 btn-secondary" href="../knft/weekly_invoice_report.php?download=1">Download Weekly Invoice Report</a>
            
            <h2 class="mt-4">User Lock message</h2>
            <p class="mt-4  p-4 shadow rounded b-2 text-md-start text-center fw-bold">Current Lock message: <span id="lock-message"><?php echo $_SESSION['cust_msg'] ?> </span> </p>
        </div>

        
    </div>

    <!-- page 1 uom-->
    <div class="page" id="one">
        <div class=" h-auto p-2 d-flex justify-content-between row darkGreen d-fixed">
            <div class="col-1 d-flex justify-content-center ">
                <button class="btn d-block p-0 " type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                    <img src="../public/Assets/three-bars.svg">
                </button>
            </div>
            <div class="col-2 d-none d-lg-flex justify-content-center">
                <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="logo">
            </div>
            <div class="col-6 color-paleGreen" >
                <h1>WELCOME </h1>
                <h2>ADMIN</h2>
            </div>
            <div class="col-3 d-flex justify-content-end">
                <div class="m-0 d-block color-paleGreen justify-content-end">
                    <div class="clock">date</div>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center m-3 mt-4">
            <h2 class="m-0">UOM Master</h2>
            <a class="btn btn-dark" href="#">Back</a>
        </div>
        <div class="d-flex justify-content-center">
            <div class="col-md-8 col-lg-6">
                <form class="form-control White p-3 mb-3" id="uomForm">
                    <label for="UoM" class="form-label">UoM Name</label>
                    <input type="text" class="form-control" name="UoM" id="UoM" required>
                    
                    <label for="UoMID" class="form-label">UoM ID</label>
                    <input type="text" class="form-control" name="UoMID" id="UoMID" required>

                    <button type="submit" class="btn btn-success mt-2 submit-uom">Submit</button>
                </form>
            </div>
        </div>
        <div id="result-uom" class="m-3 alert" style="display: none;"></div>
        <div class="uomHolder m-3 p-2 White w-auto h-auto">
            <h5 class="text-center mb-3">Existing UoMs</h5>
            <div class="table-responsive">
                <table class="table table-success table-hover">
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

    <!-- page 2 category page-->
    <div class="page" id="two">
        <div class=" h-auto p-2 d-flex justify-content-between row darkGreen d-fixed">
            <div class="col-1 d-flex justify-content-center ">
                <button class="btn d-block p-0 " type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                    <img src="../public/Assets/three-bars.svg">
                </button>
            </div>
            <div class="col-2 d-none d-lg-flex justify-content-center">
                <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="logo">
            </div>
            <div class="col-6 color-paleGreen" >
                <h1>WELCOME </h1>
                <h2>ADMIN</h2>
            </div>
            <div class="col-3 d-flex justify-content-end">
                <div class="m-0 d-block color-paleGreen justify-content-end">
                    <div class="clock">date</div>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center m-3 mt-4">
            <h2 class="m-0">Category Master</h2>
            <a class="btn btn-dark" href="#">Back</a>
        </div>
        <div class="d-flex justify-content-center">
            <div class="col-md-8 col-lg-6">
                <form class="form-control White p-3 mb-3" id="categoryForm">
                    <label for="categoryDesc" class="form-label">Category Name</label>
                    <input type="text" class="form-control" name="categoryDesc" id="categoryDesc" required>
                    
                    <label for="categoryType" class="form-label">category ID</label>
                    <input type="text" class="form-control" name="categoryType" id="categoryType" required>
        
                    <button type="submit" class="btn btn-success mt-2 submit-category">Submit</button>
                </form>
            </div>
        </div>
        <div id="result-category" class="m-3 alert" style="display: none;"></div>
        <div class="categoryHolder m-3 p-2 White w-auto h-auto">
            <h5 class="text-center mb-3">Existing Categories</h5>
            <div class="table-responsive">
                <table class="table table-success table-hover">
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

    <!-- page 3 product-->
    <div class="page" id="three">
        <div class=" h-auto p-2 d-flex justify-content-between row darkGreen d-fixed">
            <div class="col-1 d-flex justify-content-center ">
                <button class="btn d-block p-0 " type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                    <img src="../public/Assets/three-bars.svg">
                </button>
            </div>
            <div class="col-2 d-none d-lg-flex justify-content-center">
                <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="logo">
            </div>
            <div class="col-6 color-paleGreen" >
                <h1>WELCOME </h1>
                <h2>ADMIN</h2>
            </div>
            <div class="col-3 d-flex justify-content-end">
                <div class="m-0 d-block color-paleGreen justify-content-end">
                    <div class="clock">date</div>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center m-3 mt-4">
            <h2 class="m-0">Product Master</h2>
            <a class="btn btn-dark" href="#">Back</a>
        </div>
        <section class="d-flex justify-content-center">
            <div class="col-md-8 col-lg-7">
                <div class="p-3 mb-3 border rounded bg-light">
                    <h5 class="text-center mb-3">Add New Product</h5>
                        <label for="itmProduct" class="form-label">Product Name:</label>
                        <input type="text" class="form-control" name="itmProduct" id="itmProduct">

                        <label for="itmCategory" class="form-label">Category:</label>
                        <select class="form-select itmCategory" name="itmCategory" id="itmCategory">
                            <option value="">Select...</option>
                        </select>

                        <label for="itmUoM" class="form-label">UoM:</label>
                        <select class="form-select itmUoM" name="itmUoM" id="itmUoM">
                            <option value="">Select...</option>
                        </select>

                        <label for="itmRate" class="form-label">Base Rate/UoM:</label>
                        <input type="number" step="0.01" class="form-control itmRate" name="itmRate" id="itmRate">

                        <label for="itmMinQuantity" class="form-label">Minimum Order Quantity:</label>
                        <input type="number" step="0.01" class="form-control itmMinQuantity" name="itmMinQuantity" id="itmMinQuantity">
                        
                        <label for="itmStep" class="form-label">Step:</label>
                        <input type="number" step="0.01" class="form-control itmStep" name="itmStep" id="itmStep">

                    <div class="text-center mt-3">
                        <button type="button" class="ADDPRODUCT btn btn-success">Add Product</button>
                    </div>
                </div>
            </div>
        </section>
        <div id="result-product" class="m-3 alert" style="display: none;"></div>
        <div class="productHolder m-3 p-2 White w-auto h-auto">
            <h5 class="text-center mb-3">Existing Products</h5>
            <div class="table-responsive">
                <table class="table table-success table-hover">
                    <thead>
                      <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Category ID</th>
                        <th scope="col">Product</th>
                        <th scope="col">UoM ID</th>
                        <th scope="col">Rate/UoM</th>
                        <th scope="col" style="width: 200px;">Action</th>
                      </tr>
                    </thead>
                    <tbody class="product-body"></tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- page 4 route-->
    <div class="page" id="four">
        <div class=" h-auto p-2 d-flex justify-content-between row darkGreen d-fixed">
            <div class="col-1 d-flex justify-content-center ">
                <button class="btn d-block p-0 " type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                    <img src="../public/Assets/three-bars.svg">
                </button>
            </div>
            <div class="col-2 d-none d-lg-flex justify-content-center">
                <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="logo">
            </div>
            <div class="col-6 color-paleGreen" >
                <h1>WELCOME </h1>
                <h2>ADMIN</h2>
            </div>
            <div class="col-3 d-flex justify-content-end">
                <div class="m-0 d-block color-paleGreen justify-content-end">
                    <div class="clock">date</div>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center m-3 mt-4">
            <h2 class="m-0">Route Master</h2>
            <a class="btn btn-dark" href="#">Back</a>
        </div>
        <div class="d-flex justify-content-center">
            <div class="col-md-8 col-lg-6">
                <form class="form-control White p-3 mb-3" id="routeForm">
                    <div class="form-group">
                        <label for="route" class="form-label">Route</label>
                        <input type="text" class="form-control" name="route" id="route" required>
                    </div>
        
                    <div class="form-group">
                        <label for="deliveryType">Delivery Type :</label><br>
                    
                        <input type="radio" id="pd" name="deliveryType" value="PD" required>
                        <label for="pd">Personal Delivery</label><br>
        
                        <input type="radio" id="vd" name="deliveryType" value="VD" required>
                        <label for="vd">Van Delivery</label>
                    </div>

                    <div class="form-group">
                        <label for="rate" class="form-label">Delivery Charge</label>
                        <input type="number" min="0" step="0.01" class="form-control" name="rate" id="rate" required>
                    </div>
                    <!--<input type="submit" class="btn-success m-3 submit-route btn" value="submit-route">-->
                    <button type="submit" class="btn btn-success mt-2 submit-route">Submit</button>
                </form>
            </div>
        </div>
        <div id="result-route" class="m-3 alert" style="display: none;"></div>
        <div class="routeHolder m-3 p-2 White w-auto h-auto">
            <h5 class="text-center mb-3">Existing Routes</h5>
            <div class="table-responsive">
                <table class="table table-success table-hover">
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

    <!-- page 5 customer form-->
    <div class="page" id="five">
        <div class=" h-auto p-2 d-flex justify-content-between row darkGreen d-fixed">
            <div class="col-1 d-flex justify-content-center ">
                <button class="btn d-block p-0 " type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                    <img src="../public/Assets/three-bars.svg">
                </button>
            </div>
            <div class="col-2 d-none d-lg-flex justify-content-center">
                <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="logo">
            </div>
            <div class="col-6 color-paleGreen" >
                <h1>WELCOME </h1>
                <h2>ADMIN</h2>
            </div>
            <div class="col-3 d-flex justify-content-end">
                <div class="m-0 d-block color-paleGreen justify-content-end">
                    <div class="clock">date</div>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center m-3 mt-4">
            <h2 class="m-0">Customer Registration</h2>
            <a class="btn btn-dark" href="#">Back</a>
        </div>
        <div class="d-flex justify-content-center">
            <div class="col-md-8 col-lg-6">
                <form class="form-control White p-3 mb-3" id="customerForm">
                    <label for="customerName" class="form-label">Customer Name</label>
                    <input type="text" class="form-control" name="customerName" id="customerName" required>
                    
                    <label scope="row" for="routeID" class="form-label">Assign Route</label>
                    <select class="form-select routeID" name="routeID" id="routeID" required>
                        <option value="">Select Route...</option>
                        <!-- <option value="route1">Route 1</option>
                        <option value="route2">Route 2</option>-->
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
        <div id="result-customer" class="m-3 alert" style="display: none;"></div>
        <div class="customerHolder m-3 p-2 White w-auto h-auto">
            <h5 class="text-center mb-3">Existing Customers</h5>
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

    <!-- page 6 supplier form-->
    <div class="page" id="six">
        <div class=" h-auto p-2 d-flex justify-content-between row darkGreen d-fixed">
            <div class="col-1 d-flex justify-content-center ">
                <button class="btn d-block p-0 " type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                    <img src="../public/Assets/three-bars.svg">
                </button>
            </div>
            <div class="col-2 d-none d-lg-flex justify-content-center">
                <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="logo">
            </div>
            <div class="col-6 color-paleGreen" >
                <h1>WELCOME </h1>
                <h2>ADMIN</h2>
            </div>
            <div class="col-3 d-flex justify-content-end">
                <div class="m-0 d-block color-paleGreen justify-content-end">
                    <div class="clock">date</div>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center m-3 mt-4">
            <h2 class="m-0">Supplier Registration</h2>
            <a class="btn btn-dark" href="#">Back</a>
        </div>
        <div class="d-flex justify-content-center">
            <div class="col-md-8 col-lg-6">
                <form class="form-control White p-3 mb-3" id="supplierForm">
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
        <div id="result-supplier" class="m-3 alert" style="display: none;"></div>
        <div class="supplierHolder m-3 p-2 White w-auto h-auto">
            <h5 class="text-center mb-3">Existing Suppliers</h5>
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

    <!-- PAGE 7 WEEK MASTER -->
    <div class="page" id="seven">
        <div class=" h-auto p-2 d-flex justify-content-between row darkGreen d-fixed">
            <div class="col-1 d-flex justify-content-center ">
                <button class="btn d-block p-0 " type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                    <img src="../public/Assets/three-bars.svg">
                </button>
            </div>
            <div class="col-2 d-none d-lg-flex justify-content-center">
                <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="logo">
            </div>
            <div class="col-6 color-paleGreen" >
                <h1>WELCOME </h1>
                <h2>ADMIN</h2>
            </div>
            <div class="col-3 d-flex justify-content-end">
                <div class="m-0 d-block color-paleGreen justify-content-end">
                    <div class="clock">date</div>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center m-3 mt-4">
            <h2 class="m-0">Week Master</h2>
            <a class="btn btn-dark" href="#">Back</a>
        </div>
        <div class="d-flex justify-content-center">
            <div class="col-md-8 col-lg-6">
                <form class="form-control White p-3 mb-3" id="weekForm" >
                    <label for="weekDate" class="form-label">ENTER WEEK DATE IN DDMMYY format</label>
                    <input type="date" class="form-control" name="weekDate" id="weekDate" required>
                    <input type="hidden" id="formattedWeekDate" name="formattedWeekDate">
                    <input type="submit" class="btn btn-success mt-2 submit-week" value="Submit">
                </form>
            </div>
        </div>
        <div id="result-week" class="m-3 alert" style="display: none;"></div>
        <div class="weekHolder m-3 p-2 White w-auto h-auto">
            <h5 class="text-center mb-3">Existing Weeks</h5>
            <div class="table-responsive">
                <table class="table table-success table-hover">
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

    <!-- PAGE 8 Order fullfill -->
    <div class="page" id="eight">
        <div class=" h-auto p-2 d-flex justify-content-between row darkGreen d-fixed">
            <div class="col-1 d-flex justify-content-center ">
                <button class="btn d-block p-0 " type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                    <img src="../public/Assets/three-bars.svg">
                </button>
            </div>
            <div class="col-2 d-none d-lg-flex justify-content-center">
                <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="logo">
            </div>
            <div class="col-6 color-paleGreen" >
                <h1>WELCOME </h1>
                <h2>ADMIN</h2>
            </div>
            <div class="col-3 d-flex justify-content-end">
                <div class="m-0 d-block color-paleGreen justify-content-end">
                    <div class="clock">date</div>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center m-3 mt-4">
            <h2 class="m-0">Order fulfillment Master</h2>
            <a class="btn btn-dark" href="#">Back</a>
        </div>
        <div class="d-flex justify-content-center week-selection">
                <div class="col-6">
                    <form class="form-enhanced form-control White p-4" id="fullfillweekForm">
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
        <div id="result-week" class="m-3 alert" style="display: none;"></div>
        <div class="fulFillHolder m-3 p-2 White w-auto h-auto">
            <h5 class="text-center mb-3">Existing Weeks</h5>
            <div class="table-responsive">
                <table class="table table-success table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Date</th>
                            <th scope="col">Customer</th>
                            <th scope="col">Product</th>
                            <th scope="col">Ordered Quantity and Rate</th>
                            <th scope="col">Fulfill Quantity</th>
                            <th scope="col" style="width: 200px;">Action</th>
                        </tr>
                    </thead>
                    <tbody class="fulfill-body"></tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- PAGE 9 farmer rank -->
    <div class="page" id="nine">
        <div class=" h-auto p-2 d-flex justify-content-between row darkGreen d-fixed">
            <div class="col-1 d-flex justify-content-center ">
                <button class="btn d-block p-0 " type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                    <img src="../public/Assets/three-bars.svg">
                </button>
            </div>
            <div class="col-2 d-none d-lg-flex justify-content-center">
                <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="logo">
            </div>
            <div class="col-6 color-paleGreen" >
                <h1>WELCOME </h1>
                <h2>ADMIN</h2>
            </div>
            <div class="col-3 d-flex justify-content-end">
                <div class="m-0 d-block color-paleGreen justify-content-end">
                    <div class="clock">date</div>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center m-3 mt-4">
            <h2 class="m-0">Rank Master</h2>
            <a class="btn btn-dark" href="#">Back</a>
        </div>
        
        <div class="farmerRankHolder m-3 p-2 White w-auto h-auto">
            <h5 class="text-center mb-3">Farmer Ranks</h5>
            <div class="table-responsive">
                <table class="table table-success table-hover">
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

    <!-- PAGE TEN: FARMER ORDER ALLOCATION & NOTIFICATION -->
    <div class="page" id="ten">
        <!-- Standard Page Top Bar (Copied from other pages) -->
        <div class="h-auto p-2 d-flex justify-content-between row darkGreen d-fixed">
            <div class="col-1 d-flex justify-content-center">
                <button class="btn d-block p-0" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                    <img src="../public/Assets/three-bars.svg" alt="Menu">
                </button>
            </div>
            <div class="col-2 d-none d-lg-flex justify-content-center">
                <img src="../public/Assets/pic.jpeg" class="profile rounded-circle border p-0 border-dark" alt="logo">
            </div>
            <div class="col-6 color-paleGreen">
                <h1>ADMIN PANEL</h1>
                <h2>Farmer Allocation</h2>
            </div>
            <div class="col-3 d-flex justify-content-end">
                <div class="m-0 d-block color-paleGreen justify-content-end">
                    <div class="clock">date</div> <!-- Ensure your clock.js targets this -->
                </div>
            </div>
        </div>
        <!-- End Standard Page Top Bar -->

        <div class="d-flex justify-content-between align-items-center m-3 mt-4">
            <h2 class="m-0">Allocate Customer Orders to Farmers</h2>
            <a class="btn btn-dark" href="#">Back to Admin Home</a> <!-- Or simply href="#" -->
        </div>

        <div class="container mt-4">
            <div class="row justify-content-center">
                <div class="col-md-8 col-lg-7">
                    <div class="card shadow-sm White p-3">
                        <div class="card-body">
                            <h4 class="card-title text-center mb-4">Finalize Week & Assign Orders</h4>
                            <p class="text-muted text-center mb-3">
                                This process will assign customer orders for the selected week to farmers based on their rank and available inventory.
                                It will also enable the fulfillment checklist visibility for farmers.
                            </p>
                            <form id="allocationForm">
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
                            <div id="allocationResult" class="mt-4 alert" style="display:none;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="page" id="eleven">
        <div class=" h-auto p-2 d-flex justify-content-between row darkGreen d-fixed">
            <div class="col-1 d-flex justify-content-center ">
                <button class="btn d-block p-0 " type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                    <img src="../public/Assets/three-bars.svg">
                </button>
            </div>
            <div class="col-2 d-none d-lg-flex justify-content-center">
                <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="logo">
            </div>
            <div class="col-6 color-paleGreen" >
                <h1>WELCOME </h1>
                <h2>ADMIN</h2>
            </div>
            <div class="col-3 d-flex justify-content-end">
                <div class="m-0 d-block color-paleGreen justify-content-end">
                    <div class="clock">date</div>
                </div>
            </div>
        </div>
        <div class="d-flex justify-content-between align-items-center m-3 mt-4">
            <h2 class="m-0">Tray tray_management</h2>
            <a class="btn btn-dark" href="#">Back</a>
        </div>
        
        <div class="trayStatusHolder m-3 p-2 White w-auto h-auto">
            <h5 class="text-center mb-3">Tray Status</h5>
            <div class="table-responsive">
                <table class="table table-success table-hover">
                    <thead>
                        <tr>
                            <th scope="col">Customer</th>
                            <th scope="col">Route</th>
                            <th scope="col">Tray Status</th>
                            <th scope="col">Week ID</th>
                            <th scope="col" style="width: 200px;">Toggle</th>
                        </tr>
                    </thead>
                    <tbody class="tray-status-body"></tbody>
                </table>
            </div>
        </div>
    </div>
    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <!-- <script src="../public/js/jquery.js" ></script> -->
    <script src="../public/js/bootstrap.min.js"></script>
    <script src="../public/js/clock.js"></script>
    <script src="../public/js/admin.js"></script>
</body>
</html>
