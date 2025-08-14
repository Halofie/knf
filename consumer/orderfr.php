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

    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,300,400,700" rel="stylesheet">
    <!-- <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css"> -->

    <!-- CSS -->
    <link href="../public/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="../public/css/order.css">
    <!-- <link rel="stylesheet" href="../public/css/common.css"> -->
    <link rel="stylesheet" href="../public/css/mobile-responsive.css">
    <link rel="icon" href="../public/Assets/pic.jpeg">

    <title>KNF Customer Orders</title>
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
                <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt="KNF logo">
                <h6 class="mt-2 text-success" id="customer-name-sidebar">Customer Portal</h6>
            </div>
            <nav>
                <a href="customer_dashboard.php">
                    <i class="fas fa-home me-2"></i>Dashboard
                </a>
                <a href="#order-page" class="active">
                    <i class="fas fa-shopping-cart me-2"></i>Place Order
                </a>
                <a href="#order-history">
                    <i class="fas fa-history me-2"></i>Order History
                </a>
                <a href="#invoice">
                    <i class="fas fa-receipt me-2"></i>Invoice
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

      <!-- the top bar-->
    <div class="container-fluid top-navbar p-0">
      <div class="row align-items-center darkGreen">
        <div class="col-auto">
            <button class="btn btn-link text-white p-1" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                <img src="../public/Assets/three-bars.svg">
            </button>
        </div>
        <div class="col-auto d-none d-lg-block">
            <img src="../public/Assets/pic.jpeg" class=" profile rounded-circle border p-0 border-dark" alt=" KNF logo">
        </div>
        <div class="col color-paleGreen" >
            <h1 id="name" class="mb-0">Loading...</h1>
              <p class="navinfo m-0" id="phone">Phone: Loading...</p>
              <p class="navinfo m-0" id="address">Address: Loading...</p>
              <p class="navinfo m-0" id="week">Week: Loading...</p>
              <p class="navinfo m-0" id="route">Route: Loading...</p>
        </div>
        <div class="col-auto">
            <div class="clock text-end">
                <div class="fas fa-clock me-1">
                    <div class="clock">date</div>
                </div>
            </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <main class="container-fluid" style="margin-top: 2rem;">
      <!-- Order Page Section -->
      <section id="order-page" class="content-section">
          <h2 class="section-title">Place Your Order</h2>
          <!-- Admin Lock Message -->
          <div class="container <?php if (empty($_SESSION['userLock'])) echo 'd-none'; ?>">
              <div class="alert alert-danger animate-slide-up" role="alert">
                  <h4 class="alert-heading">
                      <i class="fas fa-lock me-2"></i>ADMIN HAS LOCKED PURCHASE!
                  </h4>
                  <p><?php echo $_SESSION['cust_msg'] ?></p>
                  <hr>
                  <p class="mb-0">If you have any questions, please reach out to support.</p>
              </div>
          </div>

          <!-- Order Content -->
          <div class="container <?php if (!empty($_SESSION['userLock'])) echo 'd-none'; ?>">
              <!-- Products Table -->
              <div class="card mb-4 animate-slide-up">
                  <div class="card-header">
                      <i class="fas fa-seedling me-2"></i>Available Products
                  </div>
                  <div class="card-body p-0">
                      <div class="table-responsive">
                          <table class="table table-hover mb-0" id="productsTable">
                              <thead>
                                  <tr>
                                      <th scope="col"><i class="fas fa-box me-1"></i>Product Name</th>
                                      <th scope="col"><i class="fas fa-info-circle me-1"></i>Rate & Available Quantity</th>
                                      <th scope="col"><i class="fas fa-calculator me-1"></i>Enter Quantity</th>
                                      <th scope="col"><i class="fas fa-cart-plus me-1"></i>Add to Cart</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  <!-- Products will be loaded here -->
                              </tbody>
                          </table>
                      </div>
                  </div>
              </div>

              <!-- Order Result Messages -->
              <div id="myAnchor" class="text-center"></div>
              <div id="order-result" class="alert" style="display: none;"></div>

              <!-- Cart Section -->
              <div class="card mb-4 animate-slide-up">
                  <div class="card-body">
                      <div id="cart-result" class="mb-3"></div>
                      <div class="table-responsive">
                          <table class="table table-hover mb-0">
                              <thead>
                                  <tr>
                                      <th scope="col">Product Name</th>
                                      <th scope="col">Category</th>
                                      <th scope="col">Price</th>
                                      <th scope="col">Quantity</th>
                                      <th scope="col">Total</th>
                                      <th scope="col">Action</th>
                                  </tr>
                              </thead>
                              <tbody class="cart-body" id="cartTableBody">
                                  <!-- Cart items will be added here -->
                              </tbody>
                          </table>
                      </div>
                      
                      <!-- Empty Cart State -->
                      <div class="text-center py-5" id="empty-cart-message">
                          <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                          <h5 class="text-muted">Your cart is empty</h5>
                          <p class="text-muted">Add some products to get started!</p>
                      </div>
                  </div>
              </div>

              <!-- Order Summary and Checkout -->
              <div class="row">
                  <!-- Delivery Route Selection -->
                  <div class="col-lg-6 mb-4">
                      <div class="card animate-slide-up">
                          <div class="card-header">
                              <i class="fas fa-route me-2"></i>Delivery Information
                          </div>
                          <div class="card-body">
                              <label for="deliveryRoute" class="form-label">
                                  <i class="fas fa-map-marker-alt me-2"></i>Select Your Delivery Route:
                              </label>
                              <select class="form-select" id="deliveryRoute">
                                  <option selected disabled>Choose your delivery route...</option>
                                  <!-- Routes will be populated dynamically -->
                              </select>
                              <small class="text-muted mt-2 d-block">
                                  <i class="fas fa-info-circle me-1"></i>Select the most convenient delivery route for you
                              </small>
                          </div>
                      </div>
                  </div>

                  <!-- Order Summary -->
                  <div class="col-lg-6 mb-4">
                      <div class="card animate-slide-up">
                          <div class="card-header">
                              <i class="fas fa-receipt me-2"></i>Order Summary
                          </div>
                          <div class="card-body text-center">
                              <div class="mb-3">
                                  <i class="fas fa-shopping-cart fa-2x text-success mb-2"></i>
                                  <p class="mb-1 text-muted">Total Amount</p>
                              </div>
                              <div class="total-display p-3 rounded shadow-sm mb-3" style="background: #f8f9fa; border: 3px solid #28a745;">
                                  <span class="fw-bold display-4 text-success" id="totalCost">₹0.00</span>
                              </div>
                              <div class="d-flex justify-content-between">
                                  <small class="text-muted">
                                      <i class="fas fa-box me-1"></i>Items: <span id="itemCount" class="fw-bold text-success">0</span>
                                  </small>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              <!-- Customer Note -->
              <div class="card mb-4 animate-slide-up">
                  <div class="card-header">
                      <i class="fas fa-sticky-note me-2"></i>Leave a Note for This Week
                  </div>
                  <div class="card-body">
                      <form id="noteForm">
                          <div class="mb-3">
                              <label for="noteText" class="form-label">Your Note</label>
                              <textarea class="form-control" id="noteText" rows="3" placeholder="Enter your note here..."></textarea>
                          </div>
                          <div id="noteResult" style="display:none;"></div>
                      </form>
                  </div>
              </div>

              <!-- Place Order Button -->
              <div class="text-center mb-5">
                  <button class="btn btn-lg px-5 py-3 shadow-lg" id="placeOrderButton" 
                          style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); 
                                  border: none; 
                                  border-radius: 50px; 
                                  color: white;
                                  font-weight: bold;
                                  font-size: 1.1rem;">
                      <i class="fas fa-paper-plane me-2"></i>
                      Place Your Order
                  </button>
                  <div class="mt-3">
                      <small class="text-muted">
                          <i class="fas fa-shield-alt me-1"></i>
                          Your order is secure and will be processed immediately
                      </small>
                  </div>
              </div>
          </div>
      </section>

      <section id="order-history" class="content-section" style="display: none;">
          <h2 class="section-title">Order History</h2>
          
          <div class="row">
              <!-- Week Selection -->
              <div class="col-lg-4 mb-4">
                  <div class="card animate-slide-up">
                      <div class="card-header">
                          <i class="fas fa-calendar me-2"></i>Select Week
                      </div>
                      <div class="card-body">
                          <form id="orderHistoryWeekForm">
                              <div class="mb-3">
                                  <label for="orderHistoryWeekDropdown" class="form-label">Choose Week</label>
                                  <select class="form-select" id="orderHistoryWeekDropdown" required>
                                      <option value="" disabled>Loading weeks...</option>
                                      <option value="all" selected>Show All Orders</option>
                                  </select>
                              </div>
                              <div class="d-grid">
                                  <button type="submit" class="btn btn-primary">
                                      <i class="fas fa-search me-1"></i>View Orders
                                  </button>
                              </div>
                          </form>
                      </div>
                  </div>
              </div>
              
              <!-- Order History Display -->
              <div class="col-lg-8">
                  <div class="card animate-slide-up">
                      <div class="card-header">
                          <i class="fas fa-history me-2"></i>Your Orders
                          <span class="badge bg-light text-dark ms-2" id="history-order-count">0</span>
                      </div>
                      <div class="card-body p-0">
                          <!-- Purchase History Result Messages -->
                          <div id="order-history-result" class="m-3 alert" style="display: none;"></div>
                          
                          <div class="table-responsive">
                              <table class="table table-hover mb-0">
                                  <thead>
                                      <tr>
                                          <th>Product Name</th>
                                          <th>Category</th>
                                          <th>Rate/Unit</th>
                                          <th>Quantity</th>
                                          <th>Total Cost</th>
                                      </tr>
                                  </thead>
                                  <tbody class="purchase-history-body">
                                      <tr>
                                          <td colspan="5" class="text-center text-muted py-4">
                                              <i class="fas fa-calendar-alt fa-3x mb-3"></i>
                                              <h5>Select a Week</h5>
                                              <p>Choose a week from the left to view your order history.</p>
                                          </td>
                                      </tr>
                                  </tbody>
                              </table>
                          </div>
                          
                          <!-- No Orders Message -->
                          <div id="no-orders-message" class="text-center p-4" style="display: none;">
                              <i class="fas fa-shopping-bag fa-3x mb-3 text-muted"></i>
                              <h5 class="text-muted">No Orders Found</h5>
                              <p class="text-muted">You have no orders for the selected period.</p>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      <!-- PAGE 3: Invoice Section (HIDDEN BY DEFAULT) -->
        <section id="invoice" class="content-section" style="display: none;">
            <h2 class="section-title">Invoice & Payment</h2>
            
            <div class="row justify-content-center">
                <div class="col-lg-10">
                    <!-- Invoice Generation Form -->
                    <div class="card animate-slide-up mb-4">
                        <div class="card-header">
                            <i class="fas fa-receipt me-2"></i>Generate Invoice
                        </div>
                        <div class="card-body">
                            <form id="fulfillmentDataWeekForm">
                                <div class="row">
                                    <div class="col-md-8 mb-3">
                                        <label for="fulfillmentDataWeekDropdown" class="form-label">Select Week</label>
                                        <select class="form-select" id="fulfillmentDataWeekDropdown" required>
                                            <option value="" disabled>Loading weeks...</option>
                                            <option value="all" selected>Show All Fulfillments</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4 d-flex align-items-end mb-3">
                                        <button type="submit" class="btn btn-success w-100">
                                            <i class="fas fa-file-invoice me-1"></i>Generate Invoice
                                        </button>
                                    </div>
                                </div>
                            </form>
                            
                            <!-- Fulfillment Messages -->
                            <div id="fulfillment-data-message" class="alert" style="display: none;"></div>
                        </div>
                    </div>
                    
                    <!-- Invoice Display Area -->
                    <div class="card animate-slide-up">
                        <div class="card-header">
                            <i class="fas fa-file-invoice-dollar me-2"></i>Invoice Details
                        </div>
                        <div class="card-body">
                            <!-- Fulfillment Table -->
                            <div class="table-responsive mb-4">
                                <table class="table table-hover">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Ordered Qty</th>
                                            <th>Fulfilled Qty</th>
                                            <th>Rate</th>
                                            <th>Total Cost</th>
                                        </tr>
                                    </thead>
                                    <tbody class="fulfillment-table-body">
                                        <tr>
                                            <td colspan="5" class="text-center p-4 text-muted">
                                                <i class="fas fa-file-invoice fa-3x mb-3"></i>
                                                <h5>Select a Week</h5>
                                                <p>Choose a week to generate and view your invoice.</p>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <!-- No Fulfillment Message -->
                            <div id="no-fulfillment-data-message" class="text-center p-4" style="display: none;">
                                <i class="fas fa-exclamation-circle fa-3x mb-3 text-warning"></i>
                                <h5 class="text-muted">No Fulfillment Data</h5>
                                <p class="text-muted">No fulfillment data found for the selected period.</p>
                            </div>
                            
                            <!-- Invoice Summary -->
                            <div class="row mt-4">
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <i class="fas fa-calculator me-2"></i>Order Summary
                                        </div>
                                        <div class="card-body">
                                            <div class="row mb-2">
                                                <div class="col">Order Amount:</div>
                                                <div class="col-auto">
                                                    <strong class="total-amount-figure">N/A</strong>
                                                </div>
                                            </div>
                                            <div class="row mb-2">
                                                <div class="col">Delivery Fee:</div>
                                                <div class="col-auto">
                                                    <strong class="deliveryfeelol">N/A</strong>
                                                </div>
                                            </div>
                                            <hr>
                                            <div class="row">
                                                <div class="col"><strong>Final Total:</strong></div>
                                                <div class="col-auto">
                                                    <strong class="final-total-figure text-success">N/A</strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="card">
                                        <div class="card-header">
                                            <i class="fas fa-route me-2"></i>Delivery Information
                                        </div>
                                        <div class="card-body">
                                            <div class="row mb-2">
                                                <div class="col">Route:</div>
                                                <div class="col-auto">
                                                    <strong class="route-figure">N/A</strong>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col">Delivery Cost:</div>
                                                <div class="col-auto">
                                                    <strong class="route-cost-figure">N/A</strong>
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
                <i class="fas fa-leaf me-2 text-success"></i>
                © 2025 Kovai Natural Farmers - Customer Portal. All rights reserved.
            </p>
        </div>
    </footer>
    
    <!-- Scripts -->
    <script src="../public/js/jquery.js"></script>
    <script src="../public/js/bootstrap.min.js" ></script>
    <script src="../public/js/clock.js"></script>
    <script src="../public/js/order.js"></script> 
</body>
</html>