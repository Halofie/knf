const now = new Date();

const currentDateTime = now.toLocaleString();
async function fetchEmailAndRunProgram() {
    try {
        // Fetch data from returnE.php
        const response = await fetch('../knft/returnE.php'); // Ensure this path is correct
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse JSON from response
        const data = await response.json();
        console.log("Response data:", data);

        // Safely access the email property
        const email = data?.email; // Optional chaining to handle undefined data

        if (!email) {
            console.warn("Email is null or undefined. Redirecting...");
            window.location.href = '../home.html'; // Redirect if email is missing
            return;
        }

        console.log("User's session email:", email);

        // Continue program logic here
        runNextProgram(email);

    } catch (error) {
        console.error('Error fetching session email:', error);
    }
}
fetchEmailAndRunProgram();



let cName = ".";
let cId = 0;
let weekId = 0;
let weekdate = ".";
let cPhone = 0;
let cAddress = ".";
let cRoute = ".";
let cartItems = [];
let prodlist = [];

function runNextProgram(email) {
async function main_block() {
    try {
        // Step-by-step sequential execution
        await renderCustomer(email);
        await fetchWeekData();
        await fetchProductList();
        await loadmenu();
    } catch (error) {
        console.error('Error during initialization:', error);
    }
};
}
main_block();
console.log(email);

async function fetchProductList() {
    try {
        const response = await fetch('../knft/getProduct.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
            prodlist = data.data;
        } else {
            console.warn('No valid product list found.');
        }
    } catch (error) {
        console.error('Error fetching product list:', error);
    }
}

async function renderCustomer(email) {
    try {
                const customerResponse = await fetch('../knft/getCustomer2.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email: email })
                });
                const customerData = await customerResponse.json();
                console.log(customerData.details);
                const details = customerData.details;
                let cName = details.customerName;
                let cId = details.customerID;
                let cAddress = details.address;
                let cPhone = details.contact;
                let cRoute = details.routeID;
        
                document.querySelector("#name").innerText = cName;
                document.querySelector("#phone").innerText = cPhone;
                document.querySelector("#address").innerText = cAddress;
                document.querySelector("#route").innerText = cRoute;
                document.querySelector("#date").innerText = currentDateTime;
                console.log(`Name: ${cName}, ID: ${cId}, Address: ${cAddress}, Phone: ${cPhone}`);
            } catch (error) {
                console.error('Error:', error);
            }
        
            try {
                const weekResponse = await fetch('http://localhost/knft/getLastWeek.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const weekData = await weekResponse.json();
                weekId = weekData[0].weekID;
        
                document.querySelector("#week").innerText = weekId;
                console.log(`week: ${weekId}`);
            } catch (error) {
                console.error('Error:', error);
            }
};


async function fetchWeekData() {
    try {
        const weekResponse = await fetch('../knft/getLastWeek.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const weekData = await weekResponse.json();
        weekId = weekData[0].weekID;

        console.log(`Week: ${weekId}`);
    } catch (error) {
        console.error('Error fetching week data:', error);
    }
}

async function loadmenu() {
    try {
        const response = await fetch('../knft/getOrder.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ customer_id: cId })
        });

        const data = await response.json();
        if (data.error) {
            console.error('Error:', data.error);
        } else {
            cartItems = data.data;
            loadCartItems();
        }
    } catch (error) {
        console.error('Error fetching menu/cart data:', error);
    }
}

function loadCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalpriceline = document.getElementById('total');
    cartItemsContainer.innerHTML = '';
    let totalPrice = 0;

    cartItems.forEach(item => {
        cartItemsContainer.innerHTML += `<tr>
            <th scope="row">${prodlist[(item.product_id) - 1]?.product || 'Unknown'}</th>
            <td>${item.product_id}</td>
            <td>${item.quantity}</td>
            <td>${item.rate}</td>
            <td>${item.total_cost}</td>
        </tr>`;
        totalPrice += item.total_cost;
    });

    totalpriceline.innerText = totalPrice;
}

function removeFromCart(productId) {
    const index = cartItems.findIndex(item => item.product_id === productId);
    if (index > -1) {
        cartItems.splice(index, 1);
        loadCartItems();
    }
}



//{// const now = new Date();

// // get the current date and time as a string
// const currentDateTime = now.toLocaleString();

// let params = new URLSearchParams(location.search);
// email=params.get('email');

// let cName = ".";
// let cId = 0;
// let weekId = 0;
// let cPhone = 0;
// let cAddress = ".";
// let cRoute = ".";
// let products = {};

// document.addEventListener('DOMContentLoaded', async function() {
//     try {
//         const customerResponse = await fetch('http://localhost/knft/getCustomer2.php', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ email: email })
//         });
//         const customerData = await customerResponse.json();
//         console.log(customerData.details);
//         const details = customerData.details;
//         cName = details.customerName;
//         cId = details.customerID;
//         cAddress = details.address;
//         cPhone = details.contact;
//         cRoute = details.routeID;

//         document.querySelector("#name").innerText = cName;
//         document.querySelector("#phone").innerText = cPhone;
//         document.querySelector("#address").innerText = cAddress;
//         document.querySelector("#route").innerText = cRoute;
//         document.querySelector("#date").innerText = currentDateTime;
//         console.log(`Name: ${cName}, ID: ${cId}, Address: ${cAddress}, Phone: ${cPhone}`);
//     } catch (error) {
//         console.error('Error:', error);
//     }

//     try {
//         const weekResponse = await fetch('http://localhost/knft/getLastWeek.php', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         });
//         const weekData = await weekResponse.json();
//         weekId = weekData[0].weekID;

//         document.querySelector("#week").innerText = weekId;
//         console.log(`week: ${weekId}`);
//     } catch (error) {
//         console.error('Error:', error);
//     }
// });





// function loadCartItems() {
    
//     const cartItemsContainer = document.getElementById('cart-items');
//     const totalpriceline = document.getElementById('total');
//     cartItemsContainer.innerHTML = '';
//     console.log(cartItems);
//     let totalPrice = 0;

//     cartItems.forEach(item => {
//         cartItemsContainer.innerHTML+=`<tr>
//             <th scope="row">${item.product_name}</th>
//             <td>${item.product_id}</td>
//             <td>${item.quantity}</td>
//             <td>${item.rate_per_piece}</td>
//             <td>${item.total_cost_piece}</td>
//         </tr>`;

//         totalPrice += item.total_cost_piece;

//     });
//     totalpriceline.innerText=totalPrice;
//     // Display the total price
// }


// async function loadmenu(purchasedItems = {}) {
//     try {
//         const response = await fetch('http://localhost/knft/getOrder.php', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({ customer_id: cId })  //problem in week id 
//         });
//         const data = await response.json();

//         if (data.error) {
//             console.error('Error:', data.error);
//         } else {
//             cartItems = data.data;
//             console.log(cartItems);
//             loadCartItems();

//         }
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }
// loadmenu();


// // function populateUserDetails() {
// //     const userDetails = JSON.parse(localStorage.getItem('userDetails'));                           //just y?

// //     if (userDetails) {
// //         document.getElementById('userName').value = userDetails.name;
// //         document.getElementById('userContact').value = userDetails.contact;
// //         document.getElementById('userAddress').value = userDetails.address;
// //         document.getElementById('userEmail').value = userDetails.email;
// //     } else {
// //         alert('No user details found. Please register.');
// //         window.location.href = 'registration.html';
// //     }
// // }

// // function placeOrder() {                                                                             //not-needed
// //     const vanDelivery = document.querySelector('input[name="van-delivery"]:checked');
// //     const deliveryAddress = document.querySelector('.delivery-options input[type="text"]').value;

// //     if (vanDelivery) {
// //         alert(`Order placed with van delivery: ${vanDelivery.value} and delivery address: ${deliveryAddress}`);
// //     } else {
// //         alert("Please select a van delivery option.");
// //     }
// // }

// function removeFromCart(productId) {
//     // Remove item from cartItems array
//     const index = cartItems.findIndex(item => item.product_id === productId);
//     if (index > -1) {
//         cartItems.splice(index, 1);
//         loadCartItems(); // Reload cart items
//     }
// }

// // function displayCurrentDate() {                                       //done-before itself
// //     const now = new Date();
// //     const date = now.toLocaleDateString();
// //     const time = now.toLocaleTimeString();
// //     document.getElementById('date-time').innerText = `${date} ${time}`;
// // }
