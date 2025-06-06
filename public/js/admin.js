document.addEventListener('DOMContentLoaded', function() {
    // --- Initial Data Loading ---
    loadAllAdminData(); // Load data for all admin sections
    initialiseLockButton();
    // --- Event Listeners ---
    document.getElementById('lockButton')?.addEventListener('click', buttonLockToggle);

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
            try {
                const errJson = JSON.parse(errorText);
                if (errJson && errJson.message) {
                    msg += errJson.message;
                } else if (errorText) {
                    msg += "Details: " + errorText.substring(0, 150) + (errorText.length > 150 ? '...' : '');
                }
            } catch (e) {
                if (errorText) {
                    msg += "Details: " + errorText.substring(0, 150) + (errorText.length > 150 ? '...' : '');
                }
            }
        } catch (e) {
            msg += "Error reading error response body.";
        }
    } else if (response && response.message) {
        msg += response.message;
    } else {
        msg += "Unknown error.";
    }

    if (resultSelector) {
        displayMessage(resultSelector, msg, false);
    } else {
        alert("Fetch Error: " + msg);
    }
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

// Call this after DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    
});