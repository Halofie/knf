const now = new Date();
const currentDateTime = now.toLocaleString();

function displayMessage(selector, message, isSuccess) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = message;
        element.className = `m-3 alert ${isSuccess ? 'alert-success' : 'alert-danger'}`;
        element.style.display = 'block';
    } else {
        console.warn("displayMessage: selector not found", selector);
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
        displayMessage('#currentinventory-result', 'Error loading supplier details.', false);
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
        displayMessage('#add-item-result', 'Error loading product list.', false);
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

// Combined function for fetching and populating inventory tables
async function fetchAndDisplayInventory(farmerId, weekId, tableSelector, addDeleteButton = false) {
    try {
        const response = await fetch('../knft/getFarmerHistory.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ farmer_id: farmerId, weekid: weekId })
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, Response: ${errorText}`);
        }
        const data = await response.json();

        if (data.error) { // Assuming PHP might send {error: "message"}
            console.error("Error fetching inventory:", data.error);
            displayMessage(tableSelector === ".inventory-body" ? '#inventory-result' : '#currentinventory-result', `Error: ${data.error}`, false);
            populateInventoryTableInternal(tableSelector, [], addDeleteButton); // Show empty
            return;
        }
        
        console.log(`Inventory for ${tableSelector} (Week: ${weekId}):`, data);
        populateInventoryTableInternal(tableSelector, data, addDeleteButton);

    } catch (error) {
        console.error(`Fetch Error for inventory (${tableSelector}):`, error);
        const resultDivId = tableSelector === ".inventory-body" ? '#inventory-result' : '#currentinventory-result';
        displayMessage(resultDivId, `Failed to load inventory. ${error.message || ''}`, false);
        populateInventoryTableInternal(tableSelector, [], addDeleteButton); // Show empty on fetch error
    }
}

// Internal helper to avoid code duplication for populating tables
function populateInventoryTableInternal(tableBodySelector, products, addDeleteButton) {
    const tableBody = document.querySelector(tableBodySelector);
    if (!tableBody) {
        console.error("populateInventoryTableInternal: table body not found", tableBodySelector);
        return;
    }
    tableBody.innerHTML = ""; // Clear existing table data

    if (!products || products.length === 0) {
        const colspan = addDeleteButton ? 5 : 5; // Number of columns
        tableBody.innerHTML = `<tr><td colspan="${colspan}" class="text-center">No inventory found.</td></tr>`;
        return;
    }

    products.forEach(product => {
        const row = document.createElement("tr");
        // Ensure property names match your PHP output
        row.innerHTML = `
            <td>${product.product_name || 'N/A'}</td>
            <td>${product.category_id || 'N/A'}</td>
            <td>₹${typeof product.price === 'number' ? product.price.toFixed(2) : (product.price || '0.00')}</td>
            <td>${product.quantity || '0'} ${product.unit_id || ''}</td>
            ${addDeleteButton ? 
                `<td><button class="btn btn-sm btn-danger remove-from-inv" data-inventory-id="${product.id}">Delete</button></td>` :
                `<td>${product.datetime || 'N/A'}</td>`
            }
        `;
        tableBody.appendChild(row);
    });
}


async function deleteInventoryItemAPI(inventoryId) { // Renamed to avoid conflict if any
    try {
        const formData = new FormData();
        formData.append("id", inventoryId);

        const response = await fetch("../knft/deleteInventory.php", {
            method: "POST",
            body: formData,
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText}`);
        }
        return await response.json(); // Expect {status: 'success/error', message: '...'}
    } catch (error) {
        console.error("Error in deleteInventoryItemAPI:", error);
        return { status: 'error', message: `Client-side error during delete: ${error.message}` };
    }
}

// async function fetchHistory(farmerId, weekId) {
//   fetch('../knft/getFarmerHistory.php', {
//       method: 'POST',
//       headers: {'Content-Type': 'application/json'},
//       body: JSON.stringify({ farmer_id: farmerId, weekid: weekId })
//   })
//   .then(response => response.json())
//   .then(data => {
//       if (data.error) {
//           console.error("Error:", data.error);
//           return;
//       }
//       console.log("Products:", data);
//       populateTable(data);
//   })
//   .catch(error => console.error("Fetch Error:", error));
// }
  
// async function fillCurrentInv(farmerId, weekId) {
//     fetch('../knft/getFarmerHistory.php', {
//         method: 'POST',
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify({ farmer_id: farmerId, weekid: weekId })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.error) {
//             console.error("Error:", data.error);
//             return;
//         }
//         console.log("Products:", data);
//         populateTable2(data);
//     })
//     .catch(error => console.error("Fetch Error:", error));
// }

// async function deleteItem(id) {
//     try {
//         const formData = new FormData();
//         formData.append("id", id);
    
//         const response = await fetch("../knft/deleteInventory.php", {
//             method: "POST",
//             body: formData,
//         });
        
//         const result = await response.json();
    
//         if (result.status === "success") {
//             console.log("Item deleted successfully.");
//             initialize();
//         } else {
//             console.error("Failed to delete item:", result.message);
//         }
//     } catch (error) {
//       console.error("Error:", error);
//     }
// }

// function populateTable(products) {
//   let tableBody = document.querySelector(".inventory-body");
//   tableBody.innerHTML = ""; // Clear existing table data

//   products.forEach(product => {
//       let row = document.createElement("tr");
//       row.innerHTML = `
//           <td>${product.product_name}</td>
//           <td>${product.category_id}</td>
//           <td>₹${product.price}</td>
//           <td>${product.quantity} ${product.unit_id}</td>
//           <td>${product.datetime}</td>
//       `;
//       tableBody.appendChild(row);
//   });
// }

// function populateTable2(products) {
//     let tableBody = document.querySelector(".currentinventory-body");
//     tableBody.innerHTML = ""; // Clear existing table data
  
//     products.forEach(product => {
//         let row = document.createElement("tr");
//         row.innerHTML = `
//             <td>${product.product_name}</td>
//             <td>${product.category_id}</td>
//             <td>₹${product.price}</td>
//             <td>${product.quantity} ${product.unit_id}</td>
//             <td><button class="remove-from-inv button-danger" id="${product.id}">Delete</button></td>
//         `;

//         tableBody.appendChild(row);
//     });
// }

let globalFarmerId = null;
let globalCurrentWeekId = null;
let globalProductMasterData = null;

async function initialize() {
    console.log("Initializing page...");
    const email = await fetchEmail();
    if (!email) {
        alert("Session expired or not logged in. Redirecting to home.");
        window.location.href = '../login/login.html';
        return;
    }
    console.log("User's session email:", email);
    
    const supplierData = await fetchSupplierDetails(email);
    if (!supplierData) return;
    
    const details = supplierData.details;
    globalFarmerId = details.supplierID;
    // const fId = details.supplierID;
    const fName = details.supplierName;
    const fAddress = details.farmLocation;
    const fPhone = details.contact;
    
    document.querySelector("#name").innerText = fName || "Farmer Name";
    document.querySelector("#phone").innerText = fPhone || "Contact";
    document.querySelector("#address").innerText = fAddress || "Location";
    // document.querySelector("#date").innerText = currentDateTime;
    
    const lastWeekData = await fetchLastWeek();
    globalCurrentWeekId = lastWeekData;
    document.querySelector("#week").innerText = `Current Inv. Week: ${globalCurrentWeekId || 'N/A'}`;
    
    if (globalFarmerId && globalCurrentWeekId) {
        fetchAndDisplayInventory(globalFarmerId, globalCurrentWeekId, ".currentinventory-body", true);
    } else {
        console.warn("Cannot fetch current inventory: Missing Farmer ID or Current Week ID.");
        populateInventoryTableInternal(".currentinventory-body", [], true); // Show empty
    }

    globalProductMasterData  = await fetchProducts();
    if (globalProductMasterData && globalProductMasterData.data) {
        const productSelect  = document.querySelector(".itmProduct");
        productSelect .innerHTML = '<option value="">Select Product</option>';
        globalProductMasterData.data.forEach(p => {
            if(p.rec_status==1){
                productSelect.innerHTML += `<option value="${p.prod_id}">${p.product}</option>`;
            }
        });
    } else {
        document.querySelector(".itmProduct").innerHTML = '<option value="">Error loading products</option>';
    }
    
    setupEventListeners(globalFarmerId, globalCurrentWeekId, globalProductMasterData);
    console.log("Initialization complete.");
}

function setupEventListeners(fId, currentLocalWeekId, productMasterList) {
    let tempInv = {};
    const addProductButton = document.querySelector(".ADDPRODUCT");
    const itemsContainer = document.querySelector(".items"); // For edit/delete of temp items
    const submissionButton = document.querySelector(".submission");
    const weekForm = document.getElementById("weekForm");
    const currentInventoryTableBody = document.querySelector(".currentinventory-body");

    if (addProductButton) {
        addProductButton.addEventListener('click', function () {
            const prodID = document.querySelector(".itmProduct").value;
            const prodQuantityInput = document.getElementById("itmQuantity");
            const prodQuantity = prodQuantityInput.value.trim();

            if (!prodID) {
                alert("Please select a product.");
                return;
            }
            if (!prodQuantity || isNaN(prodQuantity) || Number(prodQuantity) <= 0) {
                alert("Please enter a valid positive quantity.");
                return;
            }
            if (tempInv[prodID]) {
                alert(`${document.querySelector(".itmProduct").selectedOptions[0].innerText} is already in your temporary list. You can edit its quantity or delete and re-add.`);
                return;
            }
            if (!productMasterList || !productMasterList.data) {
                alert("Product master list not loaded. Cannot add item.");
                return;
            }

            const productDetails = productMasterList.data.find(p => String(p.prod_id) === String(prodID));
            if (!productDetails) {
                alert("Selected product details not found in master list.");
                return;
            }

            const prodName = document.querySelector(".itmProduct").selectedOptions[0].innerText;
            const { category_id: prodCat, price: rate, UoM_id: unitmeas } = productDetails;
            
            const now = new Date(); // Generate DateTime when item is added to temp list
            const currentItemDateTime = now.toLocaleString(); // Or a more DB-friendly format

            tempInv[prodID] = {
                p_id: prodID,
                p_name: prodName,
                cat_id: prodCat,
                price: rate, // Assuming rate is a number from productMasterList
                quantity: prodQuantity, // Still a string here, PHP will handle or we convert on submit
                uom_id: unitmeas,
                week_id: currentLocalWeekId, // Use the weekId passed to setupEventListeners
                farmer_Id: fId,             // Use the fId passed to setupEventListeners
                DateTime: currentItemDateTime // Client-side datetime
            };
            
            // Simplified DOM addition (original structure was complex)
            // Consider using the addTemporaryItemToDOM from refactored for cleaner display
            const total = (parseFloat(rate) * parseFloat(prodQuantity)).toFixed(2);
            itemsContainer.insertAdjacentHTML('beforeend', // More efficient than innerHTML +=
                `<div class="item border py-2 px-3 m-2 bg-light rounded shadow-sm" id="temp-${prodID}">
                     <h5 class="mb-1 d-flex justify-content-between">
                        <span>${prodName} (#${prodID})</span>
                        <div>
                            <button type="button" class="btn btn-sm btn-outline-secondary edit-temp-item me-1" data-id="${prodID}">Edit Qty</button>
                            <button type="button" class="btn btn-sm btn-outline-danger delete-temp-item" data-id="${prodID}">Del</button>
                        </div>
                     </h5>
                     <p class="mb-0 small">Qty: <span class="temp-qty">${prodQuantity}</span> ${unitmeas} @ ₹${rate}/unit. Total: ₹<span class="temp-total">${total}</span>. Cat: ${prodCat}</p>
                 </div>`);
            prodQuantityInput.value = ''; // Clear quantity input
            document.querySelector(".itmProduct").selectedIndex = 0; // Reset dropdown
        });
    }
    
    if (itemsContainer) {
        itemsContainer.addEventListener("click", (e) => {
            const editButton = e.target.closest('.edit-temp-item');
            const deleteButton = e.target.closest('.delete-temp-item');

            if (editButton) {
                const prodID = editButton.dataset.id;
                if (!tempInv[prodID]) return;

                const currentQuantity = tempInv[prodID].quantity;
                const newQuantityStr = prompt(`Edit quantity for ${tempInv[prodID].p_name}:`, currentQuantity);

                if (newQuantityStr !== null) {
                    const newQuantity = newQuantityStr.trim();
                    if (newQuantity === "" || isNaN(newQuantity) || Number(newQuantity) <= 0) {
                        alert("Please enter a valid positive quantity.");
                        return;
                    }
                    tempInv[prodID].quantity = newQuantity;
                    // Update DOM
                    const itemDiv = document.getElementById(`temp-${prodID}`);
                    if (itemDiv) {
                        itemDiv.querySelector('.temp-qty').textContent = newQuantity;
                        const newTotal = (Number(newQuantity) * parseFloat(tempInv[prodID].price)).toFixed(2);
                        itemDiv.querySelector('.temp-total').textContent = newTotal;
                    }
                }
            } else if (deleteButton) {
                const prodID = deleteButton.dataset.id;
                if (tempInv[prodID] && confirm(`Remove ${tempInv[prodID].p_name} from this submission list?`)) {
                    document.getElementById(`temp-${prodID}`).remove();
                    delete tempInv[prodID];
                }
            }
        });
    }

    // Event Delegation for .remove-from-inv buttons in the current inventory table
    if (currentInventoryTableBody) {
        currentInventoryTableBody.addEventListener('click', async function(event) {
            const targetButton = event.target.closest('button.remove-from-inv');
            if (targetButton) {
                const inventoryId = targetButton.dataset.inventoryId; // Use data-inventory-id
                const row = targetButton.closest('tr');
                const productName = row ? (row.cells[0]?.textContent || 'this item') : 'this item';

                if (confirm(`Are you sure you want to delete "${productName}" (ID: ${inventoryId}) from your inventory? This cannot be undone.`)) {
                    targetButton.disabled = true;
                    targetButton.textContent = 'Deleting...';
                    
                    const result = await deleteInventoryItemAPI(inventoryId); // Call API

                    if (result && result.status === "success") {
                        displayMessage('#currentinventory-result', result.message || "Item deleted successfully.", true);
                        row.remove(); // Remove row from table on success
                        // No need to call initialize() if just removing a row
                    } else {
                        displayMessage('#currentinventory-result', result.message || "Failed to delete item.", false);
                        console.error("Failed to delete item:", result);
                        targetButton.disabled = false;
                        targetButton.textContent = 'Delete';
                    }
                }
            }
        });
    }
      
    if (submissionButton) {
        submissionButton.addEventListener("click", async () => {
            if (Object.keys(tempInv).length === 0) {
                alert("No items to submit. Please add products first.");
                return;
            }
            submissionButton.disabled = true;
            submissionButton.textContent = 'Submitting...';
            displayMessage('#submission-result', 'Submitting inventory...', true); // Indicate processing

            try {
                const response = await fetch('../knft/submitINV.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(tempInv) // tempInv is already the object PHP expects
                });

                if (!response.ok) { // Check for HTTP errors (4xx, 5xx)
                    const errorText = await response.text(); // Get raw error text from server
                    throw new Error(`Server responded with ${response.status}: ${errorText}`);
                }

                const data = await response.json(); // Try to parse JSON

                console.log('Submission Response:', data);
                if (data && data.status === 'success') {
                    displayMessage('#submission-result', data.message || 'Inventory submitted successfully!', true);
                    tempInv = {}; // Clear temporary inventory
                    document.querySelector('.items').innerHTML = ''; // Clear temporary items from DOM
                    // Refresh current inventory table to show newly added items
                    if (fId && currentLocalWeekId) {
                         fetchAndDisplayInventory(fId, currentLocalWeekId, ".currentinventory-body", true);
                    }
                } else {
                    // PHP returned JSON but status was not 'success'
                    displayMessage('#submission-result', `Submission failed: ${data.message || 'Unknown server error.'}`, false);
                }
            } catch (error) { // Catches network errors or response.json() parsing errors
                console.error('Submission Fetch/Process Error:', error);
                // The error "Unexpected token '<'" would be caught here if PHP sends HTML
                displayMessage('#submission-result', `Submission error: ${error.message}. Check console for details.`, false);
            } finally {
                submissionButton.disabled = false;
                submissionButton.textContent = 'SUBMIT SELECTION';
            }
        });
    }

    if (weekForm) {
        weekForm.addEventListener("submit", function(event) {
            event.preventDefault(); 
            const selectedWeekId = document.getElementById("weekDropdown").value;
            if(selectedWeekId && fId){ // Ensure fId is available
                document.getElementById('inventory-result').textContent = 'Loading history...';
                document.getElementById('inventory-result').style.display = 'block';
                fetchAndDisplayInventory(fId, selectedWeekId, ".inventory-body", false);
                document.getElementById('inventory-result').textContent = '';
            } else if (!selectedWeekId) {
                alert("Please select a week.");
            } else {
                alert("Farmer details not loaded. Cannot fetch history.");
            }
        });
    }
}

// Function to load week options in the dropdown
async function loadWeekDropdown() {
    // const weeks = await response.json();
    const weekDropdown = document.getElementById('weekDropdown');
    if (!weekDropdown) {
        console.error("loadWeekDropdown: #weekDropdown element not found.");
        return;
    }
    weekDropdown.innerHTML = '<option value="">Select a Week</option>'; // Clear existing options
    try {
        const weeks = await fetchWeeks();
        if (weeks && weeks.length > 0) {
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
        // const weekDropdown = document.getElementById('weekDropdown');
        if(weekDropdown) weekDropdown.innerHTML = `<option value="">Error loading weeks</option>`;
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
    // Initial call to display the clock immediately
    updateClock();
    // Update the clock every second
    setInterval(updateClock, 1000);
}

// Call the clock initialization function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeClock();
    loadWeekDropdown();
    initialize(); // Ensure the rest of the page functionality is initialized
});

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// // Helper function for displaying messages (you might want to implement this)
// function displayMessage(selector, message, isSuccess) {
//     const element = document.querySelector(selector);
//     if (element) {
//         element.textContent = message;
//         element.className = `m-3 alert ${isSuccess ? 'alert-success' : 'alert-danger'}`;
//         element.style.display = 'block';
//         // Optional: hide after a few seconds
//         // setTimeout(() => { element.style.display = 'none'; }, 5000);
//     }
// }

// // --- Fetch Functions ---

// async function fetchApi(url, options = { method: "POST" }) {
//     try {
//         const response = await fetch(url, options);
//         if (!response.ok) {
//             const errorText = await response.text(); // Try to get the error text
//             console.error(`HTTP error! status: ${response.status} for ${url}. Response: ${errorText}`);
//             throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText}`);
//         }
//         return await response.json();
//     } catch (error) {
//         console.error('Error fetching ${url}:', error); // Your line 422
//         displayMessage('#submission-result', `Client-side error processing response from ${url}. Check console.`, false);
//         // Maybe display a generic error to the user
//         // displayMessage('#some-global-error-area', 'Network error. Please try again later.', false);
//         return null; // Return null to indicate failure
//     }
// }

// async function fetchEmail() {
//     const data = await fetchApi('../knft/returnE.php');
//     return data?.email || null;
// }

// async function fetchSupplierDetails(email) {
//     return await fetchApi('../knft/getSupplier2.php', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email })
//     });
// }

// async function fetchLastWeek() {
//     const data = await fetchApi('../knft/getLastWeek.php');
//     // Ensure it returns an array and access the first element safely
//     return data?.[0]?.weekID || null;
// }

// async function fetchProducts() {
//     // Assuming getProduct.php returns { data: [...] } structure
//     return await fetchApi('../knft/getProduct.php');
// }

// async function fetchWeeks() {
//     // Assuming getWeek.php returns an array of { weekID: ..., weekdate: ... }
//     return await fetchApi('../knft/getWeek.php');
// }

// async function fetchInventoryForWeek(farmerId, weekId) {
//     // Assuming getFarmerHistory.php returns an array of inventory items
//     return await fetchApi('../knft/getFarmerHistory.php', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ farmer_id: farmerId, weekid: weekId })
//     });
// }

// async function submitInventoryBatch(inventoryData) {
//     return await fetchApi('../knft/submitINV.php', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(inventoryData)
//     });
// }

// async function deleteInventoryItem(inventoryId) {
//     // Using FormData as per original code, but JSON is often cleaner if backend supports it
//     const formData = new FormData();
//     formData.append("id", inventoryId);

//     return await fetchApi("../knft/deleteInventory.php", {
//         method: "POST",
//         body: formData, // Send as FormData
//     });
//     /* Alternative using JSON:
//     return await fetchApi("../knft/deleteInventory.php", {
//         method: "POST",
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ id: inventoryId }),
//     });
//     */
// }


// // --- DOM Manipulation Functions ---

// function populateUserDetails(details) {
//     if (!details) return;
//     document.querySelector("#name").textContent = details.supplierName || 'N/A';
//     document.querySelector("#phone").textContent = details.contact || 'N/A';
//     document.querySelector("#address").textContent = details.farmLocation || 'N/A';
// }

// function populateProductDropdown(productData) {
//     const productSelect = document.querySelector(".itmProduct");
//     if (!productSelect || !productData || !productData.data) {
//         productSelect.innerHTML = '<option value="">Error loading products</option>';
//         return;
//     }
//     if (productData.data.length === 0) {
//         productSelect.innerHTML = '<option value="">No products available</option>';
//         return;
//     }
//     productSelect.innerHTML = productData.data.map(
//         p => `<option value="${p.prod_id}">${p.product}</option>` // Ensure property names match PHP output
//     ).join('');
// }

// function populateWeekDropdown(weeks) {
//     const weekDropdown = document.getElementById('weekDropdown');
//     if (!weekDropdown) return;

//     if (!weeks || weeks.length === 0) {
//         weekDropdown.innerHTML = `<option value="">No weeks available</option>`;
//         return;
//     }

//     weekDropdown.innerHTML = weeks.map(week =>
//         `<option value="${week.weekID}">${week.weekdate}</option>` // Ensure property names match PHP output
//     ).join('');
//      weekDropdown.disabled = false; // Enable dropdown
// }

// function populateInventoryTable(tableBodySelector, inventoryData, addDeleteButton = false) {
//     const tableBody = document.querySelector(tableBodySelector);
//     if (!tableBody) return;

//     tableBody.innerHTML = ""; // Clear existing data

//     if (!inventoryData || inventoryData.length === 0) {
//         const colSpan = addDeleteButton ? 5 : 5; // Adjust colspan based on columns
//         tableBody.innerHTML = `<tr><td colspan="${colSpan}" class="text-center">No inventory data found.</td></tr>`;
//         return;
//     }

//     inventoryData.forEach(product => {
//         // Ensure property names match PHP output (e.g., product_name, category_id, etc.)
//         const row = document.createElement("tr");
//         row.setAttribute('data-inventory-id', product.id); // Add id to row for easier deletion
//         row.innerHTML = `
//             <td>${product.product_name || 'N/A'}</td>
//             <td>${product.category_id || 'N/A'}</td>
//             <td>₹${product.price || 0}</td>
//             <td>${product.quantity || 0} ${product.unit_id || ''}</td>
//             ${addDeleteButton ? `<td><button class="btn btn-sm btn-danger remove-from-inv" data-id="${product.id}">Delete</button></td>` : `<td>${product.datetime || 'N/A'}</td>`}
//         `;
//         tableBody.appendChild(row);
//     });
// }

// function addTemporaryItemToDOM(itemDetails, tempInvEntry) {
//     const itemsContainer = document.querySelector('.items');
//     if (!itemsContainer) return;

//     const { prodID, prodName, prodQuantity } = itemDetails;
//     const { cat_id, price, uom_id } = tempInvEntry;
//     const total = (parseFloat(prodQuantity) * parseFloat(price)).toFixed(2);

//     // NOTE: Using template literals for HTML generation. Consider using <template> tag for complex structures.
//     const itemHTML = `
//         <div class="item border rounded shadow-sm py-1 px-2 m-3 bg-white h-auto" id="temp-${prodID}">
//             <h5 class="m-2 d-flex justify-content-between align-items-center">
//                 <span>${prodName} (#${prodID})</span>
//                 <div>
//                      <button type="button" class="btn btn-sm btn-warning edit-temp-item" data-id="${prodID}" aria-label="Edit Quantity">
//                          <img src="../public/Assets/edit.svg" alt="Edit" style="width:16px; height:16px; pointer-events: none;">
//                      </button>
//                      <button type="button" class="btn btn-sm btn-danger delete-temp-item" data-id="${prodID}" aria-label="Delete Item">
//                          <img src="../public/Assets/delete.svg" alt="Delete" style="width:16px; height:16px; pointer-events: none;">
//                      </button>
//                  </div>
//             </h5>
//             <div class="table-responsive">
//                 <table class="table table-sm table-bordered mb-1 small">
//                     <thead class="table-light">
//                       <tr>
//                         <th>Category</th>
//                         <th>Quantity</th>
//                         <th>Unit</th>
//                         <th>Price/Unit</th>
//                         <th>Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       <tr>
//                         <td><span class="cat-id">${cat_id || 'N/A'}</span></td>
//                         <td><span class="quantity">${prodQuantity}</span></td>
//                         <td><span class="uom-id">${uom_id || 'N/A'}</span></td>
//                         <td>₹<span class="rate">${price || 0}</span></td>
//                         <td>₹<span class="total">${total}</span></td>
//                       </tr>
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//     `;
//     itemsContainer.insertAdjacentHTML('beforeend', itemHTML);
// }

// function updateTemporaryItemInDOM(prodID, newQuantity, newTotal) {
//      const itemElement = document.getElementById(`temp-${prodID}`);
//      if (itemElement) {
//          const quantitySpan = itemElement.querySelector('.quantity');
//          const totalSpan = itemElement.querySelector('.total');
//          if (quantitySpan) quantitySpan.textContent = newQuantity;
//          if (totalSpan) totalSpan.textContent = newTotal.toFixed(2);
//      }
// }

// function removeTemporaryItemFromDOM(prodID) {
//     const itemElement = document.getElementById(`temp-${prodID}`);
//     if (itemElement) {
//         itemElement.remove();
//     }
// }

// function clearTemporaryItems() {
//     const itemsContainer = document.querySelector('.items');
//     if (itemsContainer) itemsContainer.innerHTML = '';
//     document.getElementById("itmQuantity").value = ''; // Clear quantity input
//     // Optionally reset product dropdown: document.querySelector(".itmProduct").selectedIndex = 0;
// }

// function updateClock() {
//     const dateElement = document.getElementById('date');
//     if (!dateElement) return;
//     const now = new Date();
//     // Customize date/time format as needed
//     const formattedDateTime = now.toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'medium' });
//     dateElement.textContent = formattedDateTime;
// }


// // --- Main Application Logic ---

// let farmerId = null;
// let currentWeekId = null;
// let allProducts = null; // Store fetched product data
// let tempInventory = {}; // Object to hold items before submission

// async function initializePage() {
//     console.log("Initializing page...");

//     // Start clock
//     updateClock();
//     setInterval(updateClock, 1000); // Update every second

//     // 1. Get User Email
//     const email = await fetchEmail();
//     if (!email) {
//         console.error("No session email found. Redirecting to home.");
//         window.location.href = '../home.html'; // Or login page
//         return;
//     }
//     console.log("User Email:", email);

//     // 2. Get Supplier Details
//     const supplierData = await fetchSupplierDetails(email);
//     if (!supplierData || !supplierData.details) {
//         console.error("Failed to fetch supplier details.");
//         displayMessage('#currentinventory-result', 'Error loading your details.', false);
//         // Decide if page should halt or continue with limited functionality
//         return;
//     }
//     farmerId = supplierData.details.supplierID;
//     populateUserDetails(supplierData.details);
//     console.log("Supplier Details:", supplierData.details);

//     // 3. Get Current Week & All Weeks (Run in parallel)
//     const [lastWeek, weeks] = await Promise.all([
//         fetchLastWeek(),
//         fetchWeeks()
//     ]);

//     currentWeekId = lastWeek;
//     document.querySelector("#week").textContent = `Current Week ID: ${currentWeekId || 'N/A'}`;
//     console.log("Current Week ID:", currentWeekId);

//     populateWeekDropdown(weeks); // Populate historical week dropdown

//     // 4. Get Products
//     allProducts = await fetchProducts(); // Store globally
//     if (!allProducts) {
//         console.error("Failed to fetch products.");
//         displayMessage('#currentinventory-result', 'Error loading product list.', false);
//         // Disable add form if products fail?
//     } else {
//         populateProductDropdown(allProducts);
//         console.log("Products loaded:", allProducts.data.length);
//     }

//     // 5. Get Current Inventory (for the latest week)
//     if (farmerId && currentWeekId) {
//         const currentInventory = await fetchInventoryForWeek(farmerId, currentWeekId);
//         console.log("Current Week Inventory:", currentInventory);
//         populateInventoryTable(".currentinventory-body", currentInventory, true); // Add delete buttons
//     } else {
//          populateInventoryTable(".currentinventory-body", [], true); // Show empty table
//          console.warn("Cannot fetch current inventory: Missing farmerId or currentWeekId");
//     }

//      // 6. Set up Event Listeners (after initial data is loaded)
//     setupEventListeners();

//     console.log("Initialization complete.");
// }

// function setupEventListeners() {
//     const addProductButton = document.querySelector(".ADDPRODUCT");
//     const itemsContainer = document.querySelector(".items");
//     const submissionButton = document.querySelector(".submission");
//     const weekForm = document.getElementById("weekForm");
//     const currentInventoryTableBody = document.querySelector(".currentinventory-body");

//     // --- Add Product to Temporary List ---
//     if (addProductButton) {
//         addProductButton.addEventListener('click', () => {
//             const productSelect = document.querySelector(".itmProduct");
//             const quantityInput = document.getElementById("itmQuantity");

//             const prodID = productSelect.value;
//             const quantity = quantityInput.value.trim();

//             if (!prodID || !quantity || isNaN(quantity) || Number(quantity) <= 0) {
//                 alert("Please select a product and enter a valid positive quantity.");
//                 return;
//             }
//              if (tempInventory[prodID]) {
//                  alert(`${productSelect.selectedOptions[0].innerText} is already in your temporary list. Edit or delete the existing entry.`);
//                  return;
//              }
//             if (!allProducts || !allProducts.data) {
//                 alert("Product data not loaded. Cannot add item.");
//                 return;
//             }

//             const productDetails = allProducts.data.find(p => p.prod_id == prodID); // Use == for potential type difference
//             if (!productDetails) {
//                 alert("Selected product details not found.");
//                 return;
//             }

//             // Prepare data for temp storage and display
//             const itemDetails = {
//                  prodID: prodID,
//                  prodName: productSelect.selectedOptions[0].innerText,
//                  prodQuantity: quantity,
//             };
//             const tempInvEntry = {
//                 p_id: prodID,
//                 p_name: itemDetails.prodName,
//                 cat_id: productDetails.category_id, // Ensure field names match product data
//                 price: productDetails.price,
//                 quantity: quantity,
//                 uom_id: productDetails.UoM_id, // Ensure field names match product data
//                 week_id: currentWeekId,
//                 farmer_Id: farmerId,
//                 // DateTime will likely be set server-side on submission
//             };

//             // Store in temp object and add to DOM
//             tempInventory[prodID] = tempInvEntry;
//             addTemporaryItemToDOM(itemDetails, tempInvEntry);

//             // Clear inputs after adding
//             quantityInput.value = '';
//             // productSelect.selectedIndex = 0; // Optional: Reset dropdown
//         });
//     }

//     // --- Edit/Delete Temporary Items (Event Delegation on .items container) ---
//     if (itemsContainer) {
//         itemsContainer.addEventListener('click', (e) => {
//             const target = e.target;
//             const editButton = target.closest('.edit-temp-item');
//             const deleteButton = target.closest('.delete-temp-item');

//             if (editButton) {
//                 const prodID = editButton.dataset.id;
//                 if (!tempInventory[prodID]) return; // Safety check

//                 const currentQuantity = tempInventory[prodID].quantity;
//                 const newQuantityStr = prompt(`Edit quantity for ${tempInventory[prodID].p_name}:`, currentQuantity);

//                 if (newQuantityStr !== null) { // Handle cancel
//                     const newQuantity = newQuantityStr.trim();
//                     if (newQuantity === "" || isNaN(newQuantity) || Number(newQuantity) <= 0) {
//                         alert("Please enter a valid positive quantity.");
//                         return;
//                     }
//                     // Update temp storage
//                     tempInventory[prodID].quantity = newQuantity;
//                     // Update DOM display
//                     const newTotal = Number(newQuantity) * parseFloat(tempInventory[prodID].price);
//                     updateTemporaryItemInDOM(prodID, newQuantity, newTotal);
//                     console.log("Updated temp item:", tempInventory[prodID]);
//                 }
//             } else if (deleteButton) {
//                 const prodID = deleteButton.dataset.id;
//                  if (tempInventory[prodID] && confirm(`Remove ${tempInventory[prodID].p_name} from this submission?`)) {
//                     // Remove from temp storage
//                     delete tempInventory[prodID];
//                     // Remove from DOM
//                     removeTemporaryItemFromDOM(prodID);
//                     console.log("Deleted temp item:", prodID);
//                 }
//             }
//         });
//     }

//     // --- Submit Temporary Inventory Batch ---
//     if (submissionButton) {
//         submissionButton.addEventListener('click', async () => {
//             const itemsToSubmit = Object.values(tempInventory); // Get array of items
//             if (itemsToSubmit.length === 0) {
//                 alert("No items added to submit.");
//                 return;
//             }

//             console.log("Submitting inventory:", itemsToSubmit);
//             submissionButton.disabled = true; // Prevent double clicks
//             submissionButton.textContent = 'Submitting...';

//             const result = await submitInventoryBatch(tempInventory); // Send the object keyed by prodID

//             if (result && result.status === 'success') { // Check backend response structure
//                 alert(result.message || "Inventory submitted successfully!"); // Use message from backend if available
//                 // Clear temporary state
//                 tempInventory = {};
//                 clearTemporaryItems();
//                 // Refresh the "Current Inventory" table for the current week
//                 const updatedInventory = await fetchInventoryForWeek(farmerId, currentWeekId);
//                 populateInventoryTable(".currentinventory-body", updatedInventory, true);
//             } else {
//                 alert(`Submission failed: ${result?.message || 'Unknown error'}`);
//                 console.error("Submission Error:", result);
//             }

//             submissionButton.disabled = false; // Re-enable button
//             submissionButton.textContent = 'SUBMIT SELECTION';
//         });
//     }

//     // --- Load Historical Inventory ---
//     if (weekForm) {
//         weekForm.addEventListener('submit', async (event) => {
//             event.preventDefault();
//             const selectedWeekId = document.getElementById("weekDropdown").value;
//             const resultDiv = document.getElementById('inventory-result');
//             const tableBody = document.querySelector(".inventory-body");

//             if (!selectedWeekId) {
//                 alert('Please select a week.');
//                 return;
//             }

//             resultDiv.textContent = 'Loading inventory...';
//             resultDiv.style.display = 'block';
//             tableBody.innerHTML = ''; // Clear previous results

//             const historicalInventory = await fetchInventoryForWeek(farmerId, selectedWeekId);

//             if (historicalInventory) {
//                  populateInventoryTable(".inventory-body", historicalInventory, false); // No delete button here
//                  resultDiv.style.display = 'none'; // Hide loading message
//             } else {
//                 resultDiv.textContent = 'Failed to load inventory for the selected week.';
//                 resultDiv.className = 'm-3 alert alert-danger';
//                  populateInventoryTable(".inventory-body", [], false); // Show empty table
//             }
//         });
//     }

//      // --- Delete Item from Current Inventory (Event Delegation on .currentinventory-body) ---
//     if (currentInventoryTableBody) {
//         currentInventoryTableBody.addEventListener('click', async (e) => {
//             const deleteButton = e.target.closest('.remove-from-inv');
//             if (deleteButton) {
//                 const inventoryId = deleteButton.dataset.id;
//                 const row = deleteButton.closest('tr');
//                 const productName = row?.cells[0]?.textContent || 'this item'; // Get product name for confirmation

//                 if (inventoryId && confirm(`Are you sure you want to delete ${productName} (ID: ${inventoryId}) from the inventory? This cannot be undone.`)) {
//                     console.log(`Attempting to delete inventory item ID: ${inventoryId}`);
//                     deleteButton.disabled = true; // Prevent double clicks
//                     deleteButton.textContent = 'Deleting...';

//                     const result = await deleteInventoryItem(inventoryId);

//                     if (result && result.status === 'success') {
//                         console.log(`Successfully deleted item ID: ${inventoryId}`);
//                         // Remove the row from the table visually
//                         row.remove();
//                          displayMessage('#currentinventory-result', result.message || 'Item deleted successfully.', true);
//                          // Optional: Re-fetch to ensure sync, but removing the row is faster UX
//                          // const updatedInventory = await fetchInventoryForWeek(farmerId, currentWeekId);
//                          // populateInventoryTable(".currentinventory-body", updatedInventory, true);
//                     } else {
//                         alert(`Failed to delete item: ${result?.message || 'Unknown error'}`);
//                         console.error("Deletion Error:", result);
//                          deleteButton.disabled = false; // Re-enable on failure
//                          deleteButton.textContent = 'Delete';
//                     }
//                 }
//             }
//         });
//     }
// }

// // --- Initialize the page once the DOM is ready ---
// document.addEventListener('DOMContentLoaded', initializePage);

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
