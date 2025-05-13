const now = new Date();
const currentDateTime = now.toLocaleString();

function displayMessage(selector, message, isSuccess) {
    const element = document.querySelector(selector);
    if (element) {
    element.textContent = message;
    element.className = `m-3 alert ${isSuccess ? 'alert-success' : 'alert-danger'}`;
    element.style.display = 'block';
    }
}

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

async function fetchSupplierDetails(email) {
  try {
    const response = await fetch('../knft/getSupplier2.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching supplier details:', error);
    return null;
  }
}

async function fetchLastWeek() {
  try {
    const response = await fetch('../knft/getLastWeek.php', { method: 'POST' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data[0]?.weekID || null;
  } catch (error) {
    console.error('Error fetching last week ID:', error);
    return null;
  }
}

async function fetchProducts() {
  try {
    const response = await fetch('../knft/getProduct.php', { method: 'POST' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return null;
  }
}

async function fetchWeeks() {
  try {
    const response = await fetch('../knft/getWeek.php', { method: 'POST' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching weeks:', error);
    return null;
  }
}

async function fetchHistory(farmerId, weekId) {
  fetch('../knft/getFarmerHistory.php', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ farmer_id: farmerId, weekid: weekId })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.error("Error:", data.error);
      return;
    }
    console.log("Products:", data);
    populateTable(data);
  })
  .catch(error => console.error("Fetch Error:", error));
}

async function deleteItem(id) {
  try {
    const formData = new FormData();
    formData.append("id", id);
    const response = await fetch("../knft/deleteInventory.php", {
      method: "POST",
      body: formData,
    });
      
      const result = await response.json();

      if (result.status === "success") {
          console.log("Item deleted successfully.");
          initialize();
      } else {
          console.error("Failed to delete item:", result.message);
      }
  } catch (error) {
    console.error("Error:", error);
  }
}

async function fillCurrentInv(farmerId, weekId) {
  fetch('../knft/getFarmerHistory.php', {
    method: 'POST',
    headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ farmer_id: farmerId, weekid: weekId })
  })
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.error("Error:", data.error);
      return;
    }
    console.log("Products:", data);
    populateTable2(data);
  })
  .catch(error => console.error("Fetch Error:", error));
}

function populateTable(products) {
    let tableBody = document.querySelector(".inventory-body");
    tableBody.innerHTML = ""; // Clear existing table data
    products.forEach(product => {
        let row = document.createElement("tr");
        row.innerHTML = `<td>${product.product_name}</td> <td>${product.category_id}</td> <td>₹${product.price}</td> <td>${product.quantity} ${product.unit_id}</td> <td>${product.datetime}</td>`;
        tableBody.appendChild(row);
    });
}
function populateTable2(products) {
    let tableBody = document.querySelector(".currentinventory-body");
    tableBody.innerHTML = ""; // Clear existing table data
    products.forEach(product => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${product.product_name}</td>
            <td>${product.category_id}</td>
            <td>₹${product.price}</td>
            <td>${product.quantity} ${product.unit_id}</td>
            <td><button class="remove-from-inv button-danger" id="${product.id}">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

async function initialize() {
    const email = await fetchEmail();
    if (!email) {
      window.location.href = '../home.html';
      return;
    }
    console.log("User's session email:", email);
    const supplierData = await fetchSupplierDetails(email);
    if (!supplierData) return;

    const details = supplierData.details;
    const fId = details.supplierID;
    const fName = details.supplierName;
    const fAddress = details.farmLocation;
    const fPhone = details.contact;

    console.log(supplierData);
    document.querySelector("#name").innerText = fName;
    document.querySelector("#phone").innerText = fPhone;
    document.querySelector("#address").innerText = fAddress;
    document.querySelector("#date").innerText = currentDateTime;

    const weekId = await fetchLastWeek();
    document.querySelector("#week").innerText = weekId;

    fetchHistory(fId, weekId);
    fillCurrentInv(fId, weekId);

    const productData = await fetchProducts();
    if (productData && productData.data) {
        const productBody = document.querySelector(".itmProduct");
        productBody.innerHTML = productData.data.map(
            p => `<option value="${p.prod_id}">${p.product}</option>`
        ).join('');
    }

    setupEventListeners(fId, weekId, productData);
}

document.addEventListener('DOMContentLoaded', loadWeekDropdown);
function setupEventListeners(fId, weekId, productData) {
    let tempInv = {};
    document.querySelector(".ADDPRODUCT").addEventListener('click', function () {
        const prodID = document.querySelector(".itmProduct").value;
        const prodName = document.querySelector(".itmProduct").selectedOptions[0].innerText;
        const prodQuantity = document.getElementById("itmQuantity").value;
        
        if (!prodID || !prodQuantity) return alert("INVALID ENTRY: Enter ID and quantity");
        
        const product = productData.data.find(p => p.prod_id == prodID);
        if (!product) return alert("Product not found");
        
        const { category_id: prodCat, price: rate, UoM_id: unitmeas } = product;
        tempInv[prodID] = { p_id: prodID, p_name: prodName, cat_id: prodCat, price: rate, quantity: prodQuantity, uom_id: unitmeas, week_id: weekId, farmer_Id: fId, DateTime: currentDateTime };
        
        document.querySelector('.items').innerHTML += 
        `<div class="item border py-1 m-3 constainer White h-auto" id="${prodID}top">
            <h4 class="m-2">${prodName} #${prodID}</h4>
            <div class="d-block container d-flex">
                <div class="col-10 d-flex">
                <div class="d-flex justify-content-center container d-none d-sm-block">
                    <table class="table table-success table-striped border">
                        <thead>
                          <tr>
                            <th scope="col">CATEGORY</th>
                            <th scope="col">QUANTITY</th>
                            <th scope="col">UNIT MEASURE</th>
                            <th scope="col">PRICE/unit</th>
                            <th scope="col">TOTAL</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th scope="row"><span id="ID${prodCat}">${prodCat}</span></th>
                            <td><span id="Quantity${prodID}">${prodQuantity}</span></td>
                            <td><span id="unitmeas${prodID}">${unitmeas}</span></td>
                            <td><span id="rate${prodID}">${rate}</span></td>
                            <td><span id="total${prodID}">${prodQuantity*rate}</span></td>
                          </tr>
                        </tbody>
                    </table>
                </div>
                    <div class="container text-center d-flex justify-content-center d-sm-none">
                      <table class="table table-success table-striped border ">
                        <tbody>
                          <tr>
                            <th scope="col">CATEGORY</th>
                            <th><span id="ID${prodCat}">${prodCat}</span></th>
                          </tr>
                          <tr>
                            <th scope="col">QUANTITY</th>
                            <th><span id="Quantity2${prodID}">${prodQuantity}</span></th>
                          </tr>
                          <tr>
                            <th scope="col">UNIT MEASURE</th>
                            <th><span id="unitmeas${prodID}">${unitmeas}</span></th>
                          </tr>
                          <tr>
                            <th scope="col">PRICE/unit</th>
                            <th><span id="rate${prodID}">${rate}</span></th>
                          </tr>
                          <tr>
                            <th scope="col">TOTAL</th>
                            <th><span id="total2${prodID}">${prodQuantity*rate}</span></th>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                </div>
                <div class="col-2 m-1 d-none d-sm-block container text-center">
                    <button type="button " class="col edit  mt-1 btn  btn-success" id="${prodID}">  EDIT  </button>
                    <button type="button " class="col del mt-1 btn  btn-danger" id="${prodID}">DELETE</button>
                </div>
            </div>
            <div class="col-2 m-1 d-sm-none d-inline container text-center">
                <button type="button " class="col edit mt-1 btn  btn-success" id="${prodID}">  EDIT  </button>
                <button type="button " class="col del mt-1 btn  btn-danger" id="${prodID}">DELETE</button>
            </div>
        </div>
        `;
    });

    document.querySelector(".items").addEventListener("click", (e) => {
        const id = e.target.id;
        if (e.target.classList.contains("del")) {
            document.getElementById(`${id}top`).remove();
            delete tempInv[id];
        }
        if (e.target.classList.contains("edit")) {
            const newVal = prompt("ENTER NEW QUANTITY:");
            tempInv[id].quantity = newVal;
            document.querySelector(`#Quantity${id}`).innerText = `${newVal}`;
            document.querySelector(`#Quantity2${id}`).innerText = `${newVal}`;
            document.querySelector(`#total${id}`).innerText = `${newVal * tempInv[id].price}`;
            document.querySelector(`#total2${id}`).innerText = `${newVal * tempInv[id].price}`;
        }
    });

    document.addEventListener("DOMContentLoaded", () => {
        document.querySelectorAll(".remove-from-inv").forEach(button => {
          button.addEventListener("click", async () => {
            const id = button.id; // Button's ID is the inventory item ID
            await deleteItem(id);
          });
        });
    });
      
    document.querySelector(".submission").addEventListener("click", async () => {
        try {
            const response = await fetch('../knft/submitINV.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tempInv)
            });
            const data = await response.json();
            console.log('Success:', data);
            fetchHistory(fId, weekId);
        } catch (error) {
            console.error('Error:', error);
        }
    });

    document.getElementById("weekForm").addEventListener("submit", function(event) {
        event.preventDefault(); 
        let selectedValue = document.getElementById("weekDropdown").value;
        if(selectedValue){
            fetchHistory(fId, selectedValue);
        }
    });
}

document.addEventListener('DOMContentLoaded', initialize);
    // Function to load week options in the dropdown
    async function loadWeekDropdown() {
    try {
    const response = await fetch('../knft/getWeek.php', { method: 'POST' });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const weeks = await response.json();
        const weekDropdown = document.getElementById('weekDropdown');
        weekDropdown.innerHTML = ""; // Clear existing options

        if (weeks.length > 0) {
            weeks.forEach(week => {
                const option = document.createElement('option');
                option.value = week.weekID;
                option.textContent = week.weekdate;
                weekDropdown.appendChild(option);
            });
        } else {
            weekDropdown.innerHTML = `<option value="">No weeks available</option>`;
        }
    } catch (error) {
        console.error('Error fetching week data:', error);
        document.getElementById('weekDropdown').innerHTML = `<option value="">Error loading weeks</option>`;
    }
}

// Function to initialize and update the clock
function initializeClock() {
    const dateElement = document.getElementById('date');
    if (!dateElement) return;
    function updateClock() {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString(); // Format: HH:MM:SS AM/PM
        const formattedDate = now.toLocaleDateString(); // Format: MM/DD/YYYY
        dateElement.textContent = `${formattedDate} ${formattedTime}`;
    }

    // Update the clock every second
    setInterval(updateClock, 1000);

    // Initial call to display the clock immediately
    updateClock();
}

// Call the clock initialization function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
initializeClock();
initialize(); // Ensure the rest of the page functionality is initialized
});