//create a new `Date` object
const now = new Date();

// get the current date and time as a string
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

function runNextProgram(email) {

let cName = ".";
let cId = 0;
let weekId = 0;
let cPhone = 0;
let cAddress = ".";
let cRoute = ".";
let products = {};
// Select the anchor element
const anchor = document.getElementById('myAnchor');
anchor.innerHTML+=`<a class="btn btn-success btn-sm proceed" href="http://localhost/knf/consumer/cart.html">Proceed To Checkout</a>`;

document.addEventListener('DOMContentLoaded', function() {
        fetch('../KNFT/getCustomer2.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.details);
            const details = data.details;
            cName = details.customerName;
            cId = details.customerID;
            cAddress = details.address;
            cPhone = details.contact;
            cRoute = details.routeID;

            document.querySelector("#name").innerText = cName;
            document.querySelector("#phone").innerText = cPhone;
            document.querySelector("#address").innerText = cAddress;
            document.querySelector("#route").innerText = cRoute;
            document.querySelector("#date").innerText = currentDateTime;
            console.log(`Name: ${cName}, ID: ${cId}, Address: ${cAddress}, Phone: ${cPhone}`);
        })
        .catch(error => console.error('Error:', error));

        fetch('../knft/getLastWeek.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            weekId = data[0].weekID;

            document.querySelector("#week").innerText = weekId;
            console.log(`week: ${weekId}`);
        })
        .catch(error => console.error('Error:', error));
});

//------------------
const tbody = document.querySelector("tbody");
fetch('../knft/getInv.php')
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error:', data.error);
        } else {
            for(let i = 0;i<data.data.length;i++){
                tbody.innerHTML+= `
            <tr>
              <th scope="row"><P>${data.data[i].product_name}</P><p>#00${data.data[i].product_id}</p></th>
              <td>Rs.${data.data[i].price}/nos}<p>available: ${data.data[i].quantity}</p></td>
              <td><input type="number" name="QUANTITY" id="quan"></td>
              <td><button class="btn btn-success btn-sm">+</button></td>
            </tr>`
            }
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });

// Adding event listeners to category buttons
document.querySelectorAll('.category-btn').forEach(button => {
    button.addEventListener('click', function(event) {
        event.preventDefault(); // Prevent default anchor behavior (page reload)
        const categoryId = this.getAttribute('data-category'); // Get the selected category
        filterByCategory(categoryId); // Call the filtering function
    });
});

// Function to filter by category and display products
function filterByCategory(categoryId) {
    const filteredProducts = inventoryData.filter(product => product.category_id === categoryId);
    displayProducts(filteredProducts);
}


fetch('../knft/submitTempINV.php', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(products), // products: array of product objects
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));



document.addEventListener('DOMContentLoaded', () => {
    const products = [
        "Tender Coconut", "Small Onion", "Papaya (Unripe-For Poriyal)", "Ridge Gourd",
        "White Radish", "Beetroot", "Bitter Gourd", "Cluster beans", "Bottle Gourd Naadu",
        "Cabbage", "Cauliflower", "Ash Gourd", "Naadu Ladyfinger", "Coconut", "Brinjal",
        "Pumpkin", "Karpuravalli (Then Vazhai)", "Kathali", "Papaya", "Elakki Banana",
        "Curry Leaves", "Drumstick Leaves", "Thavasi keerai (Multi Vitamin)", "Agathi keerai",
        "Maayan Keerai", "Pandan leaves", "Lemon grass (fresh)", "Small Ponnanganni Keerai",
        "Red Pulicha keerai", "Green Pulicha keerai", "Ceylon Pasalai Keerai", "Palak Keerai",
        "Red thandu keerai", "Coriander", "Banana flower", "VallaKeerai", "Kanavalai keerai",
        "Dried Lemongrass", "Multipurpose Turmeric powder", "Mondhan Banana powder", "All spices leaves",
        "Cinnamon leaves dried", "Fresh Soursop Leaves", "Mondhan Banana", "Butter", "Green Chilli",
        "Coconut Oil 1litre", "Coconut Oil 1/2litre", "Drumstick", "Sundakkai"
    ];

    const productList = document.getElementById('productList');

    // Populate product list
    products.forEach(product => {
        const productRow = document.createElement('div');
        productRow.className = 'row align-items-center mb-3';

        productRow.innerHTML = `
            <div class="col-sm-6">
                <div class="form-check">
                    <input class="form-check-input product-checkbox" type="checkbox" id="${product}" data-product="${product}">
                    <label class="form-check-label" for="${product}">${product}</label>
                </div>
            </div>
            <div class="col-sm-6">
                <input type="number" class="form-control product-quantity" id="${product}-quantity" 
                    data-product="${product}" min="0" max="5" step="1" disabled>
            </div>
        `;

        productList.appendChild(productRow);
    });

    // Enable/disable quantity input based on checkbox state
    document.querySelectorAll('.product-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const quantityInput = document.getElementById(`${event.target.dataset.product}-quantity`);
            quantityInput.disabled = !event.target.checked;
            if (!event.target.checked) quantityInput.value = ''; // Clear value if unchecked
        });
    });

    // Handle form submission
    document.getElementById('orderForm').addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('name').value();
        const contact = document.getElementById('contact').value();
        const route = document.getElementById('route').value();
        const order = {};

        // Gather selected products with quantities
        document.querySelectorAll('.product-checkbox').forEach(checkbox => {
            if (checkbox.checked) {
                const product = checkbox.dataset.product;
                const quantity = parseInt(document.getElementById(`${product}-quantity`).value) || 0;
                order[product] = quantity;
            }
        });

        if (Object.keys(order).length === 0) {
            alert("Please select at least one product to proceed!");
            return;
        }

        const data = {
            name,
            contact,
            route,
            order
        };

        // Send data to submitorder.php
        try {
            const response = await fetch('../knft/submitorder.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (result.success) {
                alert('Order submitted successfully!');
                location.reload();
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit the order. Please try again.');
        }
    });
});
}