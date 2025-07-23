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

    if (document.getElementById('purchaseHistorySection') && document.querySelector('.purchase-history-body')) {
        await initializePurchaseHistory();
    } else {
        console.log("Purchase history section/table body not found on this page, skipping initialization.");
    }

    // Initialize fulfillment section if present
    if (document.getElementById('fulfillmentDisplaySection')) {
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
            document.querySelector("#name").innerText = details.customerName || "N/A";
            document.querySelector("#phone").innerText = details.contact || "N/A";
            document.querySelector("#address").innerText = details.address || "N/A";
            document.querySelector("#route").innerText = (details.routeID && details.routeName) ? `${details.routeID} - ${details.routeName}` : "N/A";

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
        if (weekData && weekData[0] && weekData[0].weekID) {
            weekId = weekData[0].weekID;
            document.querySelector("#week").innerText = weekData[0].weekdate || "N/A";
            const historyWeekEl = document.querySelector("#history_week");
            if (historyWeekEl) historyWeekEl.innerText = weekData[0].weekdate || "N/A";
        } else {
            console.error("Current week data not found.");
            document.querySelector("#week").innerText = "Week N/A";
            const historyWeekEl = document.querySelector("#history_week");
            if(historyWeekEl) historyWeekEl.innerText = "Week N/A";
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

    tableBody.innerHTML = '<tr><td colspan="7" class="text-center p-5"><i class="fas fa-spinner fa-spin fa-2x"></i> Loading history...</td></tr>'; // Colspan matches number of <th>
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
            week_id: weekIdFilter
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
        } else if (purchaseData.items && Array.isArray(purchaseData.items)) { // If PHP wraps it
            items = purchaseData.items;
        }


        if (items.length > 0) {
            populateConsumerHistoryTable('.purchase-history-body', items, payload.week_id);
            if (purchaseData.message) { // Display message if PHP sent one (e.g. "No items for criteria but query ok")
                 displayOrderHistoryMessage(purchaseData.message, true);
            } else {
                 displayOrderHistoryMessage('Purchase history loaded.', true);
            }
        } else {
            noOrdersMessage.innerHTML = `<i class="fas fa-shopping-bag fa-2x mb-3 d-block"></i>You have no past orders for the selected period.`;
            noOrdersMessage.style.display = 'block';
            tableBody.innerHTML = ''; // Clear table body
            displayOrderHistoryMessage(purchaseData.message || 'No orders found for this period.', true);
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
            document.getElementById('order-result').innerHTML = `<p class="text-danger">${data.error}</p>`;
            return;
        }
        console.log("Fetched existing orders (for prefill maybe?):", data);
        // renderOrders(data);
    } catch (error) {
        console.error('Error fetching orders:', error);
        document.getElementById('order-result').innerHTML = `<p class="text-danger">Failed to fetch orders</p>`;
    }
}

function renderMenu() {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';
    
    prodData.forEach(product => {
        const productId = product.product_id;
        const productObj = prodMap[productId] || {};
        const productName = productObj.product || productObj.product_name || "Unknown";
        const productPrice = product.price;
        const minQuantity = productObj.minQuantity || 0; // Get minimum quantity
        const step = productObj.step || 0.01; // Get step value
        const availableQuantity = product.quantity;
        const purchasedQuantity = purchasedItems[productId]?.quantity || 0;
        const uom = productObj.unit_id || ""; // Get UOM

        // If UOM is "nos", restrict input to integers only
        const inputStep = (uom.toLowerCase() === "nos") ? 'step="1"' : 'step="any"';
        const inputPattern = (uom.toLowerCase() === "nos") ? 'pattern="\\d*"' : '';
        const inputOnInput = (uom.toLowerCase() === "nos") ? 'oninput="this.value = this.value.replace(/[^\\d]/g, \'\');"' : '';

        tbody.innerHTML += `
            <tr>
                <th scope="row">${productName}</th>
                <td>
                    <p class="price" id="p${productId}">Rs.${productPrice}/unit</p>
                    <p>Available: <b id="ava${productId}">${(availableQuantity < 0) ? 0 : availableQuantity }</b></p>
                </td>
                <td>
                    <input type="number" id="q${productId}" step="${step}" min="${minQuantity}" value="${purchasedQuantity}" max="${availableQuantity}" ${inputStep} ${inputPattern} ${inputOnInput}>
                </td>
                <td>
                    <button class="btn btn-primary btn-sm addToCartButton" id="${productId}" ${(availableQuantity <= 0) ? "disabled" : ""}>Add to Cart</button>
                </td>
            </tr>`;
    });
    attachAddToCartEventListeners();
}

function renderCart() {
    const cartBody = document.querySelector('.cart-body');
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
            <td>Rs.${item.price.toFixed(2)}</td>
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

function attachAddToCartEventListeners() {
    document.querySelectorAll('.addToCartButton').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.currentTarget.id;
            const quantityInput = document.querySelector(`#q${productId}`);
            let quantity = parseFloat(quantityInput.value, 10);
            const price = parseFloat(document.querySelector(`#p${productId}`).textContent.replace('Rs.', '').split('/')[0]);
            const availableElem = document.querySelector(`#ava${productId}`);
            const availableQuantity = availableElem ? parseFloat(availableElem.innerText, 10) : 0;
            const uom = (prodMap[productId]?.unit_id || "").toLowerCase();

            // If UOM is "nos", block decimals
            if (uom === "nos") {
                if (!Number.isInteger(quantity)) {
                    alert('For items with unit "nos", please enter a whole number.');
                    quantityInput.value = Math.floor(quantity) || 0;
                    return;
                }
            }

            if (quantity > 0 && quantity <= availableQuantity) {
                purchasedItems[productId] = { quantity, price };
                renderCart();
            } else {
                alert('Quantity must be greater than 0 and less than or equal to available.');
                quantityInput.value = 0;
            }
        });
    });
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
            <!--<td data-label="Route">${item.route || 'N/A'}</td> -->
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
            document.querySelector('.route-figure').textContent = result.data.deliveryType + " - " +result.data.route || 'N/A';
            document.querySelector('.route-cost-figure').textContent = `₹${Number(result.data.rate).toFixed(2)}`;
            document.querySelector('.deliveryfeelol').textContent = `₹${Number(result.data.rate).toFixed(2)}`;
        } else {
            document.querySelector('.route-figure').textContent = 'N/A';
            document.querySelector('.route-cost-figure').textContent = 'N/A';
        }
        updateFinalTotal();
    } catch (error) {
        console.error('Error fetching route details:', error);
        document.querySelector('.route-figure').textContent = 'N/A';
        document.querySelector('.route-cost-figure').textContent = 'N/A';
        updateFinalTotal();
    }
}
// Function to render the cart

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
    tbody.innerHTML = '';

    if (!items || items.length === 0) {
        noMsg.style.display = 'block';
        return;
    }

    noMsg.style.display = 'none';
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
            <!--<td data-label="Route">${item.route || ''}</td>-->
        `;
        tbody.appendChild(tr);
    });

    document.querySelector('.total-amount-figure').textContent = `₹${price.toFixed(2)}`;
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

    console.warn("Confirm Purchase By clicking Ok");

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
            }))
        };

        const response = await fetch('../knft/submitOrder.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        // Parse response as JSON
        const result = await response.json();
        if (result.success) {
            alert(result.success);
        } else if (result.warning) {
            alert(result.warning.join('\n'));
        } else if (result.error) {
            alert(result.error);
        } else {
            alert('Unknown response from server.');
        }

        purchasedItems = {};
        renderCart();
        await loadMenu();

    } catch (error) {
        console.error('Error placing order:', error);
        alert('An error occurred while placing your order. Please try again.');
    }
});

document.getElementById('noteForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const note = document.getElementById('noteText').value.trim();
    const cust_id = cId;      // Use your global or session customer ID variable
    const weekId = weekId;    // Use your global or session week ID variable

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
    el.textContent = message;
    el.className = 'mt-3 alert ' + (isSuccess ? 'alert-success' : 'alert-danger');
    el.style.display = 'block';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
}