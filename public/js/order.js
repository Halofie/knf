const now = new Date();

let custID = 0;
let weekId = 0;
let cRoute = "";
let cId = 0;

let globalCustomerId = 0;

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
                option.text = `${route.id} - ${route.route}`;
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
    await renderMenu();
    
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

let prodData = [];
let prodlist = [];
let purchasedItems = {};
let prodMap = {};

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
            populateConsumerHistoryTable('.purchase-history-body', items);
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
        const availableQuantity = product.quantity;
        const purchasedQuantity = purchasedItems[productId]?.quantity || 0;
        
        tbody.innerHTML += `
            <tr>
                <th scope="row">${productName}</th>
                <td>
                    <p class="price" id="p${productId}">Rs.${productPrice}/unit</p>
                    <p>Available: <b id="ava${productId}">${(availableQuantity < 0) ? 0 : availableQuantity }</b></p>
                </td>
                <td><input type="number" id="q${productId}" value="${purchasedQuantity}" min="0" max="${availableQuantity}"></td>
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
            const quantity = parseInt(quantityInput.value, 10);
            const price = parseFloat(document.querySelector(`#p${productId}`).textContent.replace('Rs.', '').split('/')[0]);
            const availableElem = document.querySelector(`#ava${productId}`);
            const availableQuantity = availableElem ? parseInt(availableElem.innerText, 10) : 0;

            if (quantity > 0 && quantity <= availableQuantity) {
                // Only update the cart, do not update availability
                purchasedItems[productId] = { quantity, price };
                renderCart();
            } else {
                alert('Quantity must be greater than 0 and less than or equal to available.');
                quantityInput.value = 0;
            }
        });
    });
}

function deleteRow(week_id, customer_id, product_id) {
    fetch("../knft/deleteOrder.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `week_id=${week_id}&customer_id=${customer_id}&product_id=${product_id}`
    })
    .then(response => response.json())
    .then(data => alert(data.success ? "Row deleted successfully!" : "Error: " + data.message))
    .catch(error => console.error("Error:", error));
}

function deleteRow2(week_id, customer_id, product_id, id) {
    fetch("../knft/deleteOrder2.php", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `week_id=${week_id}&customer_id=${customer_id}&product_id=${product_id}&id=${id}`
    })
    .then(response => response.json())
    .then(data => alert(data.success ? "Row deleted successfully!" : "Error: " + data.message))
    .catch(error => console.error("Error:", error));
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

function populateConsumerHistoryTable(tableBodySelector, purchaseItems) {
    const tableBody = document.querySelector(tableBodySelector);
    const noOrdersMessage = document.getElementById('no-orders-message');

    if (!tableBody) {
        console.error("populateConsumerHistoryTable: table body not found", tableBodySelector);
        return;
    }
    tableBody.innerHTML = ""; // Clear existing table data
    noOrdersMessage.style.display = 'none';

    if (!purchaseItems || purchaseItems.length === 0) {
        noOrdersMessage.innerHTML = `<i class="fas fa-shopping-bag fa-2x mb-3 d-block"></i>You have no past orders to display for the selected period.`;
        noOrdersMessage.style.display = 'block';
        return;
    }

    purchaseItems.forEach(item => {
        const row = document.createElement("tr");
        const formattedRate = typeof item.rate === 'number' ? item.rate.toFixed(2) : parseFloat(item.rate || '0').toFixed(2);
        const pricePerUnitDisplay = `₹${formattedRate}${item.unit_id ? ' / ' + item.unit_id : ''}`;
        row.innerHTML = `
            <td>${item.product || 'N/A'}</td>
            <td>${item.category_id || 'N/A'}</td>
            <td class="text-end">${pricePerUnitDisplay}</td>
            <td class="text-center">${item.quantity || '0'}</td>
            <td>${item.route || 'N/A'}</td> 
            <td class="text-end">₹${typeof item.total_cost === 'number' ? item.total_cost.toFixed(2) : (item.total_cost || '0.00')}</td>
        `;
        tableBody.appendChild(row);
    });
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

// Attach event listeners to "Purchase" buttons in the product menu
function attachPurchaseEventListeners() {
    document.querySelectorAll('.purchaseButton').forEach(button => {
        button.addEventListener('click', async (e) => {
            const productId = e.currentTarget.id;
            const quantityInput = document.querySelector(`#q${productId}`);
            const quantity = parseInt(quantityInput.value, 10);
            const price = parseFloat(document.querySelector(`#p${productId}`).textContent.replace('Rs.', '').split('/')[0]);
            const availableElem = document.querySelector(`#ava${productId}`);
            const availableQuantity = availableElem ? parseInt(availableElem.innerText, 10) : 0;
            // ...existing code...
            if (quantity > 0 && quantity <= availableQuantity) {
                // Add product to the cart
                purchasedItems[productId] = { quantity, price };

                // Update the cart UI
                renderCart();
            } else {
                alert('Quantity cannot be less than 0 or greater than available');
                quantityInput.value = 0; // Reset to 0 if invalid
            }
            // ...existing code...
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

// Attach event listener to "Place Your Order" button
// ...existing code...
document.getElementById('placeOrderButton').addEventListener('click', async () => {
    if (Object.keys(purchasedItems).length === 0) {
        alert('Your cart is empty. Please add items to the cart before placing an order.');
        return;
    }
    console.warn("Confirm Purchase By clicking Ok");
    try {
        // Prepare the data to send
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

        // Send the data to submitOrder.php
        const response = await fetch('../knft/submitOrder.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.text();
        alert(result);

        // Always reload inventory and menu after placing order
        purchasedItems = {};
        renderCart();
        await loadMenu(); // This will fetch latest temp_inventory and update the table

    } catch (error) {
        console.error('Error placing order:', error);
        alert('An error occurred while placing your order. Please try again.');
    }
});

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