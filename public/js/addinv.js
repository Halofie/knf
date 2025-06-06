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

    // ...existing code...
    products.forEach(product => {
        const row = document.createElement("tr");
        console.log("Rendering product for history:", product);
        // Add data-product-id for copy logic
        row.innerHTML = `
            <td data-product-id="${product.prod_id || product.product_id || ''}">${product.product_name || 'N/A'}</td>
            <td>${product.category_id || 'N/A'}</td>
            <td>₹${typeof product.price === 'number' ? product.price.toFixed(2) : (product.price || '0.00')}</td>
            <td>${product.quantity || '0'} ${product.unit_id || ''}</td>
            ${addDeleteButton ? 
                `<td><button class="btn btn-sm btn-danger remove-from-inv" data-inventory-id="${product.id}">Delete</button></td>` :
                `<td>${product.inv_datetime || product.datetime || 'N/A'}</td>`
            }
        `;
        tableBody.appendChild(row);
    });
    // ...existing code...
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
let tempInv = {};
const itemsContainer = document.querySelector('.items');

function setupEventListeners(fId, currentLocalWeekId, productMasterList) {
    const addProductButton = document.querySelector(".ADDPRODUCT");
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

// ...existing code...

// Show/hide the copy button based on whether history is loaded
document.getElementById('weekForm').addEventListener('submit', function(event) {
    setTimeout(() => {
        const inventoryRows = document.querySelectorAll('.inventory-body tr');
        const btn = document.getElementById('copyToCurrentWeekBtn');
        // Show button only if there are products in history
        btn.style.display = (inventoryRows.length && !inventoryRows[0].textContent.includes('No inventory')) ? 'block' : 'none';
    }, 500); // Wait for inventory to load
});

// Copy products from history to current week
// ...existing code...

document.getElementById('copyToCurrentWeekBtn').addEventListener('click', function() {
    const rows = document.querySelectorAll('.inventory-body tr');
    if (!rows.length || rows[0].textContent.includes('No inventory')) {
        alert('No products to copy.');
        return;
    }
    if (!globalFarmerId || !globalCurrentWeekId) {
        alert('Farmer or week not loaded.');
        return;
    }

    let addedCount = 0;
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length >= 5) {
            let productId = cells[0].dataset.productId || '';
            const productName = cells[0].textContent.trim();
            // If productId is missing, try to find it from master data (case-insensitive)
            if (!productId && globalProductMasterData && globalProductMasterData.data) {
                const found = globalProductMasterData.data.find(
                    p => (p.product && p.product.toLowerCase() === productName.toLowerCase()) ||
                        (p.product_name && p.product_name.toLowerCase() === productName.toLowerCase())
                );
                if (found) productId = found.prod_id || found.product_id || '';
            }
            // Avoid duplicates in tempInv
            if (!productId || tempInv[productId]) return;

            const catId = cells[1].textContent.trim();
            const price = parseFloat(cells[2].textContent.replace(/[^\d.]/g, '')) || 0;
            const quantity = parseFloat(cells[3].textContent) || 0;
            const uomId = (cells[3].textContent.split(' ')[1] || '').trim();

            tempInv[productId] = {
                p_id: productId,
                p_name: productName,
                cat_id: catId,
                price: price,
                quantity: quantity,
                uom_id: uomId,
                week_id: globalCurrentWeekId,
                farmer_Id: globalFarmerId,
                DateTime: new Date().toLocaleString()
            };

            // Add to DOM (temporary items list)
            const total = (price * quantity).toFixed(2);
            itemsContainer.insertAdjacentHTML('beforeend',
                `<div class="item border py-2 px-3 m-2 bg-light rounded shadow-sm" id="temp-${productId}">
                     <h5 class="mb-1 d-flex justify-content-between">
                        <span>${productName} (#${productId})</span>
                        <div>
                            <button type="button" class="btn btn-sm btn-outline-secondary edit-temp-item me-1" data-id="${productId}">Edit Qty</button>
                            <button type="button" class="btn btn-sm btn-outline-danger delete-temp-item" data-id="${productId}">Del</button>
                        </div>
                     </h5>
                     <p class="mb-0 small">Qty: <span class="temp-qty">${quantity}</span> ${uomId} @ ₹${price}/unit. Total: ₹<span class="temp-total">${total}</span>. Cat: ${catId}</p>
                 </div>`);
            addedCount++;
        }
    });

    if (addedCount === 0) {
        alert('No new valid products found to copy (duplicates skipped).');
    } else {
        alert(`${addedCount} products copied to your selection. Review and submit.`);
    }
});

