const now = new Date();

let custID = 0;
let weekId = 0;
let cRoute = "";
let cId = 0;
let lock = 0;
let globalCustomerId = 0;

let prodData = [];
let prodlist = [];
let purchasedItems = {};
let prodMap = {};

function debugElements() {
    console.log('=== DEBUG: Checking for required elements ===');
    console.log('Purchase history body:', document.querySelector('.purchase-history-body'));
    console.log('No orders message:', document.getElementById('no-orders-message'));
    console.log('Order history result:', document.getElementById('order-history-result'));
    console.log('Order history dropdown:', document.getElementById('orderHistoryWeekDropdown'));
    console.log('Fulfillment table body:', document.querySelector('.fulfillment-table-body'));
    console.log('=== END DEBUG ===');
}

// =====================================
// SECTION NAVIGATION - NEW ADDITION
// =====================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing...');
    
    // CRITICAL: Hide all sections first before any initialization
    const allSections = document.querySelectorAll('.content-section');
    allSections.forEach(section => {
        section.style.display = 'none';
        console.log('Initially hiding section:', section.id);
    });
    
    initializeSectionNavigation();
    
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
        const sectionId = hash.substring(1);
        console.log('URL hash detected:', sectionId);
        setTimeout(() => {
            showSection(sectionId);
        }, 1000); // Wait for main data to load
    } else {
        // Show order page by default
        console.log('No hash, showing order-page by default');
        showSection('order-page');
    }
    
    // Handle browser back/forward buttons
    window.addEventListener('hashchange', function() {
        const sectionId = window.location.hash.substring(1) || 'order-page';
        console.log('Hash changed to:', sectionId);
        showSection(sectionId);
    });
});

function initializeSectionNavigation() {
    const sidebarLinks = document.querySelectorAll('.sidebar a[href^="#"]');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = this.getAttribute('href').substring(1);
            
            console.log('Sidebar link clicked:', targetSection);
            
            // Update URL hash (this will trigger hashchange event)
            window.location.hash = targetSection;
            
            // Show target section is handled by hashchange event
            // But we'll call it directly too to ensure immediate response
            showSection(targetSection);
            
            // Update active state
            sidebarLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Close offcanvas on mobile
            const offcanvasElement = document.getElementById('offcanvasExample');
            if (offcanvasElement) {
                const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement);
                if (offcanvas) {
                    offcanvas.hide();
                }
            }
        });
    });
    
    // Set initial active state
    const orderPageLink = document.querySelector('.sidebar a[href="#order-page"]');
    if (orderPageLink) {
        orderPageLink.classList.add('active');
    }
}

function showSection(sectionId) {
    console.log('=== showSection called with:', sectionId);
    
    // First, remove active class from all sidebar links
    const sidebarLinks = document.querySelectorAll('.sidebar a[href^="#"]');
    sidebarLinks.forEach(link => link.classList.remove('active'));
    
    // Add active class to current section's link
    const activeLink = document.querySelector(`.sidebar a[href="#${sectionId}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
        console.log('Active link updated for:', sectionId);
    }
    
    // Hide ALL sections first - be explicit
    const sections = document.querySelectorAll('.content-section');
    console.log('Found sections:', sections.length);
    sections.forEach(section => {
        section.style.display = 'none';
        section.classList.remove('active-section');
        console.log('Hidden section:', section.id);
    });
    
    // Show target section with animation
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.classList.add('active-section');
        console.log('Showing section:', sectionId);
        
        // Scroll to top of page when switching sections
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Load section specific data
        loadSectionData(sectionId);
    } else {
        console.error('Section not found:', sectionId);
    }
}

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'order-page':
            console.log('Loading order page...');
            break;
        case 'order-history':
            console.log('Loading order history section...');
            debugElements(); // Add this line
            if (globalCustomerId && globalCustomerId !== 0) {
                loadOrderHistoryWeekDropdown();
                setTimeout(() => {
                    fetchAndDisplayConsumerOrders(globalCustomerId, 'all');
                }, 500);
            } else {
                console.warn('Customer ID not available for order history');
            }
            break;
        case 'invoice':
            console.log('Loading invoice section...');
            debugElements(); // Add this line
            if (globalCustomerId && globalCustomerId !== 0) {
                initializeFulfillmentSection();
            } else {
                console.warn('Customer ID not available for invoice');
            }
            break;
    }
}

async function fetchUserLock() {
    try {
        const response = await fetch('../knft/getUserLock.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch user lock status');
        const data = await response.json();
        // Store the status in the global variable
        lock = typeof data.Status !== "undefined" ? parseInt(data.Status, 10) : 0;
        console.log("User lock status:", lock);
    } catch (error) {
        console.error('Error fetching user lock status:', error);
        lock = 0; // Default to unlocked if error
    }
}
fetchUserLock();

let customerFulfillmentData = [];

async function fetchEmailAndRunProgram() {
    try {
        const response = await fetch('../knft/returnE.php');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const email = data?.email;
        if (!email) {
            console.warn("Email is null or undefined. Redirecting...");
            window.location.href = '../home.html';
            return;
        }
        console.log("User's session email:", email);
        runNextProgram(email);
    } catch (error) {
        console.error('Error fetching session email:', error);
    }
}
fetchEmailAndRunProgram();

async function runNextProgram(email) {
    await main_load(email);
    globalCustomerId = cId;
    await loadMenu();

    // Initialize purchase history if the Order History section is present
    if (document.getElementById('order-history') && document.querySelector('.purchase-history-body')) {
        await initializePurchaseHistory();
    } else {
        console.log("Purchase history section/table body not found on this page, skipping initialization.");
    }

    // Initialize fulfillment/invoice section if invoice area is present
    if (document.getElementById('invoice') && document.querySelector('.fulfillment-table-body')) {
        await initializeFulfillmentSection();
    }
}

async function main_load(email) {
    try {
        const [customerResponse, weekResponse, routes] = await Promise.all([
            fetch('../knft/getCustomer2.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            }),
            fetch('../knft/getLastWeek.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            }),
            fetchRoutes()
        ]);

        const customerData = await customerResponse.json();
        const weekData = await weekResponse.json();
        const details = customerData.details;
        if (details) {
            cId = details.customerID;
            custID = cId;
            cRoute = details.routeID;

            // Populate FIRST header (original)
            const nameEl = document.querySelector("#name");
            const phoneEl = document.querySelector("#phone");
            const addressEl = document.querySelector("#address");
            const routeEl = document.querySelector("#route");
            
            if (nameEl) nameEl.innerText = details.customerName || "N/A";
            if (phoneEl) phoneEl.innerText = `Phone: ${details.contact || "N/A"}`;
            if (addressEl) addressEl.innerText = `Address: ${details.address || "N/A"}`;
            if (routeEl) routeEl.innerText = (details.routeID && details.routeName) ? `Route: ${details.routeID} - ${details.routeName}` : "Route: N/A";

            // Update sidebar name
            const sidebarNameEl = document.getElementById('customer-name-sidebar');
            if (sidebarNameEl) sidebarNameEl.innerText = details.customerName || "Customer Portal";

            // document.querySelector("#name").innerText = details.customerName || "N/A";
            // document.querySelector("#phone").innerText = details.contact || "N/A";
            // document.querySelector("#address").innerText = details.address || "N/A";
            // document.querySelector("#route").innerText = (details.routeID && details.routeName) ? `${details.routeID} - ${details.routeName}` : "N/A";

            // Populate SECOND header (for history page)
            const historyNameEl = document.querySelector("#history_name");
            const historyPhoneEl = document.querySelector("#history_phone");
            const historyAddressEl = document.querySelector("#history_address");
            const historyRouteEl = document.querySelector("#history_route");

            if (historyNameEl) historyNameEl.innerText = details.customerName || "N/A";
            if (historyPhoneEl) historyPhoneEl.innerText = details.contact || "N/A";
            if (historyAddressEl) historyAddressEl.innerText = details.address || "N/A";
            if (historyRouteEl) historyRouteEl.innerText = (details.routeID && details.routeName) ? `${details.routeID} - ${details.routeName}` : "N/A";

            // Populate dropdown
            const routeDropdown = document.getElementById('deliveryRoute');
            if (routeDropdown) {
                routeDropdown.innerHTML = '';
                const defaultOption = document.createElement('option');
                defaultOption.text = 'Choose route...';
                defaultOption.disabled = true;
                defaultOption.selected = true;
                routeDropdown.appendChild(defaultOption);

                routes.forEach(route => {
                    const option = document.createElement('option');
                    option.value = route.id;
                    option.text = `${route.id} - ${route.deliveryType} - ${route.route} - ₹${Number(route.rate).toFixed(2)}`;
                    if (route.id == cRoute) {
                        option.selected = true;
                        defaultOption.selected = false;
                    }
                    routeDropdown.appendChild(option);
                });

                routeDropdown.addEventListener('change', (e) => {
                    cRoute = e.target.value;
                });
            }
        }
        if (weekData && weekData[0] && weekData[0].weekID) {
            weekId = weekData[0].weekID;
            // document.querySelector("#week").innerText = weekData[0].weekdate || "N/A";
            const weekEl = document.querySelector("#week");
            if (weekEl) weekEl.innerText = `Week: ${weekData[0].weekdate || "N/A"}`;
            const historyWeekEl = document.querySelector("#history_week");
            if (historyWeekEl) historyWeekEl.innerText = weekData[0].weekdate || "N/A";
        } else {
            console.error("Current week data not found.");
            // document.querySelector("#week").innerText = "Week N/A";
            const weekEl = document.querySelector("#week");
            if (weekEl) weekEl.innerText = "Week: N/A";
            const historyWeekEl = document.querySelector("#history_week");
            if(historyWeekEl) historyWeekEl.innerText = "Week: N/A";
        }
        console.log('Fetched routes:', routes);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadMenu() {
    await fetchProductList();
    await fetchInventory();
    renderMenu();
    await fetchOrders(weekId, custID);
}

async function initializePurchaseHistory() {
    await loadOrderHistoryWeekDropdown(); // Populate week filter for history
    setupPurchaseHistoryEventListeners(); // Add listener to the filter form

    // Automatically load history for "all" weeks if customerId is available
    if (globalCustomerId && globalCustomerId !== 0) {
       await fetchAndDisplayConsumerOrders(globalCustomerId, 'all'); 
    } else {
       console.warn("Customer ID (cId) not available yet for initial history load.");
       const tableBody = document.querySelector('.purchase-history-body');
       const noOrdersMsg = document.getElementById('no-orders-message');
       if (tableBody) tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-5"><i class="fas fa-spinner fa-spin"></i> Waiting for user details...</td></tr>';
       if (noOrdersMsg) noOrdersMsg.style.display = 'none';
    }
}

async function fetchRoutes() {
    try {
        const response = await fetch('../knft/getRoutes.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch routes');
        const data = await response.json();
        // If data is an array, return it directly; else, try data.routes or empty array
        return Array.isArray(data) ? data : (data.routes || []);
    } catch (error) {
        console.error('Error fetching routes:', error);
        return [];
    }
}

async function fetchInventory() {
    try {
        const response = await fetch('../knft/getTempInv.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }});
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        if (data.data) prodData = data.data;
    } catch (error) {
        console.error('Error fetching inventory:', error.message);
    }
}

async function fetchProductList() {
    try {
        const response = await fetch('../knft/getProduct.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }});
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        if (data.data) {
            prodlist = data.data;
            // Build a map for fast lookup by product_id
            prodMap = {};
            prodlist.forEach(p => {
                prodMap[p.prod_id || p.product_id] = p;
            });
        }
    } catch (error) {
        console.error('Error fetching product list:', error.message);
    }
}

async function fetchWeeksForHistory() {
    try {
        const response = await fetch('../knft/getWeek.php', { method: 'POST' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return Array.isArray(data) ? data : []; // Ensure it returns an array
    } catch (error) {
        console.error('Error fetching weeks for history dropdown:', error);
        return []; // Return empty array on error
    }
}

async function fetchAndDisplayConsumerOrders(customerId, weekIdFilter) {
    const tableBody = document.querySelector('.purchase-history-body');
    const noOrdersMessage = document.getElementById('no-orders-message');

    if (!tableBody || !noOrdersMessage) {
        console.error("Purchase history table body or message element not found.");
        return;
    }

    tableBody.innerHTML = '<tr><td colspan="5" class="text-center p-5"><i class="fas fa-spinner fa-spin fa-2x"></i> Loading history...</td></tr>'; // Colspan matches number of <th>
    noOrdersMessage.style.display = 'none';
    // displayOrderHistoryMessage('Loading your order history...', true); // Optional, can be repetitive

    if (!customerId || customerId === 0) {
        displayOrderHistoryMessage('Your details are not loaded. Cannot fetch history.', false);
        noOrdersMessage.innerHTML = `<i class="fas fa-exclamation-triangle fa-2x mb-3 d-block text-danger"></i>Could not load your details to fetch history. Please try reloading.`;
        noOrdersMessage.style.display = 'block';
        tableBody.innerHTML = ''; // Clear loading spinner
        return;
    }

    try {
        const payload = {
            customer_id: customerId,
            week_id: weekIdFilter === 'all' ? 'all' : weekIdFilter
        };

        const response = await fetch('../knft/getConsumerpurchaseHistory.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}. Server: ${errorText}`);
        }

        const purchaseData = await response.json(); // Expecting a flat array of items or an object with error/message

        if (purchaseData.error) {
            throw new Error(purchaseData.error);
        }
        
        // The PHP script now directly returns the array of items, or an object with a message if empty
        let items = [];
        if (Array.isArray(purchaseData)) {
            items = purchaseData;
        } else if (purchaseData.items && Array.isArray(purchaseData.items)) {
            items = purchaseData.items;
        } else if (purchaseData.data && Array.isArray(purchaseData.data)) {
            items = purchaseData.data;
        }


        if (items.length > 0) {
            populateConsumerHistoryTable('.purchase-history-body', items, payload.week_id);
            displayOrderHistoryMessage(`Found ${items.length} order(s) for the selected period.`, true);
            
            // Update count badge
            const countBadge = document.getElementById('history-order-count');
            if (countBadge) countBadge.textContent = items.length;
            
        } else {
            noOrdersMessage.innerHTML = `<i class="fas fa-shopping-bag fa-2x mb-3 d-block"></i>You have no past orders for the selected period.`;
            noOrdersMessage.style.display = 'block';
            tableBody.innerHTML = '';
            displayOrderHistoryMessage(purchaseData.message || 'No orders found for this period.', true);
            
            // Update count badge
            const countBadge = document.getElementById('history-order-count');
            if (countBadge) countBadge.textContent = '0';
        }

    } catch (error) {
        console.error('Error fetching or processing purchase history:', error);
        displayOrderHistoryMessage(`Error: ${error.message}`, false);
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger p-3">Failed to load history. ${error.message}</td></tr>`;
        noOrdersMessage.style.display = 'none';
    }
}

async function fetchOrders(week_id, customer_id) {
    try {
        const response = await fetch('../knft/getOrderCustomer.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ customer_id: customer_id, week_id: week_id })
        });

        const text = await response.text(); // Debugging
        console.log("Raw Response:", text);

        const data = JSON.parse(text); // Convert response to JSON

        if (data.error) {
            // document.getElementById('order-result').innerHTML = `<p class="text-danger">${data.error}</p>`;
            const orderResultEl = document.getElementById('order-result');
            if (orderResultEl) orderResultEl.innerHTML = `<p class="text-danger">${data.error}</p>`;
            return;
        }
        console.log("Fetched existing orders (for prefill maybe?):", data);
        // renderOrders(data);
    } catch (error) {
        console.error('Error fetching orders:', error);
        // document.getElementById('order-result').innerHTML = `<p class="text-danger">Failed to fetch orders</p>`;
        const orderResultEl = document.getElementById('order-result');
        if (orderResultEl) orderResultEl.innerHTML = `<p class="text-danger">Failed to fetch orders</p>`;
    }
}

function renderMenu() {
    const tbody = document.querySelector('#productsTable tbody');
    if (!tbody) {
        console.error('Products table body not found');
        return;
    }
    
    tbody.innerHTML = '';
    
    prodData.forEach(product => {
        const productId = product.product_id;
        const productObj = prodMap[productId] || {};
        const productName = productObj.product || productObj.product_name || "Unknown";
        const productPrice = product.price;
        const minQuantity = productObj.minQuantity || 0;
        const step = productObj.step || 0.01;
        const availableQuantity = product.quantity;
        const purchasedQuantity = purchasedItems[productId]?.quantity || 0;
        const uom = productObj.unit_id || "";

        tbody.innerHTML += `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-leaf text-success me-2"></i>
                        <div>
                            <strong>${productName}</strong>
                            <small class="d-block text-muted">${productObj.category_id || ''}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div>
                        <span class="fw-bold text-success" id="p${productId}">₹${productPrice}/unit</span>
                        <small class="d-block text-muted">Available: <b id="ava${productId}">${(availableQuantity < 0) ? 0 : availableQuantity}</b> ${uom}</small>
                    </div>
                </td>
                <td>
                    <div class="input-group quantity-control" style="width: 150px;">
                        <button class="btn btn-outline-secondary decrease-qty" 
                                type="button" 
                                data-id="${productId}" 
                                data-step="${step || 0.1}" 
                                data-uom="${uom}">−</button>
                        <input type="number" 
                               id="q${productId}" 
                               class="form-control text-center quantity-input" 
                               value="${purchasedQuantity}"
                               min="${minQuantity}" 
                               max="${availableQuantity}" 
                               step="${step || 0.1}"
                               placeholder="0">
                        <button class="btn btn-outline-secondary increase-qty" 
                                type="button" 
                                data-id="${productId}" 
                                data-step="${step || 0.1}"
                                data-uom="${uom}">+</button>
                    </div>
                </td>
                <td>
                    <button class="btn btn-success addToCartButton" 
                            id="${productId}" 
                            ${(availableQuantity <= 0) ? "disabled" : ""}>
                        <i class="fas fa-cart-plus me-1"></i>Add to Cart
                    </button>
                </td>
            </tr>`;
    });

    // Add this CSS to style the quantity controls
    if (!document.getElementById('quantity-control-styles')) {
        const style = document.createElement('style');
        style.id = 'quantity-control-styles';
        style.textContent = `
            .quantity-control {
                width: 150px;
            }
            .quantity-control input {
                text-align: center;
                border-radius: 0;
                border-left: 0;
                border-right: 0;
            }
            .quantity-control button {
                width: 40px;
                padding: 0.375rem;
            }
            .quantity-input {
                max-width: 100px;
            }
        `;
        document.head.appendChild(style);
    }

    attachQuantityControlListeners();
    attachAddToCartEventListeners();
}

function attachQuantityControlListeners() {
    document.querySelectorAll('.decrease-qty, .increase-qty').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.getAttribute('data-id');
            const step = parseFloat(e.currentTarget.getAttribute('data-step'));
            const uom = e.currentTarget.getAttribute('data-uom').toLowerCase();
            const input = document.querySelector(`#q${productId}`);
            const availableQuantity = parseFloat(document.querySelector(`#ava${productId}`).innerText);
            
            let currentValue = parseFloat(input.value) || 0;
            let delta = e.currentTarget.classList.contains('increase-qty') ? step : -step;

            let newValue = currentValue + delta;

            // Validate bounds
            newValue = Math.max(parseFloat(input.min), Math.min(newValue, availableQuantity));
            
            // For 'nos' UoM, round to nearest integer
            if (uom === 'nos') {
                newValue = Math.floor(newValue);
            } else {
                // Round to avoid floating point precision issues
                newValue = Math.round(newValue * 100) / 100;
            }

            input.value = newValue;
        });
    });
}

function renderCart() {
    const cartBody = document.querySelector('#cartTableBody');
    const emptyMessage = document.getElementById('empty-cart-message');
    const cartCount = document.getElementById('cart-item-count');
    if (!cartBody) {
        const fallbackBody = document.querySelector('.cart-body');
        if (fallbackBody) {
            renderCartFallback(fallbackBody);
            return;
        }
    }
    
    if (!cartBody) return;

    const itemCount = Object.keys(purchasedItems).length;
    if (cartCount) cartCount.textContent = itemCount;
    if (document.getElementById('itemCount')) document.getElementById('itemCount').innerText = itemCount;

    if (itemCount === 0) {
        if (emptyMessage) emptyMessage.style.display = 'block';
        cartBody.innerHTML = '';
        if (document.getElementById('totalCost')) document.getElementById('totalCost').innerText = "₹0.00";
        return;
    }

    if (emptyMessage) emptyMessage.style.display = 'none';
    cartBody.innerHTML = '';

    let total = 0;

    Object.entries(purchasedItems).forEach(([productId, item]) => {
        const product = prodMap[productId] || { product: "Unknown", category: "Unknown" };
        const itemTotal = (item.price * item.quantity).toFixed(2);
        total += item.price * item.quantity;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${product.product || product.product_name || "Unknown"}</strong></td>
            <td>${product.category_id || "N/A"}</td>
            <td>₹${item.price.toFixed(2)}/${product.unit_id || ''}</td>
            <td>
                <div class="input-group" style="width: 120px;">
                    <input type="number" 
                           class="form-control form-control-sm" 
                           value="${item.quantity}"
                           min="1"
                           step="0.1"
                           onchange="updateCartQuantity(${productId}, this.value)">
                    <span class="input-group-text">${product.unit_id || ''}</span>
                </div>
            </td>
            <td><strong>₹${itemTotal}</strong></td>
            <td>
                <button class="btn btn-danger btn-sm deleteButton" data-id="${productId}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        cartBody.appendChild(row);
    });

    if (document.getElementById('totalCost')) {
        document.getElementById('totalCost').innerText = `₹${total.toFixed(2)}`;
    }
    attachDeleteEventListeners();
}

function renderCartFallback(cartBody) {
    cartBody.innerHTML = '';
    document.getElementById('itemCount').innerText = Object.keys(purchasedItems).length;
    if (Object.keys(purchasedItems).length === 0) {
        cartBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Your cart is empty</td></tr>`;
        document.getElementById('totalCost').innerText = "₹0.00";
        return;
    }

    let total = 0;

    Object.entries(purchasedItems).forEach(([productId, item]) => {
        const product = prodMap[productId] || { product: "Unknown", category: "Unknown" };
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.product || product.product_name || "Unknown"}</td>
            <td>${product.category_id || ""}</td>
            <td>₹${item.price.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>
                <button class="btn btn-danger btn-sm deleteButton" data-id="${productId}">Delete</button>
            </td>
        `;
        cartBody.appendChild(row);
        total += item.price * item.quantity;
    });

    document.getElementById('totalCost').innerText = `₹${total.toFixed(2)}`;
    attachDeleteEventListeners();
}

function updateCartQuantity(productId, newQuantity) {
    const quantity = parseFloat(newQuantity);
    
    if (quantity <= 0) {
        deleteFromCart(productId);
        return;
    }
    
    const availableQuantity = parseFloat(document.querySelector(`#ava${productId}`)?.innerText || 0);
    if (quantity > availableQuantity) {
        showOrderMessage(`Only ${availableQuantity} units available`, 'warning');
        renderCart(); // Reset to previous value
        return;
    }
    
    purchasedItems[productId].quantity = quantity;
    renderCart();
}

function attachAddToCartEventListeners() {
    document.querySelectorAll('.addToCartButton').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.id;
            const quantityInput = document.querySelector(`#q${productId}`);
            let quantity = parseFloat(quantityInput.value, 10);
            const priceText = document.querySelector(`#p${productId}`).textContent;
            const price = parseFloat(priceText.replace('₹', '').replace('Rs.', '').split('/')[0]);
            const availableElem = document.querySelector(`#ava${productId}`);
            const availableQuantity = availableElem ? parseFloat(availableElem.innerText, 10) : 0;
            const uom = (prodMap[productId]?.unit_id || "").toLowerCase();

            if (!quantity || quantity <= 0) {
                showOrderMessage('Please enter a valid quantity', 'warning');
                quantityInput.value = 0;
                return;
            }

            // If UOM is "nos", block decimals
            if (uom === "nos") {
                if (!Number.isInteger(quantity)) {
                    showOrderMessage('For items with unit "nos", please enter a whole number.', 'warning');
                    quantityInput.value = Math.floor(quantity) || 0;
                    return;
                }
            }

            if (quantity > availableQuantity) {
                showOrderMessage(`Only ${availableQuantity} units available`, 'warning');
                quantityInput.value = 0;
                return;
            }

            // Add to cart
            if (purchasedItems[productId]) {
                purchasedItems[productId].quantity += quantity;
            } else {
                purchasedItems[productId] = { quantity, price };
            }
            
            // Clear input and update displays
            quantityInput.value = '';
            renderCart();
            
            const productName = prodMap[productId]?.product || 'Product';
            showOrderMessage(`${productName} added to cart successfully!`, 'success');
        });
    });
}

// NEW: Show order message function
function showOrderMessage(message, type) {
    const orderResult = document.getElementById('order-result');
    if (orderResult) {
        orderResult.className = `alert alert-${type}`;
        orderResult.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>${message}`;
        orderResult.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            orderResult.style.display = 'none';
        }, 3000);
    }
}

async function sendPurchaseData(productId, quantity) {
    await fetch('../knft/removeQuantity.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity })
    });
}

async function insertData(productId, quantity, price) {
    await fetch('../knft/submitOrder.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            week_id: weekId,
            customer_id: cId,
            product_id: productId,
            quantity,
            routeId: cRoute,
            // date_time: currentDateTime,
            price,
            total: price * quantity,
            note: note || ''
        })
    });
}

async function loadOrderHistoryWeekDropdown() {
    const weekDropdown = document.getElementById('orderHistoryWeekDropdown');
    if (!weekDropdown) {
        console.error("loadOrderHistoryWeekDropdown: #orderHistoryWeekDropdown element not found.");
        return;
    }
    // Keep "Show All Orders" and set default prompt
    weekDropdown.innerHTML = '<option value="" disabled>Loading delivery weeks...</option><option value="all" selected>Show All Orders</option>';

    try {
        const weeks = await fetchWeeksForHistory();
        if (weeks && weeks.length > 0) {
            weeks.forEach(week => {
                if (week.weekID && week.weekdate) { // Ensure properties exist
                    const option = document.createElement('option');
                    option.value = week.weekID;
                    option.textContent = week.weekdate;
                    weekDropdown.appendChild(option);
                }
            });
            const loadingOption = weekDropdown.querySelector('option[disabled]');
            if(loadingOption) loadingOption.remove(); // Remove "Loading..."
        } else {
            const loadingOption = weekDropdown.querySelector('option[disabled]');
            if(loadingOption) loadingOption.textContent = 'No specific weeks found';
        }
    } catch (error) {
        console.error('Error populating week dropdown for history:', error);
        const loadingOption = weekDropdown.querySelector('option[disabled]');
        if(loadingOption) loadingOption.textContent = 'Error loading weeks';
    }
}

function populateConsumerHistoryTable(tableBodySelector, purchaseItems, weekId) {
    const tableBody = document.querySelector(tableBodySelector);
    const noOrdersMessage = document.getElementById('no-orders-message');

    if (!tableBody) {
        console.error("populateConsumerHistoryTable: table body not found", tableBodySelector);
        return;
    }
    tableBody.innerHTML = ""; // Clear existing table data
    if (noOrdersMessage) noOrdersMessage.style.display = 'none';

    if (!purchaseItems || purchaseItems.length === 0) {
        if (noOrdersMessage) {
            noOrdersMessage.innerHTML = `<i class="fas fa-shopping-bag fa-2x mb-3 d-block"></i>You have no past orders to display for the selected period.`;
            noOrdersMessage.style.display = 'block';
        }
        return;
    }

    purchaseItems.forEach(item => {
        const row = document.createElement("tr");
        const formattedRate = typeof item.rate === 'number' ? item.rate.toFixed(2) : parseFloat(item.rate || '0').toFixed(2);
        const pricePerUnitDisplay = `₹${formattedRate}${item.unit_id ? ' / ' + item.unit_id : ''}`;
        const totalCost = typeof item.total_cost === 'number' ? item.total_cost.toFixed(2) : (item.total_cost || '0.00');

        row.innerHTML = `
            <td data-label="Product Name">${item.product || 'N/A'}</td>
            <td data-label="Category">${item.category_id || 'N/A'}</td>
            <td data-label="Rate/Unit" class="text-end">${pricePerUnitDisplay}</td>
            <td data-label="Quantity" class="text-center">${item.quantity || '0'}</td>
            <td data-label="Total Cost" class="text-end">₹${totalCost}</td>
        `;
        tableBody.appendChild(row);
    });
}

function updateFinalTotal() {
    // Get order amount
    const orderAmountText = document.querySelector('.total-amount-figure')?.textContent?.replace(/[^\d.]/g, '');
    const orderAmount = orderAmountText ? parseFloat(orderAmountText) || 0 : 0;

    // Get delivery fee
    const deliveryFeeText = document.querySelector('.route-cost-figure')?.textContent?.replace(/[^\d.]/g, '');
    const deliveryFee = deliveryFeeText ? parseFloat(deliveryFeeText) || 0 : 0;

    // Set final total
    const finalTotalElem = document.querySelector('.final-total-figure');
    if (finalTotalElem) {
        finalTotalElem.textContent = `₹${(orderAmount + deliveryFee).toFixed(2)}`;
    }
}

// Call this function with the route ID you want to display
async function fillRouteDetails(routeId) {
    try {
        const response = await fetch('../knft/getRouteDetailsFromId.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ route_id: routeId })
        });
        const result = await response.json();
        if (result.success && result.data) {
            // Fill your UI elements here. Adjust selectors as needed.
            const routeFigure = document.querySelector('.route-figure');
            const routeCostFigure = document.querySelector('.route-cost-figure');
            const deliveryFee = document.querySelector('.deliveryfeelol');
            
            if (routeFigure) routeFigure.textContent = result.data.deliveryType + " - " + result.data.route || 'N/A';
            if (routeCostFigure) routeCostFigure.textContent = `₹${Number(result.data.rate).toFixed(2)}`;
            if (deliveryFee) deliveryFee.textContent = `₹${Number(result.data.rate).toFixed(2)}`;
            // document.querySelector('.route-figure').textContent = result.data.deliveryType + " - " +result.data.route || 'N/A';
            // document.querySelector('.route-cost-figure').textContent = `₹${Number(result.data.rate).toFixed(2)}`;
            // document.querySelector('.deliveryfeelol').textContent = `₹${Number(result.data.rate).toFixed(2)}`;
        } else {
            const routeFigure = document.querySelector('.route-figure');
            const routeCostFigure = document.querySelector('.route-cost-figure');
            if (routeFigure) routeFigure.textContent = 'N/A';
            if (routeCostFigure) routeCostFigure.textContent = 'N/A';
            // document.querySelector('.route-figure').textContent = 'N/A';
            // document.querySelector('.route-cost-figure').textContent = 'N/A';
        }
        updateFinalTotal();
    } catch (error) {
        console.error('Error fetching route details:', error);
        const routeFigure = document.querySelector('.route-figure');
        const routeCostFigure = document.querySelector('.route-cost-figure');
        if (routeFigure) routeFigure.textContent = 'N/A';
        if (routeCostFigure) routeCostFigure.textContent = 'N/A';
        // document.querySelector('.route-figure').textContent = 'N/A';
        // document.querySelector('.route-cost-figure').textContent = 'N/A';
        updateFinalTotal();
    }
}


// Function to handle deleting a product from the cart
function deleteFromCart(productId) {
    delete purchasedItems[productId]; // Remove the product from the cart
    renderCart(); // Re-render the cart
}

// Attach event listeners to "Delete" buttons in the cart
function attachDeleteEventListeners() {
    document.querySelectorAll('.deleteButton').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.getAttribute('data-id');
            deleteFromCart(productId);
        });
    });
}

function displayOrderHistoryMessage(message, isSuccess) {
    const element = document.getElementById('order-history-result');
    if (element) {
        element.textContent = message;
        element.className = `m-3 alert ${isSuccess ? 'alert-success' : 'alert-danger'}`;
        element.style.display = 'block';
        setTimeout(() => { element.style.display = 'none'; }, 5000); // Hide after 5 seconds
    } else {
        console.warn("displayOrderHistoryMessage: #order-history-result element not found");
    }
} 

function setupPurchaseHistoryEventListeners() {
    const historyForm = document.getElementById('orderHistoryWeekForm');
    if (historyForm) {
        historyForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const selectedWeekId = document.getElementById('orderHistoryWeekDropdown').value;
            // globalCustomerId is `cId` from your existing code
            if (!globalCustomerId || globalCustomerId === 0) {
                // Attempt to re-fetch or show error
                // Your main_load should set cId (globalCustomerId)
                console.error("Customer ID not set. Cannot load history.");
                displayOrderHistoryMessage("Cannot load history: Your user details are not fully loaded. Please try reloading.", false);
                return;
            }
            fetchAndDisplayConsumerOrders(globalCustomerId, selectedWeekId);
        });
    }
}

// Fetch fulfillment data for a customer and week
async function fetchCustomerFulfillment(customerId, weekIdFilter) {
    try {
        const response = await fetch('../knft/getCustomerFulfillment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer_id: customerId, week_id: weekIdFilter })
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching fulfillment data:', error);
        return { error: error.message };
    }
}

// Render fulfillment data in the table
function renderFulfillmentTable(items) {
    const tbody = document.querySelector('.fulfillment-table-body');
    const noMsg = document.getElementById('no-fulfillment-data-message');
    if (!tbody) return;
     
    tbody.innerHTML = '';

    if (!items || items.length === 0) {
        if (noMsg) noMsg.style.display = 'block';
        return;
    }

    if (noMsg) noMsg.style.display = 'none';
    let price = 0;
    let cRouteId = items[0].route_id || ''; // Get route ID from first item

    items.forEach(item => {
        const tr = document.createElement('tr');
        price += item.total_cost || 0; // Sum up total cost

        const rateFormatted = item.rate ? Number(item.rate).toFixed(2) : '0.00';
        const totalFormatted = item.total_cost ? Number(item.total_cost).toFixed(2) : '0.00';

        tr.innerHTML = `
            <td data-label="Product">${item.product || ''}</td>
            <td data-label="Ordered Qty">${item.ordered_quantity || ''}</td>
            <td data-label="Fulfilled Qty">${item.fullfill_quantity || ''}</td>
            <td data-label="Rate">₹${rateFormatted}</td>
            <td data-label="Total Cost">₹${totalFormatted}</td>
        `;
        tbody.appendChild(tr);
    });

    const totalAmountFigure = document.querySelector('.total-amount-figure');
    if (totalAmountFigure) totalAmountFigure.textContent = `₹${price.toFixed(2)}`;
    // document.querySelector('.total-amount-figure').textContent = `₹${price.toFixed(2)}`;
    fillRouteDetails(cRouteId);
}

// Show fulfillment data message
function showFulfillmentMessage(msg, isSuccess = true) {
    const el = document.getElementById('fulfillment-data-message');
    if (el) {
        el.textContent = msg;
        el.className = `m-3 alert ${isSuccess ? 'alert-success' : 'alert-danger'}`;
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 5000);
    }
}

// Load fulfillment data for selected week
async function loadFulfillmentData(customerId, weekId) {
    const data = await fetchCustomerFulfillment(customerId, weekId);
    if (Array.isArray(data)) {
        renderFulfillmentTable(data);
        showFulfillmentMessage('Fulfillment data loaded.', true);
    } else if (data.items && Array.isArray(data.items)) {
        renderFulfillmentTable(data.items);
        showFulfillmentMessage(data.message || 'No fulfillment found.', true);
    } else if (data.error) {
        renderFulfillmentTable([]);
        showFulfillmentMessage(data.error, false);
    } else {
        renderFulfillmentTable([]);
        showFulfillmentMessage('No fulfillment data found.', true);
    }
}

// Populate week dropdown for fulfillment filter (reuse fetchWeeksForHistory)
async function populateFulfillmentWeekDropdown() {
    const weekDropdown = document.getElementById('fulfillmentDataWeekDropdown');
    if (!weekDropdown) return;
    weekDropdown.innerHTML = '<option value="" disabled>Loading delivery weeks...</option><option value="all" selected>Show All Fulfillments</option>';
    try {
        const weeks = await fetchWeeksForHistory();
        if (weeks && weeks.length > 0) {
            weeks.forEach(week => {
                if (week.weekID && week.weekdate) {
                    const option = document.createElement('option');
                    option.value = week.weekID;
                    option.textContent = week.weekdate;
                    weekDropdown.appendChild(option);
                }
            });
            const loadingOption = weekDropdown.querySelector('option[disabled]');
            if (loadingOption) loadingOption.remove();
        } else {
            const loadingOption = weekDropdown.querySelector('option[disabled]');
            if (loadingOption) loadingOption.textContent = 'No specific weeks found';
        }
    } catch (error) {
        const loadingOption = weekDropdown.querySelector('option[disabled]');
        if (loadingOption) loadingOption.textContent = 'Error loading weeks';
    }
}

// Setup event listener for fulfillment week filter form
function setupFulfillmentWeekForm(customerId) {
    const form = document.getElementById('fulfillmentDataWeekForm');
    if (!form) return;
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const finalTotal = document.querySelector('.final-total-figure');
        const totalAmount = document.querySelector('.total-amount-figure');
        const deliveryFee = document.querySelector('.deliveryfeelol');
        const routeFigure = document.querySelector('.route-figure');
        const routeCost = document.querySelector('.route-cost-figure');
        
        if (finalTotal) finalTotal.innerText = "N/A";
        if (totalAmount) totalAmount.innerText = "N/A";
        if (deliveryFee) deliveryFee.innerText = "N/A";
        if (routeFigure) routeFigure.innerText = "N/A";
        if (routeCost) routeCost.innerText = "N/A";
        // document.querySelector('.final-total-figure').innerText = "N/A";
        // document.querySelector('.total-amount-figure').innerText = "N/A";
        // document.querySelector('.deliveryfeelol').innerText = "N/A";
        // document.querySelector('.route-figure').innerText = "N/A";
        // document.querySelector('.route-cost-figure').innerText = "N/A";
        const weekId = document.getElementById('fulfillmentDataWeekDropdown').value;
        loadFulfillmentData(customerId, weekId);
    });
}

// Call this after main_load or when customerId is available
async function initializeFulfillmentSection() {
    await populateFulfillmentWeekDropdown();
    setupFulfillmentWeekForm(globalCustomerId);
    // Load all fulfillments by default
    if (globalCustomerId && globalCustomerId !== 0) {
        loadFulfillmentData(globalCustomerId, 'all');
    }
}

document.getElementById('placeOrderButton').addEventListener('click', async () => {
    if (Object.keys(purchasedItems).length === 0) {
        alert('Your cart is empty. Please add items to the cart before placing an order.');
        return;
    }

    // Loop through all items to validate and sanitize "nos"
    for (const [productId, item] of Object.entries(purchasedItems)) {
        const uom = (prodMap[productId]?.unit_id || "").toLowerCase();

        if (uom === "nos") {
            // FORCE integer quantity
            const original = item.quantity;
            item.quantity = Math.floor(item.quantity);

            if (original !== item.quantity) {
                alert(`Invalid quantity for "${prodMap[productId]?.product || 'this item'}". It must be a whole number.`);
                return;
            }

            // Also update the quantity input box on UI
            const input = document.getElementById(`q${productId}`);
            if (input) input.value = item.quantity;
        }
    }

    if (!cRoute) {
        showOrderMessage('Please select a delivery route before placing your order.', 'warning');
        return;
    }

    console.warn("Confirm Purchase By clicking Ok");
    note=document.querySelector("#noteText").value || ''; // Get note from the note input field
    const orderButton = document.getElementById('placeOrderButton');
    const originalText = orderButton.innerHTML;
    orderButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing...';
    orderButton.disabled = true;
    try {
        const orderData = {
            week_id: weekId,
            customer_id: cId,
            routeId: cRoute,
            items: Object.entries(purchasedItems).map(([productId, item]) => ({
                product_id: productId,
                quantity: item.quantity,
                price: item.price,
                total: item.quantity * item.price
            })),
            note: note
        };

        const response = await fetch('../knft/submitOrder.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        // Parse response as JSON
        const result = await response.json();
        if (result.success) {
            showOrderMessage(result.success, 'success');

            purchasedItems = {};
            renderCart();
            if (document.getElementById('noteText')) {
                document.getElementById('noteText').value = '';
            }
                
            await loadMenu();
        } else if (result.warning) {
            showOrderMessage(result.warning.join('\n'), 'warning');
        } else if (result.error) {
            showOrderMessage(result.error, 'danger');
        } else {
            showOrderMessage('Unknown response from server.', 'danger');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showOrderMessage('An error occurred while placing your order. Please try again.', 'danger');
    } finally {
        orderButton.innerHTML = originalText;
        orderButton.disabled = false;
    }
});

document.getElementById('noteForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const noteTextEl = document.getElementById('noteText');
    const note = noteTextEl?.value.trim();
    const cust_id = cId;      // Use your global or session customer ID variable
    
// const weekId = weekId;    // Use your global or session week ID variable
    if (!note) {
        showNoteResult('Please enter a note.', false);
        return;
    }

    try {
        const response = await fetch('../knft/submitNote.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cust_id, note, weekId })
        });
        const result = await response.json();
        showNoteResult(result.message, result.success);
        if (result.success) document.getElementById('noteForm').reset();
    } catch (error) {
        showNoteResult('Failed to submit note. Please try again.', false);
    }
});

function showNoteResult(message, isSuccess) {
    const el = document.getElementById('noteResult');
    if (el) {
        el.textContent = message;
        el.className = 'mt-3 alert ' + (isSuccess ? 'alert-success' : 'alert-danger');
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 4000);
    }
}

window.orderManager = {
    showSection,
    updateCartQuantity,
    deleteFromCart
};