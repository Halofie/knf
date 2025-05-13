// --- Global Variables (from your original structure) ---
// const now = new Date(); // Not needed globally if generated per item/submission
// const currentDateTime = now.toLocaleString(); // Not needed globally

let globalCustomerId = null; // Renamed from custID/cId for clarity
let globalCurrentWeekId = null; // For which week products are shown/ordered
let globalCustomerRoute = "";

let productMasterList = []; // From getProduct.php (master details like name, category)
let currentWeekInventory = []; // From getTempInv.php (items available this week with price, qty)
let cart = {}; // Client-side cart: { inventory_item_id: { quantity: X, name: Y, price: Z, unit: A, productId: B, available: C }, ... }
                    // Using inventory_item_id as key is better if `getTempInv.php` returns unique IDs for each inventory entry.
                    // If `getTempInv.php` uses `product_id` as the main identifier, then use that. Let's assume `product.id` from `getTempInv.php` is the unique inventory entry ID.

// --- Initialization ---
document.addEventListener('DOMContentLoaded', async () => {
    initializeClock(); // Assuming clock.js handles the #date element dynamically
    await initializeCustomerPage();
});

async function fetchEmail() {
    try {
        const response = await fetch('../knft/returnE.php', { method: "POST" });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data?.email || null;
    } catch (error) {
        console.error('Error fetching session email:', error);
        return null;
    }
}

async function initializeCustomerPage() {
    console.log("Customer Page: Initializing...");
    try {
        const email = await fetchEmail();
        if (!email) {
            alert("Session issue. Redirecting to login.");
            window.location.href = '../../home.html';
            return;
        }
        console.log("User's session email:", email);

        await loadCustomerAndWeekDetails(email); // Populates globals: customerId, currentWeekId, customerRoute
        
        if (!globalCustomerId || !globalCurrentWeekId) {
            displayPageMessage("Could not load necessary customer or week data. Please try again.", false);
            return;
        }

        await loadProductMasterList(); // Populates globalProductMasterList
        await loadCurrentWeekInventory(); // Populates globalCurrentWeekInventory and renders product menu

        renderCartDisplay(); // Initial cart render (likely empty)
        setupPageEventListeners();
        console.log("Customer Page: Initialization complete.");

    } catch (error) {
        console.error("Error during customer page initialization:", error);
        displayPageMessage("Failed to initialize the page. Please refresh.", false);
    }
}

async function loadCustomerAndWeekDetails(email) {
    try {
        const [customerResponse, weekResponse] = await Promise.all([
            fetch('../knft/getCustomer2.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            }),
            fetch('../knft/getLastWeek.php') // Assuming method POST is default or not needed
        ]);

        if (!customerResponse.ok) throw new Error(`Customer details fetch failed: ${customerResponse.status}`);
        const customerData = await customerResponse.json();
        console.log("Customer Data:", customerData);
        if (customerData.status === 'success' && customerData.details) {
            globalCustomerId = customerData.details.customerID; // Ensure your PHP sends customerID
            globalCustomerRoute = customerData.details.routeName;
            document.querySelector("#name").innerText = customerData.details.customerName || "Valued Customer";
            document.querySelector("#phone").innerText = customerData.details.contact || "N/A";
            document.querySelector("#address").innerText = customerData.details.address || "N/A";
            document.querySelector("#route").innerText = `Route: ${customerData.details.routeName || "N/A"}`;
        } else {
            throw new Error(`Failed to load customer details: ${customerData.message || 'Unknown error'}`);
        }

        if (!weekResponse.ok) throw new Error(`Last week fetch failed: ${weekResponse.status}`);
        const weekData = await weekResponse.json();
        if (weekData && weekData.length > 0 && weekData[0].weekID) {
            globalCurrentWeekId = weekData[0].weekID;
            document.querySelector("#week").innerText = `Current Week: ${weekData[0].weekdate || globalCurrentWeekId}`;
        } else {
            throw new Error("Could not determine current selling week.");
        }
    } catch (error) {
        console.error('Error in loadCustomerAndWeekDetails:', error);
        displayPageMessage(error.message, false);
        // globalCustomerId or globalCurrentWeekId might remain null, handled in initializeCustomerPage
    }
}

async function loadProductMasterList() {
    try {
        const response = await fetch('../knft/getProduct.php'); // Assuming POST is default or not needed
        if (!response.ok) throw new Error(`Product master list fetch failed: ${response.status}`);
        const data = await response.json();
        if (data.status === 'success' && data.data) {
            productMasterList = data.data;
            console.log("Product Master List Loaded:", productMasterList.length, "items");
        } else {
            productMasterList = [];
            console.warn("No product master data found or error:", data.message);
        }
    } catch (error) {
        console.error('Error fetching product master list:', error);
        productMasterList = [];
    }
}

async function loadCurrentWeekInventory() {
    const productTableBody = document.querySelector('.products tbody');
    if (!productTableBody) return;
    productTableBody.innerHTML = `<tr><td colspan="4" class="text-center">Loading available products...</td></tr>`;

    try {
        // **This needs a PHP script: get_available_inventory.php**
        // It should return items from the main `inventory` table for the globalCurrentWeekId
        // with quantity > 0, joined with `suppliers` for farmer name.
        // Expected item structure: { inventory_id: X, product_id: Y, display_product_name: 'Name', unit_price: N, available_quantity: Q, unit_id: 'kg', farmer_name: 'Farmer X' }
        const response = await fetch('../knft/getTempInv.php', { // **NEW PHP SCRIPT NEEDED**
             method: 'POST',
             headers: {'Content-Type': 'application/json'},
             body: JSON.stringify({ week_id: globalCurrentWeekId })
        });
        console.log("loadCurrentWeekInventory - globalCurrentWeekId sent:", globalCurrentWeekId);
        if (!response.ok) throw new Error(`Available inventory fetch failed: ${response.status}`);
        const data = await response.json();
        console.log("loadCurrentWeekInventory - Data received from PHP:", JSON.stringify(data, null, 2));
        if (data.status === 'success' && data.inventory && data.inventory.length > 0) {
            currentWeekInventory = data.inventory;
            console.log("Current Week Inventory Loaded:", currentWeekInventory.length, "items");
            renderProductMenu();
        } else {
            currentWeekInventory = [];
            productTableBody.innerHTML = `<tr><td colspan="4" class="text-center">${data.message || 'No products available this week.'}</td></tr>`;
        }
    } catch (error) {
        currentWeekInventory = [];
        console.warn("loadCurrentWeekInventory - No products to display. Reason:", {
            status: data.status,
            hasInventoryArray: Array.isArray(data.inventory),
            inventoryLength: data.inventory ? data.inventory.length : 'N/A',
            messageFromPHP: data.message
        });
        productTableBody.innerHTML = `<tr><td colspan="4" class="text-center">${data.message || 'No products available this week.'}</td></tr>`;
        currentWeekInventory = [];
    }
}

function renderProductMenu() {
    const tbody = document.querySelector('.products tbody');
    tbody.innerHTML = ''; // Clear previous

    if (currentWeekInventory.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No products currently available for ordering.</td></tr>`;
        return;
    }

    currentWeekInventory.forEach(item => {
        // item = { inventory_id, product_id, display_product_name, unit_price, available_quantity, unit_id, farmer_name }
        const masterProduct = productMasterList.find(p => String(p.prod_id) === String(item.product_id));
        const productName = item.display_product_name || (masterProduct ? masterProduct.product : "Unknown Product");
        
        // Check if item is already in cart to prefill quantity or disable if fully carted
        const cartItem = cart[item.inventory_id];
        const currentAvailable = cartItem ? item.available_quantity - cartItem.quantity : item.available_quantity;
        const canAddToCart = currentAvailable > 0;

        tbody.innerHTML += `
            <tr>
                <td>
                    ${productName}<br>
                    <small class="text-muted">By: ${item.farmer_name || 'KNF Farmer'}</small>
                </td>
                <td>
                    Rs. ${parseFloat(item.unit_price).toFixed(2)} / ${item.unit_id}<br>
                    <small class="${canAddToCart ? 'text-success' : 'text-danger'}">
                        Available: ${currentAvailable} ${item.unit_id}
                    </small>
                </td>
                <td>
                    <input type="number" class="form-control form-control-sm product-quantity-input" 
                           value="1" min="1" max="${currentAvailable}" 
                           ${!canAddToCart ? 'disabled' : ''} 
                           data-inventory-id="${item.inventory_id}">
                </td>
                <td>
                    <button class="btn btn-success btn-sm add-to-cart-button" 
                            data-inventory-id="${item.inventory_id}"
                            ${!canAddToCart ? 'disabled' : ''}>
                        Add to Cart
                    </button>
                </td>
            </tr>`;
    });
}

function renderCartDisplay() {
    const cartBody = document.querySelector('.cart-body');
    cartBody.innerHTML = '';

    if (Object.keys(cart).length === 0) {
        cartBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Your cart is empty</td></tr>`;
        document.getElementById('placeOrderButton').disabled = true;
        return;
    }

    document.getElementById('placeOrderButton').disabled = false;
    let grandTotal = 0;

    Object.values(cart).forEach(item => { // cart item: { quantity, name, price, unit, inventoryId, productId, available }
        const masterProduct = productMasterList.find(p => String(p.prod_id) === String(item.productId));
        const category = masterProduct ? masterProduct.category_id : 'N/A';
        const itemTotal = item.price * item.quantity;
        grandTotal += itemTotal;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${category}</td>
            <td>Rs. ${item.price.toFixed(2)}</td>
            <td>
                <input type="number" value="${item.quantity}" min="1" max="${item.available}" 
                       class="form-control form-control-sm cart-quantity-update" 
                       data-inventory-id="${item.inventoryId}">
            </td>
            <td>Rs. ${itemTotal.toFixed(2)}</td>
            <td>
                <button class="btn btn-danger btn-sm remove-from-cart-button" data-inventory-id="${item.inventoryId}">Remove</button>
            </td>
        `;
        cartBody.appendChild(row);
    });

    // Add Grand Total Row
    cartBody.innerHTML += `
        <tr>
            <td colspan="3"></td>
            <th class="text-end">Grand Total:</th>
            <td colspan="2"><strong>Rs. ${grandTotal.toFixed(2)}</strong></td>
        </tr>
    `;
}


function setupPageEventListeners() {
    const productTable = document.querySelector('.products tbody');
    const cartTableBody = document.querySelector('.cart-body');
    const placeOrderBtn = document.getElementById('placeOrderButton');

    // Event delegation for "Add to Cart" buttons
    if (productTable) {
        productTable.addEventListener('click', event => {
            const addButton = event.target.closest('.add-to-cart-button');
            if (addButton) {
                const inventoryId = addButton.dataset.inventoryId;
                const quantityInput = productTable.querySelector(`.product-quantity-input[data-inventory-id="${inventoryId}"]`);
                const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

                const inventoryItem = currentWeekInventory.find(item => String(item.inventory_id) === String(inventoryId));
                if (!inventoryItem) {
                    alert("Product details not found.");
                    return;
                }

                if (isNaN(quantity) || quantity <= 0) {
                    alert("Please enter a valid quantity.");
                    if(quantityInput) quantityInput.value = 1;
                    return;
                }
                
                // Check against actual available in inventory, considering what's already in cart
                const cartItem = cart[inventoryId];
                const alreadyInCartQty = cartItem ? cartItem.quantity : 0;
                if (quantity + alreadyInCartQty > inventoryItem.available_quantity) {
                    alert(`Cannot add ${quantity}. Only ${inventoryItem.available_quantity - alreadyInCartQty} more units available for ${inventoryItem.display_product_name}.`);
                    if(quantityInput) quantityInput.value = 1; // Reset
                    return;
                }
                
                // Add or update cart
                if (cart[inventoryId]) {
                    cart[inventoryId].quantity += quantity;
                } else {
                    const masterProduct = productMasterList.find(p => String(p.prod_id) === String(inventoryItem.product_id));
                    cart[inventoryId] = {
                        inventoryId: inventoryItem.inventory_id,
                        productId: inventoryItem.product_id,
                        name: inventoryItem.display_product_name || (masterProduct ? masterProduct.product : "Unknown"),
                        price: parseFloat(inventoryItem.unit_price),
                        unit: inventoryItem.unit_id,
                        quantity: quantity,
                        available: parseInt(inventoryItem.available_quantity) // Original available quantity
                    };
                }
                displayPageMessage(`Added ${quantity} x ${cart[inventoryId].name} to cart.`, true, '#cart-result');
                renderCartDisplay();
                renderProductMenu(); // Re-render product menu to update available quantities
            }
        });
    }

    // Event delegation for cart actions (remove, quantity update)
    if (cartTableBody) {
        cartTableBody.addEventListener('click', event => {
            const removeButton = event.target.closest('.remove-from-cart-button');
            const quantityInput = event.target.closest('.cart-quantity-update');

            if (removeButton) {
                const inventoryId = removeButton.dataset.inventoryId;
                delete cart[inventoryId];
                displayPageMessage("Item removed from cart.", true, '#cart-result');
                renderCartDisplay();
                renderProductMenu(); // Update product list availability
            }
            // Quantity update via input field change can be handled with 'change' event
        });
        cartTableBody.addEventListener('change', event => {
            const quantityInput = event.target.closest('.cart-quantity-update');
             if (quantityInput) {
                const inventoryId = quantityInput.dataset.inventoryId;
                let newQuantity = parseInt(quantityInput.value);

                if (!cart[inventoryId]) return; // Should not happen

                if (isNaN(newQuantity) || newQuantity < 1) {
                    alert("Quantity must be at least 1. To remove, use the delete button.");
                    quantityInput.value = cart[inventoryId].quantity; // Revert to old value
                    return;
                }
                if (newQuantity > cart[inventoryId].available) {
                    alert(`Cannot set quantity to ${newQuantity}. Only ${cart[inventoryId].available} units originally available.`);
                    quantityInput.value = cart[inventoryId].quantity; // Revert
                    return;
                }
                cart[inventoryId].quantity = newQuantity;
                renderCartDisplay();
                renderProductMenu(); // Update product list availability
            }
        });
    }

    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', async () => {
            if (Object.keys(cart).length === 0) {
                alert('Your cart is empty.');
                return;
            }

            placeOrderBtn.disabled = true;
            placeOrderBtn.textContent = 'Placing Order...';
            displayPageMessage("Placing your order...", true, '#cart-result');

            const orderItems = Object.values(cart).map(item => ({
                inventory_id: item.inventoryId, // Send inventory_id
                product_id: item.productId,
                quantity: item.quantity,
                price_per_unit: item.price,
                total_price: item.quantity * item.price
            }));

            const orderPayload = {
                customer_id: globalCustomerId,
                week_id: globalCurrentWeekId,
                route_id: globalCustomerRoute, // Assuming you have this
                order_date: new Date().toISOString(), // Server should ideally use its own timestamp
                items: orderItems,
                grand_total: orderItems.reduce((sum, item) => sum + item.total_price, 0)
            };

            try {
                // **This needs a PHP script: place_order.php**
                const response = await fetch('../knft/submitOrder.php', { // **NEW PHP SCRIPT NEEDED**
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderPayload)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Order placement failed: ${response.status}. ${errorText}`);
                }
                const result = await response.json();

                if (result.status === 'success') {
                    displayPageMessage(`Order placed successfully! Your Order ID: ${result.order_id || 'N/A'}`, true, '#cart-result');
                    cart = {}; // Clear cart
                    renderCartDisplay();
                    // Refresh available inventory from server as quantities have changed
                    await loadCurrentWeekInventory();
                } else {
                    displayPageMessage(`Order placement failed: ${result.message || 'Unknown server error.'}`, false, '#cart-result');
                }
            } catch (error) {
                console.error('Error placing order:', error);
                displayPageMessage(`Error: ${error.message}`, false, '#cart-result');
            } finally {
                placeOrderBtn.disabled = false;
                placeOrderBtn.textContent = 'Place Your Order';
            }
        });
    }
}

// --- Utility Functions ---
function displayPageMessage(message, isSuccess, targetSelector = '#order-result') { // Default target
    const element = document.querySelector(targetSelector);
    if (element) {
        element.innerHTML = message; // Use innerHTML if message might contain simple HTML
        element.className = `m-3 alert ${isSuccess ? 'alert-success' : 'alert-danger'}`;
        element.style.display = 'block';
        setTimeout(() => { element.style.display = 'none'; }, 5000);
    } else {
        console.warn("displayPageMessage: selector not found", targetSelector, "Message:", message);
        if(isSuccess) alert("Success: " + message); else alert("Error: " + message); // Fallback
    }
}

function initializeClock() { // From your original code
    const clockDiv = document.querySelector('.clock'); // Targets your HTML
    if (!clockDiv) {
        console.warn("Clock element '.clock' not found.");
        // Fallback to #date if it exists and .clock doesn't
        const dateElement = document.getElementById('date');
        if(dateElement) dateElement.textContent = new Date().toLocaleString();
        return;
    }

    function updateClock() {
        clockDiv.textContent = new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'medium' });
    }
    updateClock();
    setInterval(updateClock, 1000);
}

// Example of what get_available_inventory.php should return:
// {
//   "status": "success",
//   "inventory": [
//     { "inventory_id": 101, "product_id": "P001", "display_product_name": "Farm Fresh Tomatoes", "unit_price": 50.00, "available_quantity": 20, "unit_id": "kg", "farmer_name": "Farmer John" },
//     { "inventory_id": 102, "product_id": "P002", "display_product_name": "Organic Spinach", "unit_price": 30.00, "available_quantity": 15, "unit_id": "bunch", "farmer_name": "Farmer Jane" }
//   ],
//   "message": "2 products found."
// }

// Example of what place_order.php should expect as payload:
// {
//   "customer_id": 123,
//   "week_id": "2023-W45",
//   "route_id": "RouteA",
//   "order_date": "2023-11-10T10:00:00.000Z",
//   "grand_total": 80.00,
//   "items": [
//     { "inventory_id": 101, "product_id": "P001", "quantity": 1, "price_per_unit": 50.00, "total_price": 50.00 },
//     { "inventory_id": 102, "product_id": "P002", "quantity": 1, "price_per_unit": 30.00, "total_price": 30.00 }
//   ]
// }
// Example of what place_order.php should return on success:
// {
//   "status": "success",
//   "message": "Order placed successfully!",
//   "order_id": "ORD-2023-789"
// }