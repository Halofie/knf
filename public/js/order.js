const now = new Date();
// const currentDateTime = now.toLocaleString();
let custID = 0;
let weekId = 0;
let cRoute = "";
let cId = 0;
let lock = 0; // Global variable to store userLock status

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
    await loadMenu();
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

            document.querySelector("#name").innerText = details.customerName;
            document.querySelector("#phone").innerText = details.contact;
            document.querySelector("#address").innerText = details.address;
            document.querySelector("#route").innerText = details.routeID + "-" + details.routeName;
        }
        if (weekData[0]) {
            weekId = weekData[0].weekID;
            document.querySelector("#week").innerText = weekData[0].weekdate;
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

let prodData = [];
let prodlist = [];
let purchasedItems = {};
let prodMap = {};

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

async function fetchOrders(week_id, customer_id) {
    try {
        const response = await fetch('../knft/getOrderCustomer.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ customer_id: 5, week_id: 10 })
        });

        const text = await response.text(); // Debugging
        console.log("Raw Response:", text);

        const data = JSON.parse(text); // Convert response to JSON

        if (data.error) {
            document.getElementById('order-result').innerHTML = `<p class="text-danger">${data.error}</p>`;
            return;
        }

        // renderOrders(data);
    } catch (error) {
        console.error('Error fetching orders:', error);
        document.getElementById('order-result').innerHTML = `<p class="text-danger">Failed to fetch orders</p>`;
    }
}

// Function to render the cart
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
// ...existing code...

// const now = new Date();
// // const currentDateTime = now.toLocaleString();
// let custID = 0;
// let weekId = 0;
// let cRoute = "";
// let cId = 0;

// async function fetchEmailAndRunProgram() {
//     try {
//         const response = await fetch('../knft/returnE.php');
//         if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
//         const data = await response.json();
//         const email = data?.email;
//         if (!email) {
//             console.warn("Email is null or undefined. Redirecting...");
//             window.location.href = '../home.html';
//             return;
//         }
//         console.log("User's session email:", email);
//         runNextProgram(email);
//     } catch (error) {
//         console.error('Error fetching session email:', error);
//     }
// }
// fetchEmailAndRunProgram();

// async function runNextProgram(email) {
//     await main_load(email);
//     await loadMenu();
// }

// async function main_load(email) {
//     try {
//         const [customerResponse, weekResponse] = await Promise.all([
//             fetch('../knft/getCustomer2.php', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email })
//             }),
//             fetch('../knft/getLastWeek.php', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' }
//             })
//         ]);
        
//         const customerData = await customerResponse.json();
//         const weekData = await weekResponse.json();
//         console.log(customerData);
//         const details = customerData.details;
//         if (details) {
//             cId = details.customerID;
//             custID = cId;
//             cRoute = details.routeID;
//             document.querySelector("#name").innerText = details.customerName;
//             document.querySelector("#phone").innerText = details.contact;
//             document.querySelector("#address").innerText = details.address;
//             document.querySelector("#route").innerText = details.routeID+"-"+details.routeName;
//         }
//         if (weekData[0]) {
//             weekId = weekData[0].weekID;
//             document.querySelector("#week").innerText = weekData[0].weekdate;
//         }
//         // document.querySelector("#date").innerText = currentDateTime;
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }

// let prodData = [];
// let prodlist = [];
// let purchasedItems = {};

// async function fetchInventory() {
//     try {
//         const response = await fetch('../knft/getTempInv.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }});
//         if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
//         const data = await response.json();
//         if (data.data) prodData = data.data;
//     } catch (error) {
//         console.error('Error fetching inventory:', error.message);
//     }
// }

// async function fetchProductList() {
//     try {
//         const response = await fetch('../knft/getProduct.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }});
//         if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
//         const data = await response.json();
//         if (data.data) prodlist = data.data;
//     } catch (error) {
//         console.error('Error fetching product list:', error.message);
//     }
// }

// function deleteRow(week_id, customer_id, product_id) {
//     fetch("../knft/deleteOrder.php", {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: `week_id=${week_id}&customer_id=${customer_id}&product_id=${product_id}`
//     })
//     .then(response => response.json())
//     .then(data => alert(data.success ? "Row deleted successfully!" : "Error: " + data.message))
//     .catch(error => console.error("Error:", error));
// }
// function deleteRow2(week_id, customer_id, product_id, id) {
//     fetch("../knft/deleteOrder2.php", {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: `week_id=${week_id}&customer_id=${customer_id}&product_id=${product_id}&id=${id}`
//     })
//     .then(response => response.json())
//     .then(data => alert(data.success ? "Row deleted successfully!" : "Error: " + data.message))
//     .catch(error => console.error("Error:", error));
// }
// function renderMenu() {
//     const tbody = document.querySelector('tbody');
//     tbody.innerHTML = '';
    
//     prodData.forEach(product => {
//         const productId = product.product_id;
//         const productName = prodlist[productId - 1]?.product || "Unknown";
//         const productPrice = product.price;
//         const availableQuantity = product.quantity;
//         const purchasedQuantity = purchasedItems[productId] || 0;
        
//         tbody.innerHTML += `
//             <tr>
//                 <th scope="row">${productName}</th>
//                 <td><p class="price" id="p${productId}">Rs.${productPrice}/unit</p><p>Available: <b >${availableQuantity}</b></p></td>
//                 <td><input type="number" id="q${productId}" value="${purchasedQuantity}"></td>
//                 <td>
//                     <button class="btn btn-success btn-sm purchaseButton" id="${productId}" ${(availableQuantity <= 0) ? "disabled" : ""}>+ Purchase</button>
//                 </td>
//             </tr>`;
//     });
//     attachPurchaseEventListeners();
// }

// async function loadMenu() {
//     await fetchProductList();
//     await fetchInventory();
//     await renderMenu();
    
//     await fetchOrders(weekId, custID);
// }

// async function sendPurchaseData(productId, quantity) {
//     await fetch('../knft/removeQuantity.php', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ product_id: productId, quantity })
//     });
// }

// async function insertData(productId, quantity, price) {
//     await fetch('../knft/submitOrder.php', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//             week_id: weekId,
//             customer_id: cId,
//             product_id: productId,
//             quantity,
//             routeId: cRoute,
//             // date_time: currentDateTime,
//             price,
//             total: price * quantity,
//         })
//     });
// }

// async function fetchOrders(week_id, customer_id) {
//     try {
//         const response = await fetch('../knft/getOrderCustomer.php', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ customer_id: 5, week_id: 10 })
//         });

//         const text = await response.text(); // Debugging
//         console.log("Raw Response:", text);

//         const data = JSON.parse(text); // Convert response to JSON

//         if (data.error) {
//             document.getElementById('order-result').innerHTML = `<p class="text-danger">${data.error}</p>`;
//             return;
//         }

//         // renderOrders(data);
//     } catch (error) {
//         console.error('Error fetching orders:', error);
//         document.getElementById('order-result').innerHTML = `<p class="text-danger">Failed to fetch orders</p>`;
//     }
// }

// // Function to render the cart
// function renderCart() {
//     const cartBody = document.querySelector('.cart-body');
//     cartBody.innerHTML = ''; // Clear previous data

//     if (Object.keys(purchasedItems).length === 0) {
//         cartBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Your cart is empty</td></tr>`;
//         return;
//     }

//     Object.entries(purchasedItems).forEach(([productId, item]) => {
//         const product = prodlist[productId - 1] || { product: "Unknown", category: "Unknown" }; // Match product

//         const row = document.createElement('tr');
//         row.innerHTML = `
//             <td>${product.product}</td>
//             <td>${product.category_id}</td>
//             <td>Rs.${item.price.toFixed(2)}</td>
//             <td>${item.quantity}</td>
//             <td>
//                 <button class="btn btn-danger btn-sm deleteButton" data-id="${productId}">Delete</button>
//             </td>
//         `;

//         cartBody.appendChild(row);
//     });

//     attachDeleteEventListeners();
// }

// // Function to handle deleting a product from the cart
// function deleteFromCart(productId) {
//     delete purchasedItems[productId]; // Remove the product from the cart
//     renderCart(); // Re-render the cart
// }

// // Attach event listeners to "Delete" buttons in the cart
// function attachDeleteEventListeners() {
//     document.querySelectorAll('.deleteButton').forEach(button => {
//         button.addEventListener('click', (e) => {
//             const productId = e.currentTarget.getAttribute('data-id');
//             deleteFromCart(productId);
//         });
//     });
// }

// // Attach event listeners to "Purchase" buttons in the product menu
// function attachPurchaseEventListeners() {
//     document.querySelectorAll('.purchaseButton').forEach(button => {
//         button.addEventListener('click', async (e) => {
//             const productId = e.currentTarget.id;
//             const quantityInput = document.querySelector(`#q${productId}`);
//             const quantity = parseInt(quantityInput.value, 10);
//             const price = parseFloat(document.querySelector(`#p${productId}`).textContent.replace('Rs.', '').split('/')[0]);
//             const availableElem = document.querySelector(`#ava${productId}`);
//             const availableQuantity = availableElem ? parseInt(availableElem.innerText, 10) : 0;
//             if (quantity > 0 && quantity <= availableQuantity) {
//                 // Add product to the cart
//                 purchasedItems[productId] = { quantity, price };

//                 // Update the cart UI
//                 // Optionally, send data to the server
//                 await sendPurchaseData(productId, quantity);
//                 await insertData(productId, quantity, price);
//                 renderCart();
//             } else {
//                 alert('Quantity cannot be less than 0 or greter than available');
//                 quantityInput.value = 0; // Reset to 0 if invalid
//             }
//         });
//     });
// }

// // Attach event listener to "Place Your Order" button
// document.getElementById('placeOrderButton').addEventListener('click', async () => {
//     if (Object.keys(purchasedItems).length === 0) {
//         alert('Your cart is empty. Please add items to the cart before placing an order.');
//         return;
//     }

//     try {
//         // Prepare the data to send
//         const orderData = {
//             week_id: weekId,
//             customer_id: cId,
//             routeId: cRoute,
//             // date_time: currentDateTime,
//             items: Object.entries(purchasedItems).map(([productId, item]) => ({
//                 product_id: productId,
//                 quantity: item.quantity,
//                 price: item.price,
//                 total: item.quantity * item.price
//             }))
//         };

//         // Send the data to submitOrder.php
//         const response = await fetch('../knft/submitOrder.php', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(orderData)
//         });

//         const result = await response.text(); // Get the response as text
//         alert(result); // Show success or error message

//         if (result.includes('Data inserted successfully')) {
//             // Update available quantities
//             Object.entries(purchasedItems).forEach(([productId, item]) => {
//                 const product = prodData.find(p => p.product_id == productId);
//                 if (product) {
//                     product.quantity -= item.quantity; // Reduce available quantity
//                 }
//             });

//             // Clear the cart after successful order placement
//             purchasedItems = {};
//             renderCart();
//             // Re-render the menu to reflect updated quantities
//         }
//         loadMenu(); 
//     } catch (error) {
//         console.error('Error placing order:', error);
//         alert('An error occurred while placing your order. Please try again.');
//     }
// });