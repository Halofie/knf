const now = new Date();
const currentDateTime = now.toLocaleString();
let custID = 0;
let weekId = 0;
let cRoute = "";
let cId = 0;

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

async function main_load(email) {
    try {
        const [customerResponse, weekResponse] = await Promise.all([
            fetch('../knft/getCustomer2.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            }),
            fetch('../knft/getLastWeek.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
        ]);
        
        const customerData = await customerResponse.json();
        const weekData = await weekResponse.json();
        console.log(customerData);
        const details = customerData.details;
        if (details) {
            cId = details.customerID;
            custID = cId;
            cRoute = details.routeName;
            document.querySelector("#name").innerText = details.customerName;
            document.querySelector("#phone").innerText = details.contact;
            document.querySelector("#address").innerText = details.address;
            document.querySelector("#route").innerText = details.routeName;
        }
        if (weekData[0]) {
            weekId = weekData[0].weekID;
            document.querySelector("#week").innerText = weekData[0].weekdate;
        }
        document.querySelector("#date").innerText = currentDateTime;
    } catch (error) {
        console.error('Error:', error);
    }
}

let prodData = [];
let prodlist = [];
let purchasedItems = {};

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
        if (data.data) prodlist = data.data;
    } catch (error) {
        console.error('Error fetching product list:', error.message);
    }
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
function renderMenu() {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = '';
    
    prodData.forEach(product => {
        const productId = product.product_id;
        const productName = prodlist[productId - 1]?.product || "Unknown";
        const productPrice = product.price;
        const availableQuantity = product.quantity;
        const purchasedQuantity = purchasedItems[productId] || 0;
        
        tbody.innerHTML += `
            <tr>
                <th scope="row">${productName}</th>
                <td><p class="price" id="p${productId}">Rs.${productPrice}/unit</p><p>Available: ${availableQuantity}</p></td>
                <td><input type="number" id="q${productId}" value="${purchasedQuantity}"></td>
                <td>
                    <button class="btn btn-success btn-sm purchaseButton" id="${productId}" ${(availableQuantity) ? "" : "disabled"}>+ Purchase</button>
                </td>
            </tr>`;
    });
    attachPurchaseEventListeners();
}

async function loadMenu() {
    await fetchProductList();
    await fetchInventory();
    await renderMenu();
    
    await fetchOrders(weekId, custID);
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
            date_time: currentDateTime,
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

        renderOrders(data);
    } catch (error) {
        console.error('Error fetching orders:', error);
        document.getElementById('order-result').innerHTML = `<p class="text-danger">Failed to fetch orders</p>`;
    }
}

// Function to render the cart
function renderCart() {
    const cartBody = document.querySelector('.cart-body');
    cartBody.innerHTML = ''; // Clear previous data

    if (Object.keys(purchasedItems).length === 0) {
        cartBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">Your cart is empty</td></tr>`;
        return;
    }

    Object.entries(purchasedItems).forEach(([productId, item]) => {
        const product = prodlist[productId - 1] || { product: "Unknown", category: "Unknown" }; // Match product

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.product}</td>
            <td>${product.category_id}</td>
            <td>Rs.${item.price.toFixed(2)}</td>
            <td>${item.quantity}</td>
            <td>
                <button class="btn btn-danger btn-sm deleteButton" data-id="${productId}">Delete</button>
            </td>
        `;

        cartBody.appendChild(row);
    });

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

            if (quantity > 0) {
                // Add product to the cart
                purchasedItems[productId] = { quantity, price };

                // Update the cart UI
                renderCart();

                // Optionally, send data to the server
                await sendPurchaseData(productId, quantity);
                await insertData(productId, quantity, price);
            } else {
                alert('Quantity cannot be less than 0.');
                quantityInput.value = 0; // Reset to 0 if invalid
            }
        });
    });
}

// Attach event listener to "Place Your Order" button
document.getElementById('placeOrderButton').addEventListener('click', async () => {
    if (Object.keys(purchasedItems).length === 0) {
        alert('Your cart is empty. Please add items to the cart before placing an order.');
        return;
    }

    try {
        // Prepare the data to send
        const orderData = {
            week_id: weekId,
            customer_id: cId,
            routeId: cRoute,
            date_time: currentDateTime,
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

        const result = await response.text(); // Get the response as text
        alert(result); // Show success or error message

        if (result.includes('Data inserted successfully')) {
            // Update available quantities
            Object.entries(purchasedItems).forEach(([productId, item]) => {
                const product = prodData.find(p => p.product_id == productId);
                if (product) {
                    product.quantity -= item.quantity; // Reduce available quantity
                }
            });

            // Clear the cart after successful order placement
            purchasedItems = {};
            renderCart();
            // Re-render the menu to reflect updated quantities
        }
        renderMenu(); 
    } catch (error) {
        console.error('Error placing order:', error);
        alert('An error occurred while placing your order. Please try again.');
    }
});









// const now = new Date();
// //hello
// // get the current date and time as a string
// const currentDateTime = now.toLocaleString();
// let custID = 0;
// let weekId = 0;
// async function fetchEmailAndRunProgram() {
//     try {
//         // Fetch data from returnE.php
//         const response = await fetch('../knft/returnE.php'); // Ensure this path is correct
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }

//         // Parse JSON from response
//         const data = await response.json();
//         console.log("Response data:", data);

//         // Safely access the email property
//         const email = data?.email; // Optional chaining to handle undefined data

//         if (!email) {
//             console.warn("Email is null or undefined. Redirecting...");
//             window.location.href = '../home.html'; // Redirect if email is missing
//             return;
//         }

//         console.log("User's session email:", email);

//         // Continue program logic here
//         runNextProgram(email);

//     } catch (error) {
//         console.error('Error fetching session email:', error);
//     }
// }
// fetchEmailAndRunProgram();

// async function runNextProgram(email){
// // Select the anchor element
// const anchor = document.getElementById('myAnchor');
// anchor.innerHTML+=`<a class="btn btn-success btn-sm proceed" href="../consumer/cart.html">Proceed To Checkout</a>`;

// // let cName = ".";
// // let cId = 0;
// // let weekId = 0;
// // let weekdate = ".";
// // let cPhone = 0;
// // let cAddress = ".";
// // let cRoute = ".";
// main_load(email);
// loadMenu();

// };
// async function main_load(email) {
//     try {
//         const customerResponse = await fetch('../knft/getCustomer2.php', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ email: email })
        
        
//         });
//         const weekResponse = await fetch('../knft/getLastWeek.php', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
//         const weekData = await weekResponse.json();
//         const customerData = await customerResponse.json();
//         const details = customerData.details;
//         let cName = details.customerName;
//         let cId = details.customerID;
//         let cAddress = details.address;
//         let cPhone = details.contact;
//         let cRoute = details.routeName;
//         let weekdate = weekData[0].weekdate;
//         custID=cId;
//         document.querySelector("#name").innerText = cName;
//         document.querySelector("#phone").innerText = cPhone;
//         document.querySelector("#address").innerText = cAddress;
//         document.querySelector("#route").innerText = cRoute;
//         document.querySelector("#week").innerText = weekdate;
//         document.querySelector("#date").innerText = currentDateTime;
//     } catch (error) {
//         console.error('Error:', error);
//     }

//     try {
//         const weekResponse = await fetch('../knft/getLastWeek.php', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
//         const weekData = await weekResponse.json();
//         weekId = weekData[0].weekID;
//     } catch (error) {
//         console.error('Error:', error);
//     }
// };

// // Global variables
// let prodData = [];
// let products = {};
// let purchasedItems = {};
// let prodlist = [];

// // Fetch inventory and populate `prodData`
// function fetchInventory() {
//     return fetch('../knft/getTempInv.php', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     })
//         .then((response) => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then((data) => {
//             if (data.error) {
//                 throw new Error(data.error);
//             } else if (data.data && Array.isArray(data.data)) {
//                 prodData = data.data;
//                 // console.log('Product data fetched successfully:', prodData);
//             } else {
//                 console.warn('No valid data found in the response.');
//             }
//         })
//         .catch((error) => {
//             console.error('Error fetching inventory:', error.message);
//         });
// }

// function fetchproductlist() {
//     return fetch('../knft/getProduct.php', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//         },
//     })
//         .then((response) => {
//             if (!response.ok) {
//                 throw new Error(`HTTP error! Status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then((data) => {
//             if (data.error) {
//                 throw new Error(data.error);
//             } else if (data.data && Array.isArray(data.data)) {
//                 prodlist = data.data;
//                 // console.log('Product data fetched successfully:', prodlist);
//             } else {
//                 console.warn('No valid data found in the response.');
//             }
//         })
//         .catch((error) => {
//             console.error('Error fetching inventory:', error.message);
//         });
// }

// function deleteRow(week_id, customer_id, product_id) {
//     fetch("delete.php", {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/x-www-form-urlencoded"
//         },
//         body: `week_id=${week_id}&customer_id=${customer_id}&product_id=${product_id}`
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             alert("Row deleted successfully!");
//         } else {
//             alert("Error: " + data.message);
//         }
//     })
//     .catch(error => console.error("Error:", error));
// }

// // Render the product menu
// function renderMenu(purchasedItems = {}) {
//     const tbody = document.querySelector('tbody');
//     tbody.innerHTML = ''; // Clear existing rows

//     prodData.forEach((product) => {
//         const productId = product.product_id;
//         const productName = prodlist[product.product_id-1].product;
//         const productPrice = product.price;
//         const availableQuantity = product.quantity;
//         const purchasedQuantity = purchasedItems[productId] || 0;

//         // Disable purchase button if product is already purchased
//         const isDisabled = purchasedQuantity > 0 ? 'disabled' : '';

//         // Add the product to the table
//         tbody.innerHTML += `
//             <tr>
//                 <th scope="row">${productName}</th>
//                 <td>
//                     <p class="price" id="p${productId}">Rs.${productPrice}/unit</p>
//                     <p>Available: ${availableQuantity}</p>
//                 </td>
//                 <td class="quantity-input">
//                     <input type="number" id="q${productId}" value="${purchasedQuantity}" ${isDisabled}>
//                 </td>
//                 <td>
//                     <button class="btn btn-success btn-sm purchaseButton" id="${productId}" ${isDisabled}>+ Purchase</button>
//                     <button class="btn btn-danger btn-sm purchaseButton" onclick="deleteRow(${weekId}, ${custID}, ${productId})" id="${productId}" ${isDisabled}>DELETE</button>

//                 </td>
//             </tr>`;
//     });

//     // Attach event listeners to the purchase buttons
//     attachPurchaseEventListeners();
// }

// // Attach event listeners to purchase buttons
// function attachPurchaseEventListeners() {
//     const buttons = document.querySelectorAll('.purchaseButton');
//     buttons.forEach((button) => {
//         button.addEventListener('click', async (e) => {
//             const productId = e.currentTarget.id;
//             const purchased = parseInt(document.querySelector(`#q${productId}`).value, 10);
//             const price = parseFloat(document.querySelector(`#p${productId}`).textContent.replace('Rs.', '').split('/')[0]);

//             // Update purchased items
//             purchasedItems[productId] = purchased;

//             // Send data to the server and reload the menu
//             await sendPurchaseData(productId, purchased);
//             await insertData(productId, purchased, price);
//             await loadMenu(purchasedItems);
//         });
//     });
// }

// // Fetch and load menu data
// async function loadMenu(purchasedItems = {}) {
//     try {
//         await fetchInventory(); // Ensure prodData is populated
//         await fetchproductlist();
//         renderMenu(purchasedItems);
//     } catch (error) {
//         console.error('Error loading menu:', error);
//     }
// }


// // Send purchase data to the server
// async function sendPurchaseData(productId, quantity) {
//     try {
//         const response = await fetch('../knft/removeQuantity.php', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ product_id: productId, quantity: quantity }),
//         });

//         const result = await response.json();
//         console.log(result.message);
//     } catch (error) {
//         console.error('Error sending purchase data:', error);
//     }
// }

// // Insert data into the server
// async function insertData(productId, quantity, price) {
//     try {
//         const response = await fetch('../knft/submitOrder.php', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({
//                 week_id: weekId,
//                 customer_id: cId,
//                 product_id: productId,
//                 quantity: quantity,
//                 routeId: cRoute,
//                 date_time: currentDateTime,
//                 price: price,
//                 total: price * quantity,
//             }),
//         });

//         const result = await response.text(); // Get response as text
//         alert(result); // Display success or error message
//     } catch (error) {
//         alert('Error inserting data: ' + error.message);
//     }
// }

// // Category filtering
// function filterByCategory(categoryId) {
//     const filteredProducts = prodData.filter((product) => product.category_id == categoryId);
//     renderMenu(purchasedItems); // Render filtered menu
// }

// // Attach event listeners to category buttons
// document.querySelectorAll('.category-btn').forEach((button) => {
//     button.addEventListener('click', function (event) {
//         event.preventDefault(); // Prevent default anchor behavior (page reload)
//         const categoryId = this.getAttribute('data-category');
//         filterByCategory(categoryId);
//     });
// });

// // Run the script
