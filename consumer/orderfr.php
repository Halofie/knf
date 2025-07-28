<?php 
session_start();
if ($_SESSION['role'] !== 'C') {
    header("Location: ../login/login.html");
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <!-- Google Font -->
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,300,400,700" rel="stylesheet">

    <!-- Bootstrap CSS -->
    <link href="../public/css/bootstrap.min.css" rel="stylesheet">

    <!-- Custom CSS -->
    <link rel="stylesheet" href="../public/css/order.css">
    <link rel="stylesheet" href="../public/css/common.css">
    <link rel="icon" href="../public/Assets/pic.jpeg">

    <title>KOVIA NATURAL FARMERS Customers</title>
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
        <a class="btn" href="../knft/logout.php">HOME</a>
        <a class="btn" href="customer_dashboard.php">DASHBOARD</a>
        <a class="btn" href="orderfr.php" >ORDER PRODUCTS</a> 
        <a class="btn" href="#two">ORDER SUMMARY & INVOICE</a>
        <a class="btn" href="../knft/logout.php">LOGOUT</a>
      </div>
  </div>
</div>

  <!-- the top bar-->
  <div class="container-fluid">
    <div class="row align-items-center p-2 darkGreen">
      <div class="col-auto d-flex align-items-center ">
          <button class="btn p-1 " type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
              <img src="../public/Assets/three-bars.svg" alt="Menu" style="width: 24px;">
          </button>
      </div>
      <div class="col-2 d-none d-lg-flex justify-content-center">
          <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="logo">
      </div>
      <div class="col-6 color-paleGreen" >
          <h1 id="name">.</h1>
          <p class="navinfo m-0" id="phone">.</p>
          <p class="navinfo m-0" id="address">.</p>
          <p class="navinfo m-0" id="week">.</p>
          <p class="navinfo m-0" id="route">.</p>
      </div>
      <div class="col-3 d-flex justify-content-end">
        <div class="m-0 d-block color-paleGreen justify-content-end">
            <div class="clock" id="date">date</div>
        </div>
      </div>
    </div>
  </div>

<section class="container <?php if (empty($_SESSION['userLock'])) echo 'd-none'; ?>">
  <div class="alert alert-danger m-5" role="alert">
    <h4 class="alert-heading">ADMIN HAS LOCKED PURCHASE!</h4>
    <p><?php echo $_SESSION['cust_msg'] ?></p>
    <hr>
    <p class="mb-0">If you have any questions, please reach out to support.</p>
  </div>
</section>
<section class="container <?php if (!empty($_SESSION['userLock'])) echo 'd-none'; ?>">
  <div class="products m-5">
    <table class="table table-success border border-success">
      <thead>
        <tr>
          <th scope="col">Product Name</th>
          <th scope="col">Rate and available Quantity</th>
          <th scope="col">Enter Quantity</th>
          <th scope="col">Add to Cart</th>
        </tr>
      </thead>
      <tbody>
        <!-- <tr>
          <th scope="row">1</th>
          <td>Mark</td>
          <td>Otto</td>
          <td>@mdo</td>
        </tr>
        <tr>
          <th scope="row">2</th>
          <td>Jacob</td>
          <td>Thornton</td>
          <td>@fat</td>
        </tr>
        <tr>
          <th scope="row">3</th>
          <td colspan="2">Larry the Bird</td>
          <td>@twitter</td>
        </tr> -->
      </tbody>
    </table>
  </div>

    <div id="myAnchor" class="text-center m-3"></div>
    <div id="order-result" class="m-3 alert" style="display: none;"></div>
    <h1 class="text-center">Cart</h1>
    <div id="cart-result" class="m-3"></div>
    <div class="cartHolder m-3 p-2 White w-auto h-auto d-flex align-center justify-content-center">
        <div class="d-flex justify-content-center container align-center">
            <table class="table table-success border">
                <thead>
                    <tr>
                        <th scope="col">Product Name</th>
                        <th scope="col">Category</th>
                        <th scope="col">Price</th>
                        <th scope="col">Quantity</th>
                        <th scope="col">Action</th>
                    </tr>
                </thead>
                <tbody class="cart-body"></tbody>
            </table>
        </div>
    </div>

    <div class="container my-5">
      <div class="row">
        <!-- Route Selection Card -->
        <div class="col-lg-6 mb-4">
          <div class="card shadow-sm border-0" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);">
            <div class="card-header bg-success text-white">
              <h5 class="mb-0">
                <i class="fas fa-route me-2"></i>Delivery Information
              </h5>
            </div>
            <div class="card-body p-4">
              <label for="deliveryRoute" class="form-label fw-bold text-success mb-3">
                <i class="fas fa-map-marker-alt me-2"></i>Select Your Delivery Route:
              </label>
              <select class="form-select form-select-lg shadow-sm" id="deliveryRoute" style="border: 2px solid #28a745; border-radius: 12px;">
                <option selected disabled>Choose your delivery route...</option>
                <!-- Routes will be populated dynamically -->
              </select>
              <small class="text-muted mt-2 d-block">
                <i class="fas fa-info-circle me-1"></i>Select the most convenient delivery route for you
              </small>
            </div>
          </div>
        </div>

         <!-- Order Summary Card -->
        <div class="col-lg-6 mb-4">
          <div class="card shadow-sm border-0" style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);">
            <div class="card-header text-white" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
              <h5 class="mb-0">
                <i class="fas fa-receipt me-2"></i>Order Summary
              </h5>
            </div>
            <div class="card-body p-4 text-center">
              <div class="mb-3">
                <i class="fas fa-shopping-cart fa-2x text-success mb-2"></i>
                <p class="mb-1 text-muted">Total Amount</p>
              </div>
              <div class="total-display p-3 rounded-3 shadow-sm mb-3" style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border: 3px solid #28a745;">
                <span class="fw-bold display-4 text-success" id="totalCost">₹0.00</span>
              </div>
              <div class="d-flex justify-content-between text-sm">
                <small class="text-muted">
                  <i class="fas fa-box me-1"></i>Items in cart: <span id="itemCount" class="fw-bold text-success">0</span>
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Order Placement Section -->
    <div class="container mb-5">
      <div class="row justify-content-center">
        <div class="col-lg-6">
          <div class="text-center">
            <div class="container my-5">
  <div class="card shadow-sm border-0">
    <div class="card-header bg-success text-white">
      <h5 class="mb-0"><i class="fas fa-sticky-note me-2"></i>Leave a Note for This Week</h5>
    </div>
    <div class="card-body p-4">
      <form id="noteForm">
        <div class="mb-3">
          <label for="noteText" class="form-label fw-bold">Your Note</label>
          <textarea class="form-control" id="noteText" rows="3" required placeholder="Enter your note here..."></textarea>
        </div>
        <button type="submit" class="btn btn-success">Submit Note</button>
        <div id="noteResult" class="mt-3" style="display:none;"></div>
      </form>
    </div>
  </div>
</div>
            <button class="btn btn-lg px-5 py-3 shadow-lg" id="placeOrderButton" 
                    style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                           border: none; 
                           border-radius: 50px; 
                           color: white;
                           font-weight: bold;
                           font-size: 1.1rem;
                           transition: all 0.3s ease;
                           position: relative;
                           overflow: hidden;">
              <i class="fas fa-paper-plane me-2"></i>
              Place Your Order
              <span class="btn-shine"></span>
            </button>

            <div class="mt-3">
              <small class="text-muted">
                <i class="fas fa-shield-alt me-1"></i>
                Your order is secure and will be processed immediately
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
</section>

<div class="page" id="two">
  <div class=" h-auto p-2 d-flex justify-content-between row darkGreen">
    <div class="col-1 d-flex justify-content-center ">
        <button class="btn d-block p-0 " type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
            <img src="../public/Assets/three-bars.svg">
        </button>
    </div>
    <div class="col-2 d-none d-lg-flex justify-content-center">
        <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="logo">
    </div>
    <div class="col-6 color-paleGreen" >
        <h1 id="history_name">.</h1>
        <p class="navinfo m-0" id="history_phone">.</p>
        <p class="navinfo m-0" id="history_address">.</p>
        <p class="navinfo m-0" id="history_week">.</p>
        <p class="navinfo m-0" id="history_route">.</p>
    </div>
    <div class="col-3 d-flex justify-content-end">
      <div class="m-0 d-block color-paleGreen justify-content-end">
          <div class="clock">date</div>
      </div>
    </div>
  </div>
  <!-- Enhanced Purchase History Section -->
  <div class="container my-5" id="purchaseHistorySection"> <!-- Added ID for easy navigation -->
    <h2 class="text-center mb-4 display-5 fw-bold text-success">
        <i class="fas fa-history me-2"></i>Purchase History
    </h2>

    <!-- Week Filter for Order History -->
    <div class="row justify-content-center mb-4">
      <div class="col-lg-7 col-md-9">
        <div class="card shadow-sm border-0" style="background: linear-gradient(135deg, #e9f7ef 0%, #d4edda 100%);">
          <div class="card-body p-4">
            <form id="orderHistoryWeekForm" class="row g-3 align-items-end">
              <div class="col-md">
                  <label for="orderHistoryWeekDropdown" class="form-label fw-bold text-success mb-1">
                      <i class="fas fa-calendar-alt me-2"></i>Filter by Delivery Week:
                  </label>
                  <select class="form-select form-select-lg shadow-sm" id="orderHistoryWeekDropdown" style="border: 2px solid #28a745; border-radius: 12px;">
                      <option value="" selected>Loading delivery weeks...</option>
                      <option value="all">Show All Orders</option>
                      <!-- Weeks will be populated by JS -->
                  </select>
              </div>
              <div class="col-md-auto">
                  <button type="submit" class="btn btn-lg btn-success shadow-sm w-100" style="border-radius: 12px;">
                      <i class="fas fa-filter me-2"></i>Show Orders
                  </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div id="order-history-result" class="m-3 alert" style="display: none;"></div> <!-- For general messages -->

    <div class="purchase-history-container container mt-4">
      <!-- Mobile table header for purchase history (visible only on mobile) -->
      <div class="mobile-table-header d-md-none mb-0">
          <span>Product</span>
          <span class="text-end">Rate/Unit</span>
          <span class="text-center">Qty</span>
          <!-- <span>Route</span> -->
          <span class="text-end">Total</span>
      </div>
      <div class="card shadow-sm">
          <div class="card-header bg-success text-white">
              <h5 class="mb-0"><i class="fas fa-receipt me-2"></i>Purchase Details</h5>
          </div>
          <div class="card-body p-0">
              <div class="table-responsive">
                  <table class="table table-hover table-striped mb-0">
                      <thead class="table-light">
                          <tr>
                              <th scope="col">Product Name</th>
                              <th scope="col">Category</th>
                              <th scope="col" class="text-end">Rate/Unit</th>
                              <th scope="col" class="text-center">Quantity</th>
                              <!-- <th scope="col">Route</th> -->
                              <th scope="col" class="text-end">Total Cost</th>
                          </tr>
                      </thead>
                      <tbody class="purchase-history-body">
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
      <p class="text-center text-muted p-4" id="no-orders-message" style="display: none; font-size: 1.2rem;">
          <i class="fas fa-shopping-bag fa-2x mb-3 d-block"></i>
          You have no past orders to display for the selected period.
      </p>
    </div>
  </div>

  <hr class="my-5">

  <div class="container my-5" id="fulfillmentDisplaySection"> <!-- Added ID for easy navigation -->
    <h2 class="text-center mb-4 display-5 fw-bold text-success">
        <i class="fas fa-clipboard-check me-2"></i>Purchase Invoice 
    </h2>

    <!-- Week Filter for Order History -->
    <div class="row justify-content-center mb-4">
      <div class="col-lg-7 col-md-9">
        <div class="card shadow-sm border-0" style="background: linear-gradient(135deg, #e9f7ef 0%, #d4edda 100%);">
          <div class="card-body p-4">
            <form id="fulfillmentDataWeekForm" class="row g-3 align-items-end">
              <div class="col-md">
                  <label for="fulfillmentDataWeekDropdown" class="form-label fw-bold text-success  mb-1">
                      <i class="fas fa-calendar-alt me-2"></i>Filter Fulfillment by Delivery Week:
                  </label>
                  <select class="form-select form-select-lg shadow-sm" id="fulfillmentDataWeekDropdown" style="border: 2px solid #28a745; border-radius: 12px;">
                      <option value="" selected>Loading delivery weeks...</option>
                      <option value="all">Show All Fulfillments</option>
                      <!-- Weeks will be populated by JS -->
                  </select>
              </div>
              <div class="col-md-auto">
                  <button type="submit" class="btn btn-lg btn-success shadow-sm w-100" style="border-radius: 12px;">
                      <i class="fas fa-search me-2"></i>Show Fulfillments
                  </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <div id="fulfillment-data-message" class="m-3 alert" style="display: none;"></div> <!-- For general messages -->

    <div class="table-responsive">
    <table class="table table-hover table-striped mb-0" id="fulfillmentTable">
        <thead>
            <tr>
                <th>Product Name</th>
                <th>Ordered</th>
                <th>Fullfilled Quantity</th>
                <th>Rate</th>
                <th>Total Cost</th>
                <!-- <th>Route</th> -->
            </tr>
        </thead>
        <tbody class="fulfillment-table-body"></tbody>
    </table>
    <!-- Mobile table header for fulfillment/invoice (visible only on mobile) -->
    <div class="mobile-table-header d-md-none mb-0">
        <span>Product</span>
        <span>Ordered</span>
        <span>Fulfilled</span>
        <span>Rate</span>
        <span>Total</span>
        <!-- <span>Route</span> -->
    </div>
    <!-- Enhanced Total Amount Card for Fulfillment -->
    <div class="row justify-content-center mt-4">
      <div class="col-lg-7">
        <div class="card border-0 shadow-lg" style="background: linear-gradient(135deg, #fffbe6 0%, #ffeaa7 100%);">
          <div class="card-body text-center py-5">
            <div class="mb-3">
              <i class="fas fa-coins fa-3x text-success mb-3"></i>
              <h3 class="mb-2 fw-bold text-success" style="font-size:2.2rem;">Total Amount to be Paid</h3>
            </div>
            <div class="total-display p-4 rounded-3 shadow-sm mb-3" style="background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%); border: 3px solid #28a745;">
              <span class="fw-bold display-3 text-success" id="finalTotalAmount">
                <span class="final-total-figure"></span>
              </span>
            </div>
            <div class="mb-3">
              <span class="fw-bold fs-4 text-primary" id="fulfillmentTotalAmount">
                <span class="total-amount-figure"></span>
                <span class="mx-2 text-dark">+</span>
                <span class="deliveryfeelol"></span>
                <span class="ms-2 text-muted">(Order + Delivery)</span>
              </span> 
            </div>
            <div class="mb-2">
              <span class="fw-bold text-dark">Delivery route:</span>
              <span class="route-figure"></span>
              &nbsp;|&nbsp;
              <span class="fw-bold text-dark">Delivery Fee:</span>
              <span class="route-cost-figure"></span>
            </div>
            <small class="text-muted d-block">
              <i class="fas fa-info-circle me-1"></i>
              <span>*ordered quantity is the quantity you placed, fulfilled quantity is what you will receive</span>
            </small>
          </div>
        </div>
      </div>
    </div>
    <p class="text-center text-muted p-5" id="no-fulfillment-data-message" style="display: none; font-size: 1.2rem;">
        <i class="fas fa-box-open fa-2x mb-3 d-block"></i>
        No fulfillment records to display for the selected period.
    </p>
</div>
    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="../public/js/jquery.js"></script>
    <script src="../public/js/bootstrap.min.js" ></script>
    <script src="../public/js/order.js"></script>
    <script src="../public/js/clock.js"></script>  
</body>
</html>