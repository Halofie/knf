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
    document.getElementById('myAnchor').innerHTML += `<a class="btn btn-success btn-sm proceed" href="../consumer/cart.html">Proceed To Checkout</a>`;
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
async function renderMenu() {
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
                    <button class="btn btn-danger btn-sm" onclick="deleteRow(${weekId}, ${custID}, ${productId})">DELETE</button>
                </td>
            </tr>`;
    });
    attachPurchaseEventListeners();
}

function attachPurchaseEventListeners() {
    document.querySelectorAll('.purchaseButton').forEach(button => {
        button.addEventListener('click', async (e) => {
            const productId = e.currentTarget.id;
            const purchased = parseInt(document.querySelector(`#q${productId}`).value, 10);
            const price = parseFloat(document.querySelector(`#p${productId}`).textContent.replace('Rs.', '').split('/')[0]);
            
            purchasedItems[productId] = purchased;
            await sendPurchaseData(productId, purchased);
            await insertData(productId, purchased, price);
            await loadMenu();
        });
    });
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

function renderOrders(orders) {
    const orderBody = document.querySelector('.order-body');
    orderBody.innerHTML = ''; // Clear previous data

    if (orders.length === 0) {
        orderBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No orders found</td></tr>`;
        return;
    }

    orders.forEach(order => {
        console.log(prodlist);
        const product = prodlist[order.product_id -1] || { name: "Unknown", category: "Unknown" }; // Match product

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.product}</td>
            <td>${product.category_id}</td>
            <td>$${order.rate.toFixed(2)}</td>
            <td>${order.quantity}</td>
            <td><button class="btn btn-danger btn-sm" onclick="removeOrder(this,${order.product_id} ,${order.id})">Remove</button></td>
        `;

        orderBody.appendChild(row);
    });
}

function removeOrder(button, productId, id) {
    button.closest('tr').remove(); // Remove row from UI
    deleteRow(weekId, custID,productId,id)
}











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
