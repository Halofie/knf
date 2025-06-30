document.addEventListener('DOMContentLoaded', function() {
    // --- Initial Data Loading ---
    loadAllAdminData(); // Load data for all admin sections
    initialiseLockButton();
    getTrayStatusData();
    editTrayStatusListener();
    const allocationWeekDropdown = document.getElementById('allocationWeekId');
    if (allocationWeekDropdown) {
        console.log("Found #allocationWeekId dropdown. Attempting to populate...");
        // Assuming populateAdminWeekDropdown is defined or we'll define a local one
        // For now, let's define a local one if it's not already a global utility
        if (typeof populateAdminWeekDropdown_Local === "function") {
            populateAdminWeekDropdown_Local('allocationWeekId');
        } else {
            console.warn("populateAdminWeekDropdown_Local not defined. Week dropdown for allocation might not populate.");
        }
    } else {
        console.log("#allocationWeekId dropdown NOT found on this page load."); // << ADD THIS LOG
    }

    const allocationForm = document.getElementById('allocationForm');
    if (allocationForm) {
        allocationForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const weekId = document.getElementById('allocationWeekId').value;
            const resultDiv = document.getElementById('allocationResult');
            const submitButton = this.querySelector('button[type="submit"]');

            if (!weekId) {
                alert('Please select a week for allocation.');
                return;
            }

            if (!confirm(`Are you sure you want to run allocation for week ID ${weekId}? \nThis will:\n1. Clear any previous farmer assignments for this week.\n2. Assign customer orders to farmers based on rank and inventory.\n3. Enable fulfillment checklist visibility for farmers.`)) {
                return;
            }

            if (resultDiv) { // Ensure resultDiv exists
                resultDiv.style.display = 'block';
                resultDiv.className = 'mt-4 alert alert-info'; // Ensure mt-4 is applied if not in HTML
                resultDiv.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Processing allocation... This may take a moment.';
            }
            if (submitButton) submitButton.disabled = true;

            try {
                const response = await fetch('../knft/getFarmerProdMatching.php', { // Path to your new PHP
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ week_id: weekId })
                });

                let resultData;
                const responseText = await response.text();
                try {
                    resultData = JSON.parse(responseText);
                } catch (e) {
                    console.error("Failed to parse JSON response from server:", responseText);
                    throw new Error(`Server returned non-JSON response (status ${response.status}). Check PHP error logs. Raw response: ${responseText.substring(0, 200)}...`);
                }

                if (resultDiv) { // Check again before manipulating
                    if (response.ok && resultData.status === 'success') {
                        resultDiv.className = 'mt-4 alert alert-success';
                    } else {
                        resultDiv.className = 'mt-4 alert alert-danger';
                    }
                    let message = resultData.message || 'Process completed with an unknown server status.';
                    if (resultData.unallocated_items && resultData.unallocated_items.length > 0) {
                        message += ` <br><strong>Warning:</strong> ${resultData.unallocated_items.length} customer order line(s) could not be fully allocated. Check server logs for details.`;
                        console.warn("Unallocated items details:", resultData.unallocated_items);
                    }
                    resultDiv.innerHTML = message; // Use innerHTML for <br>
                } else {
                    // Fallback if resultDiv is not found
                    alert(resultData.message || (response.ok ? "Allocation successful." : "Allocation failed."));
                }

            } catch (error) {
                console.error("Allocation Process Error:", error);
                if (resultDiv) {
                    resultDiv.className = 'mt-4 alert alert-danger';
                    resultDiv.innerHTML = 'A critical client-side or network error occurred: ' + error.message;
                } else {
                    alert('A critical client-side or network error occurred: ' + error.message);
                }
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }

    document.getElementById('lockButton')?.addEventListener('click', buttonLockToggle);
    Fullfillform()
    editFulfillListener(); // Initialize fulfill form event listeners
    getFarmerRankData();
    editFarmerRankListener();
    // Form Submissions (Add New)
    document.getElementById('uomForm')?.addEventListener('submit', handleAddUom);
    document.getElementById('categoryForm')?.addEventListener('submit', handleAddCategory);
    document.querySelector('.ADDPRODUCT')?.addEventListener('click', handleAddProduct);
    document.getElementById('routeForm')?.addEventListener('submit', handleAddRoute);
    document.getElementById('customerForm')?.addEventListener('submit', handleAddCustomer);
    document.getElementById('supplierForm')?.addEventListener('submit', handleAddSupplier);
    document.getElementById('weekForm')?.addEventListener('submit', handleAddWeek);

    // Event Delegation for Edit/Delete Buttons (Attach to table bodies)
    // Edit Buttons
    document.querySelector('.uomHolder .uom-body')?.addEventListener('click', function(e) { if (e.target.closest('.edit-uom-btn')) handleEditUom(e); });
    document.querySelector('.categoryHolder .category-body')?.addEventListener('click', function(e) { if (e.target.closest('.edit-category-btn')) handleEditCategory(e); });
    document.querySelector('.productHolder .product-body')?.addEventListener('click', function(e) { if (e.target.closest('.edit-product-btn')) handleEditProduct(e); });
    document.querySelector('.routeHolder .route-body')?.addEventListener('click', function(e) { if (e.target.closest('.edit-route-btn')) handleEditRoute(e); });
    document.querySelector('.customerHolder .customer-body')?.addEventListener('click', function(e) { if (e.target.closest('.edit-customer-btn')) handleEditCustomer(e); });
    document.querySelector('.supplierHolder .supplier-body')?.addEventListener('click', function(e) { if (e.target.closest('.edit-supplier-btn')) handleEditSupplier(e); });
    document.querySelector('.weekHolder .week-body')?.addEventListener('click', function(e) { if (e.target.closest('.edit-week-btn')) handleEditWeek(e); });

    // Delete Buttons
    document.querySelector('.uomHolder .uom-body')?.addEventListener('click', function(e) { if (e.target.closest('.delete-uom-btn')) handleDeleteUom(e); });
    document.querySelector('.categoryHolder .category-body')?.addEventListener('click', function(e) { if (e.target.closest('.delete-category-btn')) handleDeleteCategory(e); });
    document.querySelector('.productHolder .product-body')?.addEventListener('click', function(e) { if (e.target.closest('.delete-product-btn')) handleDeleteProduct(e); });
    document.querySelector('.routeHolder .route-body')?.addEventListener('click', function(e) { if (e.target.closest('.delete-route-btn')) handleDeleteRoute(e); });
    document.querySelector('.customerHolder .customer-body')?.addEventListener('click', function(e) { if (e.target.closest('.delete-customer-btn')) handleDeleteCustomer(e); });
    document.querySelector('.supplierHolder .supplier-body')?.addEventListener('click', function(e) { if (e.target.closest('.delete-supplier-btn')) handleDeleteSupplier(e); });
    document.querySelector('.weekHolder .week-body')?.addEventListener('click', function(e) { if (e.target.closest('.delete-week-btn')) handleDeleteWeek(e); });


    // Format Week Date Input (Handle date format change if needed)
    document.getElementById('weekForm')?.addEventListener('submit', function(e) {
        const dateInput = document.getElementById('weekDate').value;
        // Keep sending YYYY-MM-DD, assuming PHP is updated
        document.getElementById('formattedWeekDate').value = dateInput;
    });

}); // --- END Document Ready ---

async function populateAdminWeekDropdown_Local(dropdownId, includeAllOption = false, allOptionText = "All Weeks") {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) {
        console.error("Admin week dropdown not found:", dropdownId);
        return;
    }
    console.log(`populateAdminWeekDropdown_Local: Populating '${dropdownId}'...`);
    // Preserve the first option if it's a placeholder like "Loading..." or "Select Week"
    let firstOptionHTML = dropdown.options.length > 0 && dropdown.options[0].value === "" ? 
                          `<option value="" selected disabled>${dropdown.options[0].textContent}</option>` : 
                          '<option value="" selected disabled>Loading weeks...</option>';
    
    dropdown.innerHTML = firstOptionHTML; // Set initial state

    if (includeAllOption) {
        dropdown.add(new Option(allOptionText, "all"));
    }

    try {
        const response = await fetch('../knft/getWeek.php'); // Centralized week fetching
        console.log(`populateAdminWeekDropdown_Local: Fetch response status for getWeek.php: ${response.status}`);
        if (!response.ok) throw new Error(`Failed to fetch weeks, status: ${response.status}`);
        const weeks = await response.json();
        console.log(`populateAdminWeekDropdown_Local: Weeks data received from getWeek.php:`, weeks); // << LOG 3 (CRUCIAL)

        if (weeks && Array.isArray(weeks)) {
            if (weeks.length > 0) {
                // Update placeholder text if it was "Loading weeks..."
                if (dropdown.options.length > 0 && dropdown.options[0].value === "" && dropdown.options[0].textContent === "Loading weeks...") {
                     dropdown.options[0].textContent = 'Select a Week';
                } else if (dropdown.options.length === 0 || (dropdown.options[0].value !== "" && !includeAllOption) ) {
                     // If no placeholder or 'all' option, ensure 'Select a Week' is there
                     dropdown.innerHTML = '<option value="">Select a Week</option>';
                     if (includeAllOption) {
                         dropdown.add(new Option(allOptionText, "all"));
                     }
                }
                
                let weeksAddedCount = 0;
                weeks.forEach(week => {
                    // Assuming getWeek.php returns rec_status for each week
                    if (String(week.rec_status) === '1') { // Only show active weeks
                        if (week.weekID && week.weekdate) { // Ensure properties exist
                            dropdown.add(new Option(`${week.weekdate} (ID: ${week.weekID})`, week.weekID));
                            weeksAddedCount++;
                        } else {
                            console.warn("populateAdminWeekDropdown_Local: Week object missing weekID or weekdate", week);
                        }
                    }
                });
                console.log(`populateAdminWeekDropdown_Local: Added ${weeksAddedCount} active weeks to dropdown.`); // << LOG 4
                if (weeksAddedCount === 0 && (dropdown.options.length === 0 || (dropdown.options[0].value === "" && dropdown.options[0].textContent === "Select a Week"))) {
                    dropdown.options[0].textContent = 'No active weeks available';
                }

            } else { // Weeks array is empty
                 console.log("populateAdminWeekDropdown_Local: getWeek.php returned an empty array."); // << LOG 5
                 if (dropdown.options.length > 0 && dropdown.options[0].value === "") {
                    dropdown.options[0].textContent = 'No weeks available';
                 } else {
                    dropdown.innerHTML = '<option value="">No weeks available</option>';
                 }
            }
        } else {
            console.error("populateAdminWeekDropdown_Local: Received unexpected data format for weeks (not an array or null):", weeks); // << LOG 6
             if (dropdown.options.length > 0 && dropdown.options[0].value === "") {
                dropdown.options[0].textContent = 'Error: Invalid week data';
             } else {
                dropdown.innerHTML = '<option value="">Error: Invalid week data</option>';
             }
        }
    } catch (error) {
        console.error("Error in populateAdminWeekDropdown_Local:", error); // << LOG 7
        if (dropdown.options.length > 0 && dropdown.options[0].value === "") {
            dropdown.options[0].textContent = 'Error loading weeks';
        } else {
            dropdown.innerHTML = '<option value="">Error loading weeks</option>';
        }
    }
}

// --- Helper Functions ---
function displayMessage(selector, message, isSuccess) {
    const el = document.querySelector(selector);
    if (!el) return; // Exit if element not found
    el.classList.remove('alert', 'alert-success', 'alert-danger', 'alert-warning');
    el.textContent = '';
    el.style.display = 'none';
    if (message) {
        el.classList.add('alert');
        el.classList.add(isSuccess ? 'alert-success' : 'alert-danger');
        el.textContent = message;
        el.style.display = 'block'; // Make it visible
    }
}

async function handleFetchError(response, resultSelector) {
    let msg = "Request failed. ";
    if (response && typeof response.text === "function") {
        try {
            const errorText = await response.text();
            msg += `Server Status: ${response.status}. Details: ${errorText.substring(0,200)}...`;
        } catch (e) { msg += "Could not read server response body."}
    } else if (response && response.message) {
        msg += response.message;
    }
    displayMessage(resultSelector, msg, false);
}

// --- Load All Data ---
function loadAllAdminData() {
    getUomData();
    getCategoryData();
    getProductData();
    getRouteData();
    getCustomerData();
    getSupplierData();
    getWeekData();
}

// --- Populate Specific Dropdowns for Forms ---
function populateCategoryDropdownForProductForm(categories) {
    const select = document.getElementById('itmCategory'); // Original product form category select ID
    if (!select) return;
    select.innerHTML = '<option value="">-- Select Category --</option>'; // Clear and add default
    if (categories && categories.length > 0) {
        categories.forEach(cat => {
            if(cat.rec_status ==1){
                const option = document.createElement('option');
                option.value = cat.categoryType; // Use categoryType (PK) as value
                option.textContent = `${cat.categoryDesc} (${cat.categoryType})`; // Use categoryDesc as text
                select.appendChild(option);
            }
        });
    }
}
function populateUomDropdownForProductForm(uoms) {
    const select = document.getElementById('itmUoM'); // Original product form UoM select ID
    if (!select) return;
    select.innerHTML = '<option value="">-- Select UoM --</option>';
    if (uoms && uoms.length > 0) {
        uoms.forEach(uom => {
            if(uom.rec_status == 1){
                const option = document.createElement('option');
                option.value = uom.UoMID; // Use UoMID (PK) as value
                option.textContent = `${uom.UoM} (${uom.UoMID})`;
                select.appendChild(option);
            }
        });
    }
}
function populateRouteDropdownForCustomerForm(routes) {
    const select = document.getElementById('routeID'); // Original customer form route select ID
    if (!select) return;
    select.innerHTML = '<option value="">-- Select Route --</option>';
    if (routes && routes.length > 0) {
        routes.forEach(route => {
            if(route.rec_status == 1){
                const option = document.createElement('option');
                option.value = route.id; // Use id (PK) as value
                option.textContent = route.route; // Use route name as text
                select.appendChild(option);
            }
        });
    }
}

// --- UOM Section ---
function getUomData() {
    fetch('../knft/getUoM.php')
        .then(response => {
            if (!response.ok) throw response; // Pass non-ok responses to catch block
            return response.json();
        })
        .then(data => { // Expects array directly
            displayUomTable(data);
            populateUomDropdownForProductForm(data); // Populate dropdown after fetching
        })
        .catch(errorResponse => {
             handleFetchError(errorResponse, '#result-uom');
             const tbody = document.querySelector(".uom-body");
             if(tbody) tbody.innerHTML = '<tr><td colspan="3">Error loading UoM data.</td></tr>';
        });
}
function displayUomTable(uoms) {
    const tbody = document.querySelector(".uom-body");
    if (!tbody) return;
    tbody.innerHTML = ""; // Clear existing content
    if (!uoms || uoms.length === 0) { tbody.innerHTML = '<tr><td colspan="3">No UoMs found.</td></tr>'; return; }
    uoms.forEach(uom => {
        tbody.innerHTML += `
            <tr data-identifier="${uom.UoMID}">
                <th scope="row">${uom.UoMID || ''}</th>
                <td>${uom.UoM || ''}</td>
                <td>
                    <button class="btn btn-sm btn-danger edit-uom-btn" id="${uom.id}" data-id="${uom.UoMID}" data-name="${uom.UoM}"><img src="../public/Assets/edit.png" alt="Edit" class="icon-sm"></button>
                    <button class="btn btn-sm ${(uom.rec_status == 1) ? "btn-success": "btn-danger"} delete-uom-btn" id="${uom.id}"  data-id="${uom.UoMID}" data-name="${uom.UoM}"><img src="../public/Assets/delete.png" alt="Delete" class="icon-sm"></button>
                </td>
            </tr>`;
    });
}
function handleAddUom(e) {
    e.preventDefault();
    const uomIdInput = document.getElementById('UoMID');
    const uomNameInput = document.getElementById('UoM');
    const payload = {
        UoMID: uomIdInput.value.trim(),
        UoM: uomNameInput.value.trim()
    };
    if (!payload.UoMID || !payload.UoM) {
        displayMessage('#result-uom', 'UoM ID and Name are required.', false); return;
    }
    displayMessage('#result-uom', 'Adding...', true);

    fetch('../knft/submitUoM.php', { // Original endpoint
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
      })
      .then(response => {
          if (!response.ok) throw response; // Throw error for non-2xx responses
          return response.json(); // Expect JSON back
      })
      .then(data => { // data should be {success: true/false, message: '...'}
          displayMessage('#result-uom', data.message, data.success);
          if (data.success) {
              document.getElementById('uomForm').reset();
              getUomData();
          }
      })
      .catch(errorResponse => handleFetchError(errorResponse, '#result-uom'));
}
function handleEditUom(e) {
    const button = e.target.closest('.edit-uom-btn');
    const oldId = button.dataset.id;
    const oldName = button.dataset.name;

    const newId = prompt("Edit UoMID:", oldId);
    const newName = prompt("Edit UoM Name:", oldName);

    if (newId !== null && newName !== null && (newId.trim() !== oldId || newName.trim() !== oldName)) {
         if (!newId.trim() || !newName.trim()) {
             alert("UoM ID and Name cannot be empty."); return;
         }
        const payload = { oldUoMID: oldId, newUoMID: newId.trim(), UoM: newName.trim() };
        displayMessage('#result-uom', 'Saving...', true);

        fetch('../knft/editUoM.php', { // Original endpoint
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          })
          .then(response => { if (!response.ok) throw response; return response.json(); })
          .then(data => {
              displayMessage('#result-uom', data.message, data.success);
              if (data.success) { getUomData(); } // Refresh table
          })
          .catch(errorResponse => handleFetchError(errorResponse, '#result-uom'));
    }
}
function handleDeleteUom(e) {
    const button = e.target.closest('.delete-uom-btn');
    const id = button.id;
    const name = button.dataset.name;
    if (confirm(`Delete UoM: ${name} (${id})?\n(Action might fail if UoM is in use)`)) {
        displayMessage('#result-uom', 'Deleting...', true);
        fetch('../knft/deleteUoM.php', { // New endpoint needed
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: id }) // Send PK
          })
          .then(response => { if (!response.ok) throw response; return response.json(); })
          .then(data => {
              displayMessage('#result-uom', data.message, data.success);
              if (data.success) getUomData();
          })
          .catch(errorResponse => handleFetchError(errorResponse, '#result-uom'));
    }
}

// --- Category Section --- (Follow UOM pattern using fetch)
function getCategoryData() {
     fetch('../knft/getCategory.php')
        .then(response => { if (!response.ok) throw response; return response.json(); })
        .then(data => { displayCategoryTable(data); populateCategoryDropdownForProductForm(data); })
        .catch(errorResponse => { handleFetchError(errorResponse, '#result-category'); /*...*/ });
}
function displayCategoryTable(categories) {
    const tbody = document.querySelector(".category-body"); if(!tbody) return; tbody.innerHTML = "";
    if (!categories || categories.length === 0) { /*...*/ return; }
    categories.forEach(cat => {
        tbody.innerHTML += `
            <tr data-identifier="${cat.categoryType}">
                <th scope="row">${cat.categoryType}</th>
                <td>${cat.categoryDesc}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-category-btn" id="${cat.categoryID}" data-id="${cat.categoryType}" data-desc="${cat.categoryDesc}"><img src="../public/Assets/edit.png" class="icon-sm"></button>
                    <button class="btn btn-sm ${(cat.rec_status ==1) ? "btn-success":"btn-danger"} delete-category-btn" id="${cat.categoryID}" data-id="${cat.categoryType}" data-name="${cat.categoryDesc}"><img src="../public/Assets/delete.png" class="icon-sm"></button>
                </td>
            </tr>`;
    });
}
// populateCategoryDropdownForProductForm is defined above and called within getCategoryData success
function handleAddCategory(e) {
    e.preventDefault();
    const payload = { categoryType: document.getElementById('categoryType').value.trim(), categoryDesc: document.getElementById('categoryDesc').value.trim() };
     if (!payload.categoryType || !payload.categoryDesc) { displayMessage('#result-category', '...', false); return; }
    displayMessage('#result-category', 'Adding...', true);
    fetch('../knft/submitCategory.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
        .then(response => { if (!response.ok) throw response; return response.json(); })
        .then(data => {
            displayMessage('#result-category', data.message, data.success);
            if(data.success){ document.getElementById('categoryForm').reset(); getCategoryData();}
        })
        .catch(errorResponse => handleFetchError(errorResponse, '#result-category'));
}
function handleEditCategory(e) {
    const button = e.target.closest('.edit-category-btn');
    const oldType = button.dataset.id; const oldDesc = button.dataset.desc;
    const newType = prompt('Edit Category Type:', oldType); const newDesc = prompt('Edit Category Description:', oldDesc);
    if (newType !== null && newDesc !== null && (newType.trim() !== oldType || newDesc.trim() !== oldDesc)) {
        if (!newType.trim() || !newDesc.trim()) { alert("..."); return; }
        const payload = { oldCategoryType: oldType, newCategoryType: newType.trim(), newCategoryDesc: newDesc.trim() };
        displayMessage('#result-category', 'Saving...', true);
        fetch('../knft/editCategory.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
            .then(response => { if (!response.ok) throw response; return response.json(); })
            .then(data => { displayMessage('#result-category', data.message, data.success); if(data.success) getCategoryData(); })
            .catch(errorResponse => handleFetchError(errorResponse, '#result-category'));
    }
}
function handleDeleteCategory(e) {
    const button = e.target.closest('.delete-category-btn');
    const id = button.id; const name = button.dataset.name;
    if (confirm(`Delete Category: ${name} (${id})?\n(Check products)`)) {
        displayMessage('#result-category', 'Deleting...', true);
        fetch('../knft/deleteCategory.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ categoryType: id }) }) // New endpoint needed
            .then(response => { if (!response.ok) throw response; return response.json(); })
            .then(data => { displayMessage('#result-category', data.message, data.success); if(data.success) getCategoryData(); })
            //.catch(errorResponse => handleFetchError(errorResponse, '#result-category'));
    }
}

// --- Product Section --- (Using fetch)
function getProductData() {
     fetch('../knft/getProduct.php') // Original endpoint
        .then(response => { if (!response.ok) throw response; return response.json(); })
        .then(data => { // Expects { data: [...] }
            displayProductTable(data.data || []); // Handle cases where data might be missing
         })
        .catch(errorResponse => { handleFetchError(errorResponse, '#result-product'); /*...*/ });
}
function displayProductTable(products) {
    const tbody = document.querySelector(".product-body"); if(!tbody) return; tbody.innerHTML = "";
    if (!products || products.length === 0) { /*...*/ return; }
    products.forEach(prod => {
         const price = prod.price != null ? parseFloat(prod.price).toFixed(2) : 'N/A';
        tbody.innerHTML += `
            <tr data-identifier="${prod.prod_id}">
                <td>${prod.prod_id || ''}</td>
                <td>${prod.category_id || ''}</td>
                <td>${prod.product || ''}</td>
                <td>${prod.UoM_id || ''}</td>
                <td>${price}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-product-btn" id="${prod.prod_id}" data-id="${prod.prod_id}" data-name="${prod.product||''}" data-categoryid="${prod.category_id||''}" data-uomid="${prod.UoM_id||''}" data-price="${prod.price||''}"><img src="../public/Assets/edit.png" class="icon-sm"></button>
                    <button class="btn btn-sm ${(prod.rec_status == 1) ? "btn-success": "btn-danger"}  delete-product-btn" id="${prod.prod_id}" data-id="${prod.prod_id}" data-name="${prod.product}"><img src="../public/Assets/delete.png" class="icon-sm"></button>
                </td>
            </tr>`;
    });
}
function validateProductForm() { /* Keep your original validation */ return true; }
function handleAddProduct(e) {
     e.preventDefault();
     if (!validateProductForm()) return;
     const payload = {
         category_id: document.querySelector("#itmCategory").value,
         product: document.querySelector("#itmProduct").value.trim(),
         UoM_id: document.querySelector("#itmUoM").value,
         price: parseInt(document.querySelector("#itmRate").value)
     };
     displayMessage('#result-product', 'Adding...', true);
     fetch('../knft/submitProduct.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
        .then(response => { if (!response.ok) throw response; return response.json(); })
        .then(data => {
            displayMessage('#result-product', data.message, data.success);
            if(data.success){
                 document.querySelector("#itmProduct").value = ''; document.querySelector("#itmRate").value = '';
                 document.querySelector("#itmCategory").value = ''; document.querySelector("#itmUoM").value = '';
                 getProductData();
             }
        })
        .catch(errorResponse => handleFetchError(errorResponse, '#result-product'));
}
function handleEditProduct(e) {
     const button = e.target.closest('.edit-product-btn');
     const prodId = button.dataset.id;
     const currentName = button.dataset.name;
     const currentCatId = button.dataset.categoryid;
     const currentUomId = button.dataset.uomid;
     const currentPrice = button.dataset.price;

     const newCatId = prompt("Edit Category ID:", currentCatId);
     const newName = prompt("Edit Product Name:", currentName);
     const newUomId = prompt("Edit UoM ID:", currentUomId);
     const newPrice = prompt("Edit Price:", currentPrice);

    if (newCatId !== null && newName !== null && newUomId !== null && newPrice !== null) {
         if (!newCatId.trim() || !newName.trim() || !newUomId.trim() || !newPrice.trim() || isNaN(parseInt(newPrice))) { /*...*/ return; }
        const payload = { prod_id: prodId, category_id: newCatId.trim(), product: newName.trim(), UoM_id: newUomId.trim(), price: parseInt(newPrice) };
        displayMessage('#result-product', 'Saving...', true);
        fetch('../knft/editProducts.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
            .then(response => { if (!response.ok) throw response; return response.json(); })
            .then(data => { displayMessage('#result-product', data.message, data.success); if(data.success) getProductData(); })
            .catch(errorResponse => handleFetchError(errorResponse, '#result-product'));
    }
}
function handleDeleteProduct(e) {
    const button = e.target.closest('.delete-product-btn');
    const id = button.id; const name = button.dataset.name;
    if (confirm(`Delete Product: ${name} (${id})?\n(Check inventory/orders)`)) {
        displayMessage('#result-product', 'Deleting...', true);
        fetch('../knft/deleteProduct.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({prod_id: id}) }) // New endpoint needed
             .then(response => { if (!response.ok) throw response; return response.json(); })
             .then(data => { displayMessage('#result-product', data.message, data.success); if(data.success) getProductData(); })
             .catch(errorResponse => handleFetchError(errorResponse, '#result-product'));
    }
}

// --- Route Section --- (Using fetch)
function getRouteData() {
     fetch('../knft/getRoutes.php')
        .then(response => { if (!response.ok) throw response; return response.json(); })
        .then(data => { displayRouteTable(data); populateRouteDropdownForCustomerForm(data); })
        .catch(errorResponse => { handleFetchError(errorResponse, '#result-route'); /*...*/ });
}
function displayRouteTable(routes) {
    const tbody = document.querySelector(".route-body"); if(!tbody) return; tbody.innerHTML = "";
    if(!routes || routes.length === 0) { /*...*/ return; }
    routes.forEach(route => {
         const rate = route.rate != null ? parseFloat(route.rate).toFixed(2) : 'N/A';
        tbody.innerHTML += `
            <tr data-identifier="${route.id}">
                <td>${route.route || ''}</td>
                <td>${route.deliveryType || ''}</td>
                <td>${rate}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-route-btn" data-id="${route.id}" data-route="${route.route||''}" data-type="${route.deliveryType||''}" data-rate="${route.rate||''}"><img src="../public/Assets/edit.png" class="icon-sm"></button>
                    <button class="btn btn-sm ${(route.rec_status==1) ? "btn-success": "btn-danger"} delete-route-btn" data-id="${route.id}" data-name="${route.route}"><img src="../public/Assets/delete.png" class="icon-sm"></button>
                </td>
            </tr>`;
    });
}
// populateRouteDropdownForCustomerForm defined above
function handleAddRoute(e) {
    e.preventDefault();
    const payload = {
        route: document.getElementById('route').value.trim(),
        deliveryType: document.querySelector('input[name="deliveryType"]:checked')?.value, // Add null check
        rate: document.getElementById('rate').value
    };
     if (!payload.route || !payload.deliveryType || payload.rate === '' || isNaN(parseFloat(payload.rate))) { /*...*/ return; }
    displayMessage('#result-route', 'Adding...', true);
    fetch('../knft/submitRoute.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
        .then(response => { if (!response.ok) throw response; return response.json(); })
        .then(data => { displayMessage('#result-route', data.message, data.success); if(data.success){ document.getElementById('routeForm').reset(); getRouteData();} })
        .catch(errorResponse => handleFetchError(errorResponse, '#result-route'));
}
function handleEditRoute(e) {
     const button = e.target.closest('.edit-route-btn');
     const oldId = button.dataset.id; const oldRouteName = button.dataset.route;
     const oldType = button.dataset.type; const oldRate = button.dataset.rate;
     const newRouteName = prompt("Edit Route Name:", oldRouteName);
     const newType = prompt("Edit Delivery Type (PD/VD):", oldType);
     const newRate = prompt("Edit Rate:", oldRate);
     if (newRouteName !== null && newType !== null && newRate !== null) {
        if (!newRouteName.trim() || !newType.trim() || newRate === '' || isNaN(parseFloat(newRate))) { /*...*/ return; }
         // Assuming editRoutes.php expects oldRoute *name* like original JS, but ID is better.
         // Sending both just in case PHP uses name. PHP should prefer ID if available.
         const payload = { oldRoute: oldRouteName, routeID: oldId, newRoute: newRouteName.trim(), newDeliveryType: newType.trim().toUpperCase(), newRate: parseFloat(newRate) };
         displayMessage('#result-route', 'Saving...', true);
         fetch('../knft/editRoutes.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
             .then(response => { if (!response.ok) throw response; return response.json(); })
             .then(data => { displayMessage('#result-route', data.message, data.success); if(data.success) getRouteData(); })
             .catch(errorResponse => handleFetchError(errorResponse, '#result-route'));
     }
}
function handleDeleteRoute(e) {
     const button = e.target.closest('.delete-route-btn');
     const id = button.dataset.id; const name = button.dataset.name;
     if (confirm(`Delete Route: ${name} (${id})?\n(Check customers)`)) {
         displayMessage('#result-route', 'Deleting...', true);
         fetch('../knft/deleteRoute.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id: id}) }) // New endpoint needed, send ID
              .then(response => { if (!response.ok) throw response; return response.json(); })
              .then(data => { displayMessage('#result-route', data.message, data.success); if(data.success) { getRouteData(); populateRouteDropdownForCustomerForm(); } })
              .catch(errorResponse => handleFetchError(errorResponse, '#result-route'));
     }
}

// --- Customer Section --- (Using fetch)
function getCustomerData() {
     fetch('../knft/getCustomer.php')
        .then(response => { if (!response.ok) throw response; return response.json(); })
        .then(data => displayCustomerTable(data))
        .catch(errorResponse => { handleFetchError(errorResponse, '#result-customer'); /*...*/ });
}
function displayCustomerTable(customers) {
     const tbody = document.querySelector(".customer-body"); if(!tbody) return; tbody.innerHTML = "";
     if(!customers || customers.length === 0) { /*...*/ return; }
     customers.forEach(cust => {
         tbody.innerHTML += `
             <tr data-identifier="${cust.emailId}">
                <td>${cust.customerName || ''}</td>
                <td>${cust.routeID || ''}</td>
                <td>${cust.contact || ''}</td>
                <td>${cust.alternativeContact || ''}</td>
                <td>${cust.address || ''}</td>
                <td>${cust.emailId || ''}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-customer-btn" data-email="${cust.emailId}"><img src="../public/Assets/edit.png" class="icon-sm"></button>
                    <button class="btn btn-sm ${(cust.rec_status==1) ? "btn-success": "btn-danger"} delete-customer-btn" id="${cust.emailId}" data-name="${cust.customerName}"><img src="../public/Assets/delete.png" class="icon-sm"></button>
                </td>
            </tr>`;
     });
}
function handleAddCustomer(e) {
    e.preventDefault();
    const form = document.getElementById('customerForm');
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries()); // Convert FormData to object

     if (!payload.emailID || !payload.password || !payload.customerName || !payload.contact || !payload.routeID) {
         displayMessage('#result-customer', 'Name, Route, Contact, Email, and Password required.', false); return;
    }
    displayMessage('#result-customer', 'Registering...', true);

    // Combine calls using Promise.all for better handling
    Promise.all([
        fetch('../knft/submitCustomer.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }).then(res => res.ok ? res.json() : res.text().then(text => { throw new Error("Customer Submit Failed: "+ text)})),
        fetch('../knft/submitCustomerAcc.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }).then(res => res.ok ? res.json() : res.text().then(text => { throw new Error("Account Submit Failed: "+ text)}))
    ])
    .then(([resCust, resAcc]) => {
         // Assuming PHP returns {success: true/false, message: '...'}
         if (resCust.success && resAcc.success) {
             displayMessage('#result-customer', 'Customer registered successfully!', true);
             form.reset();
             getCustomerData();
         } else {
             // Combine error messages or provide a generic one
             let combinedMsg = `Customer: ${resCust.message || 'Unknown Status'}. Account: ${resAcc.message || 'Unknown Status'}`;
             displayMessage('#result-customer', combinedMsg, false);
         }
    })
    .catch(error => {
         console.error("Combined registration error:", error);
         displayMessage('#result-customer', "Error during registration: " + error.message, false);
    });
}
function handleEditCustomer(e) {
    const button = e.target.closest('.edit-customer-btn');
    const oldEmail = button.dataset.email;
    // Use prompts like original
    const name = prompt("Edit Customer Name:"); // Pre-fill requires fetching current data first
    const route = prompt("Edit Route ID:");
    const contact = prompt("Edit Contact:");
    const altContact = prompt("Edit Alt Contact:");
    const address = prompt("Edit Address:");
    const newEmail = prompt("Edit Email ID:", oldEmail);

    if (name !== null && route !== null && contact !== null && altContact !== null && address !== null && newEmail !== null) {
        if (!name.trim() || !route.trim() || !contact.trim() || !address.trim() || !newEmail.trim()) { alert("..."); return; }
        const payload = { oldEmailID: oldEmail, customerName: name.trim(), routeID: route.trim(), contact: contact.trim(), alternativeContact: altContact.trim(), address: address.trim(), newEmailID: newEmail.trim() };
        displayMessage('#result-customer', 'Saving...', true);
        fetch('../knft/editCustomer.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
            .then(response => { if (!response.ok) throw response; return response.json(); })
            .then(data => { displayMessage('#result-customer', data.message, data.success); if(data.success) getCustomerData(); })
            .catch(errorResponse => handleFetchError(errorResponse, '#result-customer'));
    }
}
function handleDeleteCustomer(e) {
     const button = e.target.closest('.delete-customer-btn');
     const email = button.id; const name = button.dataset.name;
     if (confirm(`Delete Customer: ${name} (${email})? \n(This will also delete their login account)`)) {
         displayMessage('#result-customer', 'Deleting...', true);
         fetch('../knft/deleteCustomer.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({emailID: email}) }) // New endpoint needed
             .then(response => { if (!response.ok) throw response; return response.json(); })
             .then(data => { displayMessage('#result-customer', data.message, data.success); if(data.success) getCustomerData(); })
             .catch(errorResponse => handleFetchError(errorResponse, '#result-customer'));
     }
}

// --- Supplier Section --- (Using fetch)
function getSupplierData() {
     fetch('../knft/getSupplier.php')
        .then(response => { if (!response.ok) throw response; return response.json(); })
        .then(data => displaySupplierTable(data))
        .catch(errorResponse => { handleFetchError(errorResponse, '#result-supplier'); /*...*/ });
}
function displaySupplierTable(suppliers) {
     const tbody = document.querySelector(".supplier-body"); if(!tbody) return; tbody.innerHTML = "";
      if(!suppliers || suppliers.length === 0) { /*...*/ return; }
     suppliers.forEach(sup => {
         tbody.innerHTML += `
             <tr data-identifier="${sup.emailID}">
                <td>${sup.supplierName || ''}</td>
                <td>${sup.farmLocation || ''}</td>
                <td>${sup.contact || ''}</td>
                <td>${sup.alternativeContact || ''}</td>
                <td>${sup.farmSize || ''}</td>
                <td>${sup.emailID || ''}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-supplier-btn" data-email="${sup.emailID}"><img src="../public/Assets/edit.png" class="icon-sm"></button>
                    <button class="btn btn-sm ${(sup.rec_status==1) ? "btn-success": "btn-danger"} delete-supplier-btn" id="${sup.emailID}" data-name="${sup.supplierName}"><img src="../public/Assets/delete.png" class="icon-sm"></button>
                </td>
            </tr>`;
     });
}
function handleAddSupplier(e) {
    e.preventDefault();
    const form = document.getElementById('supplierForm');
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    // Validation...
    displayMessage('#result-supplier', 'Registering...', true);
    // Combine calls
    Promise.all([
        fetch('../knft/submitSupplier.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }).then(res => res.ok ? res.json() : res.text().then(text => { throw new Error("Supplier Submit Failed: "+ text)})),
        fetch('../knft/submitSupplierAcc.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }).then(res => res.ok ? res.json() : res.text().then(text => { throw new Error("Account Submit Failed: "+ text)}))
    ])
    .then(([resSupp, resAcc]) => {
        if (resSupp.success && resAcc.success) {
            displayMessage('#result-supplier', 'Supplier registered successfully!', true);
            form.reset();
            getSupplierData();
        } else { /* ... handle combined error ... */ }
    })
    .catch(error => { handleFetchError({ statusText: error.message, status: 500, text: async () => error.message }, '#result-supplier'); });
}
function handleEditSupplier(e) {
     const button = e.target.closest('.edit-supplier-btn');
     const oldEmail = button.dataset.email;
     // Use prompts like original
     const name = prompt("Edit Supplier Name:"); const location = prompt("Edit Farm Location:");
     const contact = prompt("Edit Contact:"); const altContact = prompt("Edit Alt Contact:");
     const size = prompt("Edit Farm Size:"); const newEmail = prompt("Edit Email ID:", oldEmail);
     if (name !== null && location !== null && contact !== null && altContact !== null && size !== null && newEmail !== null) {
         if (!name.trim() || !location.trim() || !contact.trim() || !size.trim() || !newEmail.trim()) { alert("..."); return; }
         const payload = { oldEmailID: oldEmail, supplierName: name.trim(), farmLocation: location.trim(), contact: contact.trim(), alternativeContact: altContact.trim(), farmSize: size.trim(), newEmailID: newEmail.trim() };
         displayMessage('#result-supplier', 'Saving...', true);
         fetch('../knft/editSupplier.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
             .then(response => { if (!response.ok) throw response; return response.json(); })
             .then(data => { displayMessage('#result-supplier', data.message, data.success); if(data.success) getSupplierData(); })
             .catch(errorResponse => handleFetchError(errorResponse, '#result-supplier'));
     }
}
function handleDeleteSupplier(e) {
    const button = e.target.closest('.delete-supplier-btn');
    const email = button.id; const name = button.dataset.name;
     if (confirm(`Delete Supplier: ${name} (${email})?\n(Also deletes login account)`)) {
         displayMessage('#result-supplier', 'Deleting...', true);
         fetch('../knft/deleteSupplier.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({id: email}) }) // New endpoint needed
             .then(response => { if (!response.ok) throw response; return response.json(); })
             .then(data => { displayMessage('#result-supplier', data.message, data.success); if(data.success) getSupplierData(); })
             .catch(errorResponse => handleFetchError(errorResponse, '#result-supplier'));
     }
}

// --- Week Section --- (Using fetch)
function getWeekData() {
     fetch('../knft/getWeek.php')
        .then(response => { if (!response.ok) throw response; return response.json(); })
        .then(data => displayWeekTable(data))
        .catch(errorResponse => { handleFetchError(errorResponse, '#result-week'); /*...*/ });
}
function displayWeekTable(weeks) {
    const tbody = document.querySelector(".week-body"); if(!tbody) return; tbody.innerHTML = "";
    const dropdownweek = document.querySelector("#weekDropdown");
    dropdownweek.innerHTML = ""; // Clear existing options
    if (!weeks || weeks.length === 0) { /*...*/ return; }
    weeks.forEach(week => {
        tbody.innerHTML += `
            <tr data-identifier="${week.weekID}">
                <th scope="row">${week.weekID}</th>
                <td>${week.weekdate}</td>
                <td>
                    <button class="btn btn-sm btn-warning edit-week-btn" data-id="${week.weekID}" data-date="${week.weekdate}"><img src="../public/Assets/edit.png" class="icon-sm"></button>
                    <button class="btn btn-sm btn-danger delete-week-btn" data-id="${week.weekID}" data-date="${week.weekdate}"><img src="../public/Assets/delete.png" class="icon-sm"></button>
                </td>
            </tr>`;
        dropdownweek.innerHTML += `<option value="${week.weekID}">${week.weekdate}</option>`;
    });
}
function handleAddWeek(e) {
    e.preventDefault();
    const payload = { weekdate: document.getElementById('weekDate').value }; // YYYY-MM-DD
    if (!payload.weekdate) { displayMessage('#result-week', 'Week date is required.', false); return; }
    displayMessage('#result-week', 'Adding...', true);
    fetch('../knft/submitWeek.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
        .then(response => { if (!response.ok) throw response; return response.json(); })
        .then(data => { displayMessage('#result-week', data.message, data.success); if(data.success){ document.getElementById('weekForm').reset(); getWeekData();} })
        .catch(errorResponse => handleFetchError(errorResponse, '#result-week'));
}
function handleEditWeek(e) {
     const button = e.target.closest('.edit-week-btn');
     const weekId = button.dataset.id; const oldDate = button.dataset.date;
     const newDate = prompt("Edit Week Date (YYYY-MM-DD):", oldDate);
     if (newDate !== null) {
         if (!newDate.trim() || !/^\d{4}-\d{2}-\d{2}$/.test(newDate.trim())) { alert("..."); return; }
         const payload = { weekID: weekId, weekdate: newDate.trim() };
         displayMessage('#result-week', 'Saving...', true);
         fetch('../knft/editWeek.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
             .then(response => { if (!response.ok) throw response; return response.json(); })
             .then(data => { displayMessage('#result-week', data.message, data.success); if(data.success) getWeekData(); })
             .catch(errorResponse => handleFetchError(errorResponse, '#result-week'));
     }
}
function handleDeleteWeek(e) {
     const button = e.target.closest('.delete-week-btn');
     const id = button.dataset.id; const date = button.dataset.date;
     if (confirm(`Delete Week: ${date} (ID: ${id})?\n(Check inventory/orders)`)) {
         displayMessage('#result-week', 'Deleting...', true);
         fetch('../knft/deleteWeek.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({weekID: id}) }) // New endpoint needed
              .then(response => { if (!response.ok) throw response; return response.json(); })
              .then(data => { displayMessage('#result-week', data.message, data.success); if(data.success) getWeekData(); })
              .catch(errorResponse => handleFetchError(errorResponse, '#result-week'));
     }
}
async function buttonLockToggle(e) {
    e.preventDefault();
    const btn = document.getElementById('lockButton');
    if (!btn) return;
    promptAndUpdateCustomMessage();
    // Toggle lock status
    try {
        // Call the toggle API
        const toggleResponse = await fetch('../knft/editUserLock.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const toggleData = await toggleResponse.json();

        // Now get the current status
        const statusResponse = await fetch('../knft/getUserLock.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const statusData = await statusResponse.json();

        let status = (typeof statusData.Status !== "undefined") ? parseInt(statusData.Status, 10) : 0;

        // Update button color and text
        if (status === 1) {
            btn.classList.remove('btn-success');
            btn.classList.add('btn-danger');
            btn.textContent = 'User Lock: ON';
        } else {
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-success');
            btn.textContent = 'User Lock: OFF';
        }
    } catch (error) {
        console.error('Error toggling user lock:', error);
    }
}
async function promptAndUpdateCustomMessage() {
    // Show prompt to user
    const newMessage = prompt("Enter the new custom message for users:     (cancel for previous message to stay)");
    if (newMessage === null) return; // User cancelled

    if (!newMessage.trim()) {
        alert("Message cannot be empty.");
        return;
    }

    try {
        // Send to PHP
        const response = await fetch('../knfts/editMessage.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: newMessage })
        });
        const data = await response.json();

        if (data.success) {
            alert("Custom message updated successfully!");
            document.getElementById('lock-message').innerText = newMessage; // Update displayed message
        } else {
            alert("Failed to update message: " + (data.message || "Unknown error"));
        }
    } catch (error) {
        console.warn("Error updating custom message:", error);
        alert("Error updating custom message. See console for details.");
    }
}
async function initialiseLockButton() {
    const btn = document.getElementById('lockButton');
    if (!btn) return;

    try {
        const statusResponse = await fetch('../knft/getUserLock.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const statusData = await statusResponse.json();
        let status = (typeof statusData.Status !== "undefined") ? parseInt(statusData.Status, 10) : 0;

        if (status === 1) {
            btn.classList.remove('btn-success');
            btn.classList.add('btn-danger');
            btn.textContent = 'User Lock: ON';
        } else {
            btn.classList.remove('btn-danger');
            btn.classList.add('btn-success');
            btn.textContent = 'User Lock: OFF';
        }
    } catch (error) {
        console.error('Error fetching initial user lock status:', error);
    }
}
function Fullfillform() {
    const form = document.getElementById('fullfillweekForm');
    const weekDropdown = document.getElementById('weekDropdown');
    const fulfillBody = document.querySelector('.fulfill-body');

    if (form && weekDropdown && fulfillBody) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            const week_id = weekDropdown.value;
            console.log("Selected Week ID:", week_id);
            const get_mode = document.querySelector('input[name="get_mode"]:checked')?.value || 0; // Default to 'all' if not selected
            if (!week_id) return;

            fulfillBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading...</td></tr>';

            try {
                const response = await fetch('../knft/getOrderFullfill.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ week_id: week_id , get_mode: get_mode })
                });
                const data = await response.json();
                if (data.success && Array.isArray(data.orders)) {
                    loadFulfillTable(data.orders);
                } else {
                    loadFulfillTable([]);
                }
            } catch (error) {
                fulfillBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading data.</td></tr>';
                console.error(error);
            }
        });
    }
};

function loadFulfillTable(data) {
    const fulfillBody = document.querySelector('.fulfill-body');
    if (!fulfillBody) return;

    if (Array.isArray(data) && data.length > 0) {
        fulfillBody.innerHTML = '';
        data.forEach(order => {
            fulfillBody.innerHTML += `
                <tr>
                    <td>${order.rec_date_time || ''}</td>
                    <td>${order.customerName || ''}</td>
                    <td>${order.product || ''}</td>
                    <td>${order.quantity} @ ₹${order.rate}</td>
                    <td>
                        <input type="number" min="0" value="${order.quantity}" class="form-control form-control-sm fulfill-qty" data-id="${order.id}">
                    </td>
                    <td>
                        <button class="btn btn-primary btn-sm update-fulfill" data-id="${order.id}">Update</button>
                    </td>
                </tr>
            `;
        });
    } else {
        fulfillBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No orders found for this week.</td></tr>';
    }
}
function editFulfillListener() {

    const fulfillBody = document.querySelector('.fulfill-body');
    if (fulfillBody) {
        fulfillBody.addEventListener('click', async function(e) {
            const btn = e.target.closest('.update-fulfill');
            if (!btn) return;

            const id = btn.getAttribute('data-id');
            const qtyInput = btn.closest('tr').querySelector('.fulfill-qty');
            const quantity = qtyInput ? parseInt(qtyInput.value, 10) : null;
            const weekDropdown = document.getElementById('weekDropdown');
            const week_id = weekDropdown ? weekDropdown.value : null;
            const get_mode = document.querySelector('input[name="get_mode"]:checked')?.value || 0; // Default to 'all' if not selected
            if (!id || quantity === null || !week_id) return;

            btn.disabled = true;
            btn.textContent = 'Updating...';

            try {
                const response = await fetch('../knft/editFulfillment.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: id, quantity: quantity })
                });
                const data = await response.json();

                if (data.success) {
                    // Reload the table for the current week
                    const reloadResponse = await fetch('../knft/getOrderFullfill.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ week_id: week_id , get_mode: get_mode })
                    });
                    const reloadData = await reloadResponse.json();
                    loadFulfillTable(reloadData.orders || []);
                } else {
                    alert(data.message || 'Update failed');
                }
            } catch (error) {
                alert('Error updating fulfillment');
                console.error(error);
            } finally {
                btn.disabled = false;
                btn.textContent = 'Update';
            }
        });
    }
};
// Fetch farmer rank data from the server
async function getFarmerRankData() {
    try {
        const response = await fetch('../knft/getFarmerRank.php', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.ranks)) {
            renderFarmerRankTable(data.ranks);
        } else {
            renderFarmerRankTable([]);
        }
    } catch (error) {
        console.error('Error fetching farmer rank data:', error);
        renderFarmerRankTable([]);
    }
}

// Render the farmer rank table with product grouping
function renderFarmerRankTable(ranks) {
    const tbody = document.querySelector('.farmer-rank-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!ranks || ranks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No farmer rank data found.</td></tr>';
        return;
    }

    // Group by product_name
    const grouped = {};
    ranks.forEach(row => {
        if (!grouped[row.product_name]) grouped[row.product_name] = [];
        grouped[row.product_name].push(row);
    });

    // Render rows with rowspan for product_name
    Object.keys(grouped).forEach(product => {
        const farmers = grouped[product];
        farmers.forEach((row, idx) => {
            tbody.innerHTML += `
                <tr>
                    ${idx === 0 ? `<td rowspan="${farmers.length}" class="align-middle fw-bold">${product}</td>` : ''}
                    <td>${row.farmer_name || ''}</td>
                    <td>${row.rank || ''}</td>
                    <td>
                        <input type="number" min="1" value="${row.rank}" class="form-control form-control-sm new-rank-input" id="rankfill${row.id}" data-id="${row.id}">
                    </td>
                    <td>
                        <button class="btn btn-primary btn-sm update-rank-btn" data-id="${row.id}">Update</button>
                    </td>
                </tr>
            `;
        });
    });
}
function editFarmerRankListener() {
    const tbody = document.querySelector('.farmer-rank-body');
    if (!tbody) return;

    tbody.addEventListener('click', async function(e) {
        const btn = e.target.closest('.update-rank-btn');
        if (!btn) return;

        const id = btn.getAttribute('data-id');
        const input = document.querySelector('#rankfill' + id);
        if (!input) return; // Ensure input exists
        const newRank = parseInt(input.value, 10) || 0;
        if (!id || newRank === 0 || isNaN(newRank)) return;

        btn.disabled = true;
        btn.textContent = 'Updating...';
        console.log(`Updating rank for ID: ${id}, New Rank: ${newRank}`);
        try {
            const response = await fetch('../knft/editFarmerRank.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id, rank: newRank })
            });
            const data = await response.json();

            if (data.success) {
                // Reload the farmer rank data
                getFarmerRankData();
            } else {
                alert(data.message || 'Update failed');
            }
        } catch (error) {
            alert('Error updating farmer rank');
            console.error(error);
        } finally {
            btn.disabled = false;
            btn.textContent = 'Update';
        }
    });
}
// Fetch and display tray status table
async function getTrayStatusData() {
    try {
        const response = await fetch('../knft/getTrayStatus.php', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
            renderTrayStatusTable(data.data);
        } else {
            renderTrayStatusTable([]);
        }
    } catch (error) {
        console.error('Error fetching tray status data:', error);
        renderTrayStatusTable([]);
    }
}

function renderTrayStatusTable(rows) {
    const tbody = document.querySelector('.tray-status-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!rows || rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No tray status data found.</td></tr>';
        return;
    }

    rows.forEach(row => {
        tbody.innerHTML += `
            <tr>
                <td>${row.customerName }</td>
                <td>${row.route }</td>
                <td>
                    <span class="badge ${row.trayStatus == 1 ? 'bg-success' : 'bg-danger'}">
                        ${row.trayStatus == 1 ? 'Returned' : 'Not Returned'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-${row.trayStatus == 1 ? 'danger' : 'success'} btn-sm toggle-tray-btn" data-id="${row.id}">
                        ${row.trayStatus == 1 ? 'Mark Not Returned' : 'Mark Returned'}
                    </button>
                </td>
            </tr>
        `;
    });
}
// Attach event delegation for toggle-tray-btn
function editTrayStatusListener() {
    const tbody = document.querySelector('.tray-status-body');
    if (!tbody) return;

    tbody.addEventListener('click', async function(e) {
        const btn = e.target.closest('.toggle-tray-btn');
        if (!btn) return;

        const id = btn.getAttribute('data-id');
        if (!id) return;

        btn.disabled = true;
        btn.textContent = 'Updating...';
        console.log(`Toggling tray status for ID: ${id}`);

        try {
            const response = await fetch('../knft/editTrayStatus.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });
            const data = await response.json();

            if (data.success) {
                // Reload the tray status table
                getTrayStatusData();
            } else {
                alert(data.message || 'Failed to update tray status');
            }
        } catch (error) {
            alert('Error updating tray status');
            console.error(error);
        } finally {
            btn.disabled = false;
            btn.textContent = (btn.classList.contains('btn-danger')) ? 'Mark Not Returned' : 'Mark Returned';
        }
    });
}