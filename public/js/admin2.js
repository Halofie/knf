$(document).ready(function() {

    // --- Initial Data Loading ---
    fetchAdminDetails(); // Fetch admin name for top bar
    fetchCurrentWeekForDisplay(); // Fetch current week for top bar display only
    loadAllAdminData(); // Load data for all admin sections

    // --- Event Listeners ---

    // Form Submissions (Add New)
    $('#uomForm').on('submit', handleAddUom);
    $('#categoryForm').on('submit', handleAddCategory);
    $('.ADDPRODUCT').on('click', handleAddProduct); // Product uses a button, not form submit
    $('#routeForm').on('submit', handleAddRoute);
    $('#customerForm').on('submit', handleAddCustomer); // Uses the already refactored PHP
    $('#supplierForm').on('submit', handleAddSupplier); // Uses the already refactored PHP
    $('#weekForm').on('submit', handleAddWeek);

    // Edit Button Clicks (requires edit modals in admin.html)
    $('.uomHolder').on('click', '.edit-uom-btn', handleEditUomClick);
    $('.categoryHolder').on('click', '.edit-category-btn', handleEditCategoryClick);
    $('.productHolder').on('click', '.edit-product-btn', handleEditProductClick);
    $('.routeHolder').on('click', '.edit-route-btn', handleEditRouteClick);
    $('.customerHolder').on('click', '.edit-customer-btn', handleEditCustomerClick);
    $('.supplierHolder').on('click', '.edit-supplier-btn', handleEditSupplierClick);
    $('.weekHolder').on('click', '.edit-week-btn', handleEditWeekClick);

    // Save Changes Button Clicks (inside modals)
    // IMPORTANT: Add these modals to your admin.html file!
    $('body').on('click', '#uomEditModal .save-uom-btn', handleSaveUom);
    $('body').on('click', '#categoryEditModal .save-category-btn', handleSaveCategory);
    $('body').on('click', '#productEditModal .save-product-btn', handleSaveProduct);
    $('body').on('click', '#routeEditModal .save-route-btn', handleSaveRoute);
    $('body').on('click', '#customerEditModal .save-customer-btn', handleSaveCustomer);
    $('body').on('click', '#supplierEditModal .save-supplier-btn', handleSaveSupplier);
    $('body').on('click', '#weekEditModal .save-week-btn', handleSaveWeek);


    // Delete Button Clicks (using event delegation)
    $('.uomHolder').on('click', '.delete-uom-btn', handleDeleteUom);
    $('.categoryHolder').on('click', '.delete-category-btn', handleDeleteCategory);
    $('.productHolder').on('click', '.delete-product-btn', handleDeleteProduct);
    $('.routeHolder').on('click', '.delete-route-btn', handleDeleteRoute);
    $('.customerHolder').on('click', '.delete-customer-btn', handleDeleteCustomer);
    $('.supplierHolder').on('click', '.delete-supplier-btn', handleDeleteSupplier);
    $('.weekHolder').on('click', '.delete-week-btn', handleDeleteWeek);

    // Populate Dropdowns needed for forms
    populateCategoryDropdown('#itmCategory'); // For product add form
    populateUomDropdown('#itmUoM');         // For product add form
    populateRouteDropdown('#routeID');        // For customer add form
    // Note: Supplier form in HTML doesn't have a route dropdown, add one if needed and call populateRouteDropdown.


}); // --- END Document Ready ---

// --- Helper Functions ---
function displayMessage(selector, message, isSuccess) {
    const $el = $(selector);
    $el.removeClass('alert-success alert-danger alert-warning').empty().hide(); // Clear classes and content
    if (message) {
        $el.addClass(isSuccess ? 'alert-success' : 'alert-danger').text(message).fadeIn();
        // Optional: Auto-hide after a delay
        // setTimeout(() => { $el.fadeOut(); }, 5000);
    }
}

function handleAjaxError(jqXHR, textStatus, errorThrown, resultSelector) {
    console.error("AJAX Error:", textStatus, errorThrown, jqXHR.status, jqXHR.responseText);
    let msg = `Request failed: ${jqXHR.status || textStatus || 'Unknown Error'}. `;
    try {
        // Try to parse JSON error first
        const errResponse = JSON.parse(jqXHR.responseText);
        if (errResponse && errResponse.message) {
            msg += errResponse.message;
        } else if (jqXHR.responseText){
             msg += "Server Response: " + jqXHR.responseText.substring(0, 100) + (jqXHR.responseText.length > 100 ? '...' : ''); // Show snippet of raw response if not JSON
        }
    } catch (e) {
        if(jqXHR.responseText){ // If parsing fails, show raw snippet
           msg += "Server Response: " + jqXHR.responseText.substring(0, 100) + (jqXHR.responseText.length > 100 ? '...' : '');
        }
    }
    if(resultSelector){
        displayMessage(resultSelector, msg, false);
    } else {
        alert("AJAX Error: " + msg); // Fallback alert
    }
}

// --- Initial Data Loading Function ---
function loadAllAdminData() {
    getUomData();
    getCategoryData();
    getProductData();
    getRouteData();
    getCustomerData();
    getSupplierData();
    getWeekData();
}

// --- Top Bar Data Fetch ---
function fetchAdminDetails() {
     $.ajax({
        url: '../knft/getCurrentUser.php', // Use the script that returns session info
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.isLoggedIn && response.role === 'A') {
                 // You'll need another AJAX call here to get the admin's actual name
                 // based on response.user_id if you want it.
                 // For now, using email as placeholder.
                $('#adminName').text(response.email || 'Admin');
            } else {
                 $('#adminName').text('Admin');
                 // Redirect if not admin?
                 // window.location.href = '../login/login.html';
            }
        },
        error: function(jqXHR, ts, et) {
             console.error("Error fetching user details for top bar");
             $('#adminName').text('Admin (Error)');
             // Don't use handleAjaxError here as it might show alert/message in wrong place
        }
    });
}

function fetchCurrentWeekForDisplay() {
     // *** PHP Script Needed: knft/getCurrentWeek.php ***
     // This script should SELECT week_id, week_start_date FROM weeks WHERE is_active_for_orders = TRUE (or similar logic) LIMIT 1
     // Return JSON: {success: true, data: {week_id: 9, week_start_date: '2025-03-25'}} or {success: false}
    $.ajax({
        url: '../knft/getCurrentWeek.php',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success && response.data) {
                const week = response.data;
                // Format date nicely if possible (requires moment.js or manual formatting)
                const displayDate = week.week_start_date; // Basic display
                $('#currentWeekDisplay').text(`${displayDate} (ID: ${week.week_id})`);
            } else {
                $('#currentWeekDisplay').text('Not Set');
            }
        },
        error: function(jqXHR, ts, et) {
            $('#currentWeekDisplay').text('Error');
            console.error("Error fetching current week for display");
        }
    });
}


// --- Populate Dropdowns ---
function populateCategoryDropdown(targetSelector) {
     // *** PHP Script Needed: knft/getCategories.php ***
     // Should SELECT category_id, category_name FROM categories WHERE is_active = TRUE ORDER BY category_name
     // Return JSON: {success: true, data: [{category_id: 1, category_name: 'Greens'}, ...]}
    $.ajax({
        url: '../knft/getCategories.php', type: 'GET', dataType: 'json',
        success: function(response) {
            const $select = $(targetSelector);
            $select.empty().append('<option value="">-- Select Category --</option>');
            if (response.success && response.data) {
                response.data.forEach(cat => {
                    $select.append(`<option value="${cat.category_id}">${cat.category_name}</option>`);
                });
            }
        },
        error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et); }
    });
}

function populateUomDropdown(targetSelector) {
     // *** PHP Script Needed: knft/getUoms.php ***
     // Should SELECT uom_id, uom_name, uom_code FROM uom WHERE is_active = TRUE ORDER BY uom_name
     // Return JSON: {success: true, data: [{uom_id: 3, uom_name: 'Kilogram', uom_code: 'kg'}, ...]}
    $.ajax({
        url: '../knft/getUoms.php', type: 'GET', dataType: 'json',
        success: function(response) {
             const $select = $(targetSelector);
             $select.empty().append('<option value="">-- Select UoM --</option>');
            if (response.success && response.data) {
                response.data.forEach(uom => {
                    $select.append(`<option value="${uom.uom_id}">${uom.uom_name} (${uom.uom_code})</option>`);
                });
            }
        },
        error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et); }
    });
}

function populateRouteDropdown(targetSelector) {
     // *** PHP Script Needed: knft/getRoutes.php ***
     // Should SELECT route_id, route_name FROM routes WHERE is_active = TRUE ORDER BY route_name
     // Return JSON: {success: true, data: [{route_id: 26, route_name: 'Ettimadai'}, ...]}
    $.ajax({
        url: '../knft/getRoutes.php', type: 'GET', dataType: 'json',
        success: function(response) {
            const $select = $(targetSelector);
             $select.empty().append('<option value="">-- Select Route --</option>');
            if (response.success && response.data) {
                response.data.forEach(route => {
                    $select.append(`<option value="${route.route_id}">${route.route_name}</option>`);
                });
            }
        },
        error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et); }
    });
}


// --- UOM Section ---
function getUomData() {
    // *** PHP Script Needed: knft/getUoms.php *** (as used in dropdown population)
     $.ajax({
        url: '../knft/getUoms.php', type: 'GET', dataType: 'json',
        success: function(response) {
            if (response.success && response.data) {
                displayUomTable(response.data);
            } else {
                 $('.uom-body').html('<tr><td colspan="3">No UoMs found or error loading.</td></tr>');
                 console.warn("UOM fetch warning:", response.message);
            }
        },
        error: function(jqXHR, ts, et) {
            $('.uom-body').html('<tr><td colspan="3">Error loading UoMs.</td></tr>');
            handleAjaxError(jqXHR, ts, et);
        }
    });
}

function displayUomTable(uoms) {
    const $tbody = $('.uom-body');
    $tbody.empty();
    if (!uoms || uoms.length === 0) {
         $tbody.html('<tr><td colspan="3">No UoMs defined.</td></tr>');
         return;
    }
    uoms.forEach(uom => {
        // Use backticks for template literals
        const row = `<tr>
            <td>${uom.uom_code || 'N/A'}</td>
            <td>${uom.uom_name || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-warning edit-uom-btn" data-id="${uom.uom_id}" data-code="${uom.uom_code}" data-name="${uom.uom_name}" data-bs-toggle="modal" data-bs-target="#uomEditModal">Edit</button>
                <button class="btn btn-sm btn-danger delete-uom-btn" data-id="${uom.uom_id}" data-name="${uom.uom_name}">Delete</button>
            </td>
        </tr>`;
        $tbody.append(row);
    });
}

function handleAddUom(e) {
    e.preventDefault();
    const formData = {
        uom_code: $('#UoMID').val(), // Use ID from your HTML form
        uom_name: $('#UoM').val()    // Use ID from your HTML form
    };
    displayMessage('#result-uom', '', false);

    // *** PHP Script Needed: knft/submitUom.php ***
    // Should INSERT into uom (uom_code, uom_name) VALUES (?, ?)
    // Return JSON: {success: true/false, message: '...'}
    $.ajax({
        url: '../knft/submitUom2.php', type: 'POST', contentType: 'application/json',
        data: JSON.stringify(formData), dataType: 'json',
        success: function(response) {
            displayMessage('#result-uom', response.message, response.success);
            if (response.success) {
                $('#uomForm')[0].reset();
                getUomData(); // Refresh table
            }
        },
        error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#result-uom'); }
    });
}

function handleEditUomClick() {
    const id = $(this).data('id');
    const code = $(this).data('code');
    const name = $(this).data('name');

    // Assuming modal exists with these IDs
    $('#uomEditModal #uomEditId').val(id);
    $('#uomEditModal #uomEditCode').val(code);
    $('#uomEditModal #uomEditName').val(name);
    displayMessage('#uomEditModal #uomEditResult', '', false); // Clear modal message
}

function handleSaveUom() {
     const uomData = {
        uom_id: $('#uomEditModal #uomEditId').val(),
        uom_code: $('#uomEditModal #uomEditCode').val(),
        uom_name: $('#uomEditModal #uomEditName').val()
    };
    displayMessage('#uomEditModal #uomEditResult', 'Saving...', true); // Indicate processing

    // *** PHP Script Needed: knft/editUom.php ***
    // Should UPDATE uom SET uom_code = ?, uom_name = ? WHERE uom_id = ?
    // Return JSON: {success: true/false, message: '...'}
    $.ajax({
        url: '../knft/editUom.php', type: 'POST', contentType: 'application/json',
        data: JSON.stringify(uomData), dataType: 'json',
        success: function(response) {
            displayMessage('#uomEditModal #uomEditResult', response.message, response.success);
            if (response.success) {
                 // Need to manually find and hide the modal instance
                 var uomModal = bootstrap.Modal.getInstance(document.getElementById('uomEditModal'));
                 if(uomModal) uomModal.hide();
                 getUomData();
            }
        },
        error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#uomEditModal #uomEditResult'); }
    });
}

function handleDeleteUom() {
    const id = $(this).data('id');
    const name = $(this).data('name');
    if (confirm(`Are you sure you want to delete UoM: ${name} (ID: ${id})?\nThis might fail if it's used by products.`)) {
        displayMessage('#result-uom', 'Deleting...', true); // Indicate processing
         // *** PHP Script Needed: knft/deleteUom.php ***
         // Should DELETE FROM uom WHERE uom_id = ? (handle FK constraints, return error if in use)
         // Return JSON: {success: true/false, message: '...'}
        $.ajax({
            url: '../knft/deleteUom.php', type: 'POST', contentType: 'application/json',
            data: JSON.stringify({ uom_id: id }), dataType: 'json',
            success: function(response) {
                displayMessage('#result-uom', response.message, response.success);
                if (response.success) {
                    getUomData();
                }
            },
            error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#result-uom'); }
        });
    }
}

// --- Category Section --- (Follow UOM Pattern)
function getCategoryData() {
    // *** PHP: knft/getCategories.php *** (SELECT category_id, category_code, category_name FROM categories WHERE is_active = TRUE)
    $.ajax({
        url: '../knft/getCategories.php', type: 'GET', dataType: 'json',
        success: function(response) {
            if(response.success) displayCategoryTable(response.data); else $('.category-body').html('<tr><td colspan="3">No categories found.</td></tr>');
        }, error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et); $('.category-body').html('<tr><td colspan="3">Error loading categories.</td></tr>'); }
    });
}
function displayCategoryTable(categories) {
     const $tbody = $('.category-body'); $tbody.empty();
     if(!categories || categories.length === 0) { $tbody.html('<tr><td colspan="3">No categories defined.</td></tr>'); return; }
     categories.forEach(cat => {
         $tbody.append(`<tr>
            <td>${cat.category_code || 'N/A'}</td>
            <td>${cat.category_name || 'N/A'}</td>
             <td>
                <button class="btn btn-sm btn-warning edit-category-btn" data-id="${cat.category_id}" data-code="${cat.category_code}" data-name="${cat.category_name}" data-bs-toggle="modal" data-bs-target="#categoryEditModal">Edit</button>
                <button class="btn btn-sm btn-danger delete-category-btn" data-id="${cat.category_id}" data-name="${cat.category_name}">Delete</button>
            </td></tr>`);
     });
}
function handleAddCategory(e) {
    e.preventDefault();
    const formData = {
        category_code: $('#categoryType').val(), // Use ID from your HTML form
        category_name: $('#categoryDesc').val() // Use ID from your HTML form
    };
    displayMessage('#result-category', '', false);
    // *** PHP: knft/submitCategory.php *** (INSERT INTO categories)
    $.ajax({ url: '../knft/submitCategory.php', type: 'POST', contentType: 'application/json', data: JSON.stringify(formData), dataType: 'json',
        success: function(response) {
            displayMessage('#result-category', response.message, response.success);
            if(response.success) { $('#categoryForm')[0].reset(); getCategoryData(); }
        },
        error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#result-category'); }
    });
}
function handleEditCategoryClick() {
     $('#categoryEditModal #categoryEditId').val($(this).data('id'));
     $('#categoryEditModal #categoryEditCode').val($(this).data('code'));
     $('#categoryEditModal #categoryEditName').val($(this).data('name'));
     displayMessage('#categoryEditModal #categoryEditResult', '', false);
}
function handleSaveCategory() {
    const catData = {
        category_id: $('#categoryEditModal #categoryEditId').val(),
        category_code: $('#categoryEditModal #categoryEditCode').val(),
        category_name: $('#categoryEditModal #categoryEditName').val()
    };
    displayMessage('#categoryEditModal #categoryEditResult', 'Saving...', true);
    // *** PHP: knft/editCategory.php *** (UPDATE categories)
    $.ajax({ url: '../knft/editCategory.php', type: 'POST', contentType: 'application/json', data: JSON.stringify(catData), dataType: 'json',
         success: function(response) {
             displayMessage('#categoryEditModal #categoryEditResult', response.message, response.success);
             if(response.success){
                 var catModal = bootstrap.Modal.getInstance(document.getElementById('categoryEditModal'));
                 if(catModal) catModal.hide();
                 getCategoryData();
            }
         },
         error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#categoryEditModal #categoryEditResult'); }
    });
}
function handleDeleteCategory() {
    const id = $(this).data('id'); const name = $(this).data('name');
    if (confirm(`Delete Category: ${name}? (Ensure no products use it)`)) {
        displayMessage('#result-category', 'Deleting...', true);
        // *** PHP: knft/deleteCategory.php *** (DELETE FROM categories)
         $.ajax({ url: '../knft/deleteCategory.php', type: 'POST', contentType: 'application/json', data: JSON.stringify({ category_id: id }), dataType: 'json',
              success: function(response) {
                   displayMessage('#result-category', response.message, response.success);
                   if(response.success) getCategoryData();
              },
              error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#result-category'); }
         });
    }
}

// --- Product Section ---
function getProductData() {
    // *** PHP: knft/getProducts.php ***
    // Needs SELECT p.product_id, p.product_name, p.base_price, p.description, p.image_url, p.category_id, p.uom_id, c.category_name, u.uom_name, u.uom_code
    // FROM products p
    // JOIN categories c ON p.category_id = c.category_id
    // JOIN uom u ON p.uom_id = u.uom_id
    // WHERE p.is_active = TRUE ORDER BY p.product_name
     $.ajax({ url: '../knft/getProducts.php', type: 'GET', dataType: 'json',
        success: function(response) {
            if(response.success) displayProductTable(response.data); else $('.product-body').html('<tr><td colspan="6">No products found.</td></tr>');
        }, error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et); $('.product-body').html('<tr><td colspan="6">Error loading products.</td></tr>'); }
    });
}
function displayProductTable(products) {
    const $tbody = $('.product-body'); $tbody.empty();
    if(!products || products.length === 0) { $tbody.html('<tr><td colspan="6">No products defined.</td></tr>'); return; }
    products.forEach(prod => {
        const price = prod.base_price != null ? parseFloat(prod.base_price).toFixed(2) : 'N/A';
        $tbody.append(`<tr>
            <td>${prod.product_id || 'N/A'}</td>
            <td>${prod.category_name || 'N/A'} (${prod.category_id || '?'})</td>
            <td>${prod.product_name || 'N/A'}</td>
            <td>${prod.uom_name || 'N/A'} (${prod.uom_id || '?'})</td>
            <td>${price}</td>
            <td>
                 <button class="btn btn-sm btn-warning edit-product-btn"
                    data-id="${prod.product_id}"
                    data-name="${prod.product_name || ''}"
                    data-categoryid="${prod.category_id || ''}"
                    data-uomid="${prod.uom_id || ''}"
                    data-price="${prod.base_price || ''}"
                    data-description="${prod.description || ''}"
                    data-imageurl="${prod.image_url || ''}"
                    data-bs-toggle="modal" data-bs-target="#productEditModal">Edit</button>
                <button class="btn btn-sm btn-danger delete-product-btn" data-id="${prod.product_id}" data-name="${prod.product_name}">Delete</button>
            </td></tr>`);
    });
}
function handleAddProduct(e) {
     e.preventDefault(); // Although it's a button, prevent default just in case
     const formData = {
         product_name: $('#itmProduct').val(), // Using IDs from your HTML
         category_id: $('#itmCategory').val(),
         uom_id: $('#itmUoM').val(),
         base_price: $('#itmRate').val() || null,
         // Add description, image_url if you add those fields to the form
         description: null,
         image_url: null
     };
     // Basic Validation
     if (!formData.product_name || !formData.category_id || !formData.uom_id) {
         displayMessage('#result-product', 'Product Name, Category, and UoM are required.', false);
         return;
     }
     displayMessage('#result-product', '', false);

     // *** PHP: knft/submitProduct.php *** (INSERT INTO products)
     $.ajax({ url: '../knft/submitProduct.php', type: 'POST', contentType: 'application/json',
         data: JSON.stringify(formData), dataType: 'json',
         success: function(response) {
            displayMessage('#result-product', response.message, response.success);
            if(response.success) {
                // Reset relevant fields in the product form
                $('#itmProduct').val('');
                $('#itmCategory').val('');
                $('#itmUoM').val('');
                $('#itmRate').val('');
                getProductData();
            }
         },
         error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#result-product'); }
     });
}
function handleEditProductClick() {
    const btn = $(this);
    // Populate productEditModal fields using data attributes
    $('#productEditModal #productEditId').val(btn.data('id'));
    $('#productEditModal #productEditName').val(btn.data('name'));
    $('#productEditModal #productEditCategory').val(btn.data('categoryid'));
    $('#productEditModal #productEditUom').val(btn.data('uomid'));
    $('#productEditModal #productEditPrice').val(btn.data('price'));
    $('#productEditModal #productEditDescription').val(btn.data('description'));
    $('#productEditModal #productEditImageUrl').val(btn.data('imageurl'));
    displayMessage('#productEditModal #productEditResult', '', false);
}
function handleSaveProduct() {
     const productData = {
        product_id: $('#productEditModal #productEditId').val(),
        product_name: $('#productEditModal #productEditName').val(),
        category_id: $('#productEditModal #productEditCategory').val(),
        uom_id: $('#productEditModal #productEditUom').val(),
        base_price: $('#productEditModal #productEditPrice').val() || null,
        description: $('#productEditModal #productEditDescription').val() || null,
        image_url: $('#productEditModal #productEditImageUrl').val() || null
     };
      // Basic Validation
     if (!productData.product_name || !productData.category_id || !productData.uom_id) {
         displayMessage('#productEditModal #productEditResult', 'Product Name, Category, and UoM are required.', false);
         return;
     }
     displayMessage('#productEditModal #productEditResult', 'Saving...', true);
     // *** PHP: knft/editProduct.php *** (UPDATE products)
     $.ajax({ url: '../knft/editProduct.php', type: 'POST', contentType: 'application/json',
          data: JSON.stringify(productData), dataType: 'json',
          success: function(response) {
               displayMessage('#productEditModal #productEditResult', response.message, response.success);
               if(response.success) {
                    var prodModal = bootstrap.Modal.getInstance(document.getElementById('productEditModal'));
                    if(prodModal) prodModal.hide();
                    getProductData();
                }
          },
          error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#productEditModal #productEditResult'); }
     });
}
function handleDeleteProduct() {
     const id = $(this).data('id'); const name = $(this).data('name');
     if (confirm(`Delete Product: ${name}? (Ensure it's not used in orders/yields)`)) {
          displayMessage('#result-product', 'Deleting...', true);
          // *** PHP: knft/deleteProduct.php *** (DELETE FROM products or set is_active=FALSE)
          // Recommended: Check for dependencies in farmer_yields and order_items before deleting.
          // Or just set is_active = FALSE
          $.ajax({ url: '../knft/deleteProduct.php', type: 'POST', contentType: 'application/json', data: JSON.stringify({ product_id: id }), dataType: 'json',
               success: function(response) {
                    displayMessage('#result-product', response.message, response.success);
                    if(response.success) getProductData();
               },
               error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#result-product'); }
          });
     }
}

// --- Route Section --- (Follow UOM Pattern)
function getRouteData() {
    // *** PHP: knft/getRoutes.php *** (SELECT route_id, route_name, delivery_type, delivery_charge FROM routes WHERE is_active = TRUE)
    $.ajax({ url: '../knft/getRoutes.php', type:'GET', dataType: 'json',
        success: function(response) {
            if(response.success) displayRouteTable(response.data); else $('.route-body').html('<tr><td colspan="4">No routes found.</td></tr>');
        }, error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et); $('.route-body').html('<tr><td colspan="4">Error loading routes.</td></tr>');}
    });
}
function displayRouteTable(routes) {
    const $tbody = $('.route-body'); $tbody.empty();
    if(!routes || routes.length === 0) { $tbody.html('<tr><td colspan="4">No routes defined.</td></tr>'); return; }
    routes.forEach(route => {
         const charge = route.delivery_charge != null ? parseFloat(route.delivery_charge).toFixed(2) : '0.00';
        $tbody.append(`<tr>
            <td>${route.route_name || 'N/A'}</td>
            <td>${route.delivery_type || 'N/A'}</td>
            <td>${charge}</td>
             <td>
                <button class="btn btn-sm btn-warning edit-route-btn" data-id="${route.route_id}" data-name="${route.route_name || ''}" data-type="${route.delivery_type || ''}" data-charge="${route.delivery_charge || '0'}" data-bs-toggle="modal" data-bs-target="#routeEditModal">Edit</button>
                <button class="btn btn-sm btn-danger delete-route-btn" data-id="${route.route_id}" data-name="${route.route_name}">Delete</button>
            </td></tr>`);
    });
}
function handleAddRoute(e) {
    e.preventDefault();
    const formData = {
        route_name: $('#route').val(), // Using ID from your HTML form
        delivery_type: $('input[name="deliveryType"]:checked').val(), // Use name from HTML form
        delivery_charge: $('#rate').val() || 0 // Use ID from HTML form
    };
     if (!formData.route_name || !formData.delivery_type) {
         displayMessage('#result-route', 'Route Name and Delivery Type are required.', false);
         return;
     }
    displayMessage('#result-route', '', false);
    // *** PHP: knft/submitRoute.php *** (INSERT INTO routes)
    $.ajax({ url: '../knft/submitRoute.php', type: 'POST', contentType: 'application/json', data: JSON.stringify(formData), dataType: 'json',
        success: function(response) {
            displayMessage('#result-route', response.message, response.success);
            if(response.success) { $('#routeForm')[0].reset(); getRouteData(); }
        },
        error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#result-route'); }
    });
}
function handleEditRouteClick() {
    const btn = $(this);
    $('#routeEditModal #routeEditId').val(btn.data('id'));
    $('#routeEditModal #routeEditName').val(btn.data('name'));
    // Check the correct radio button based on the value
    $('#routeEditModal input[name="routeEditDeliveryType"][value="' + btn.data('type') + '"]').prop('checked', true);
    $('#routeEditModal #routeEditCharge').val(btn.data('charge'));
    displayMessage('#routeEditModal #routeEditResult', '', false);
}
function handleSaveRoute() {
    const routeData = {
        route_id: $('#routeEditModal #routeEditId').val(),
        route_name: $('#routeEditModal #routeEditName').val(),
        delivery_type: $('#routeEditModal input[name="routeEditDeliveryType"]:checked').val(),
        delivery_charge: $('#routeEditModal #routeEditCharge').val() || 0
    };
    if (!routeData.route_name || !routeData.delivery_type) {
         displayMessage('#routeEditModal #routeEditResult', 'Route Name and Delivery Type are required.', false);
         return;
     }
    displayMessage('#routeEditModal #routeEditResult', 'Saving...', true);
    // *** PHP: knft/editRoute.php *** (UPDATE routes)
    $.ajax({ url: '../knft/editRoute.php', type: 'POST', contentType: 'application/json', data: JSON.stringify(routeData), dataType: 'json',
        success: function(response) {
            displayMessage('#routeEditModal #routeEditResult', response.message, response.success);
             if(response.success) {
                 var routeModal = bootstrap.Modal.getInstance(document.getElementById('routeEditModal'));
                 if(routeModal) routeModal.hide();
                 getRouteData();
                 // Important: Also refresh route dropdowns if they might have changed
                 populateRouteDropdown('#routeID');
             }
        },
        error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#routeEditModal #routeEditResult'); }
    });
}
function handleDeleteRoute() {
    const id = $(this).data('id'); const name = $(this).data('name');
    if (confirm(`Delete Route: ${name}? (Ensure no customers use it)`)) {
        displayMessage('#result-route', 'Deleting...', true);
         // *** PHP: knft/deleteRoute.php *** (DELETE FROM routes or set is_active=FALSE)
         // Recommend check for dependencies in 'customers' table or set is_active=FALSE
         $.ajax({ url: '../knft/deleteRoute.php', type: 'POST', contentType: 'application/json', data: JSON.stringify({ route_id: id }), dataType: 'json',
              success: function(response) {
                   displayMessage('#result-route', response.message, response.success);
                   if(response.success) {
                       getRouteData();
                       populateRouteDropdown('#routeID'); // Refresh dropdown
                   }
              },
              error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#result-route'); }
         });
    }
}


// --- Customer Section ---
function getCustomerData() {
    // *** PHP: knft/getCustomers.php ***
    // Needs SELECT cust.customer_id, cust.user_id, prof.full_name, u.email, prof.phone_primary, prof.phone_alternative, cust.address, r.route_name, cust.route_id
    // FROM customers cust
    // JOIN users u ON cust.user_id = u.user_id AND u.is_active = TRUE AND u.role = 'Customer'
    // LEFT JOIN user_profiles prof ON u.user_id = prof.user_id
    // LEFT JOIN routes r ON cust.route_id = r.route_id
    // ORDER BY prof.full_name
     $.ajax({ url: '../knft/getCustomers.php', type: 'GET', dataType: 'json',
        success: function(response) {
            if(response.success) displayCustomerTable(response.data); else $('.customer-body').html('<tr><td colspan="7">No customers found.</td></tr>');
        }, error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et); $('.customer-body').html('<tr><td colspan="7">Error loading customers.</td></tr>'); }
    });
}
function displayCustomerTable(customers) {
    const $tbody = $('.customer-body'); $tbody.empty();
    if(!customers || customers.length === 0) { $tbody.html('<tr><td colspan="7">No customers defined.</td></tr>'); return; }
    customers.forEach(cust => {
        // Use data attributes compatible with edit form
        $tbody.append(`<tr>
            <td>${cust.full_name || 'N/A'}</td>
            <td>${cust.route_name || 'N/A'}</td>
            <td>${cust.phone_primary || 'N/A'}</td>
            <td>${cust.phone_alternative || 'N/A'}</td>
            <td>${cust.address || 'N/A'}</td>
            <td>${cust.email || 'N/A'}</td>
            <td>
                <button class="btn btn-sm btn-warning edit-customer-btn"
                    data-userid="${cust.user_id}"
                    data-customerid="${cust.customer_id}"
                    data-name="${cust.full_name || ''}"
                    data-email="${cust.email || ''}"
                    data-contact="${cust.phone_primary || ''}"
                    data-altcontact="${cust.phone_alternative || ''}"
                    data-address="${cust.address || ''}"
                    data-routeid="${cust.route_id || ''}"
                    data-bs-toggle="modal" data-bs-target="#customerEditModal">Edit</button>
                <button class="btn btn-sm btn-danger delete-customer-btn" data-userid="${cust.user_id}" data-name="${cust.full_name || cust.email}">Deactivate</button>
            </td></tr>`);
    });
}
function handleAddCustomer(e) {
    // This uses the existing refactored PHP script knft/submitCustomer.php
    e.preventDefault();
    const formData = {
        customerName: $('#customerForm #customerName').val(), // Scope selectors to the form
        routeID: $('#customerForm #routeID').val(),
        contact: $('#customerForm #contact').val(),
        alternativeContact: $('#customerForm #alternativeContact').val(),
        address: $('#customerForm #address').val(),
        emailID: $('#customerForm #emailID').val(),
        password: $('#customerForm #password').val()
    };
    // Add validation here if needed (e.g., password length)
     if (!formData.emailID || !formData.password || !formData.customerName || !formData.contact) {
         displayMessage('#result-customer', 'Name, Contact, Email, and Password are required.', false);
         return;
     }
    displayMessage('#result-customer', 'Registering...', true);

    $.ajax({
        url: '../knft/submitCustomer.php', // This script handles users, user_profiles, customers insert
        type: 'POST', contentType: 'application/json',
        data: JSON.stringify(formData), dataType: 'json',
        success: function(response) {
            displayMessage('#result-customer', response.message, response.success);
            if (response.success) {
                $('#customerForm')[0].reset();
                getCustomerData(); // Refresh table
            }
        },
        error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#result-customer'); }
    });
}
function handleEditCustomerClick() {
    // Populate customerEditModal - Needs the modal HTML defined first
    const btn = $(this);
    $('#customerEditModal #customerEditUserId').val(btn.data('userid'));
    $('#customerEditModal #customerEditCustomerId').val(btn.data('customerid'));
    $('#customerEditModal #customerEditName').val(btn.data('name'));
    $('#customerEditModal #customerEditEmail').val(btn.data('email'));
    $('#customerEditModal #customerEditContact').val(btn.data('contact'));
    $('#customerEditModal #customerEditAlternativeContact').val(btn.data('altcontact'));
    $('#customerEditModal #customerEditAddress').val(btn.data('address'));
    $('#customerEditModal #customerEditRoute').val(btn.data('routeid')); // Select dropdown option
    // Clear password fields - handle password separately
    $('#customerEditModal #customerEditPassword').val('');
    $('#customerEditModal #customerEditConfirmPassword').val('');
    displayMessage('#customerEditModal #customerEditResult', '', false);

     // Populate route dropdown within the modal if not already populated globally
     populateRouteDropdown('#customerEditModal #customerEditRoute');
     // Set the correct selected route after populating
     setTimeout(() => { $('#customerEditModal #customerEditRoute').val(btn.data('routeid')); }, 200); // Delay slightly

}
function handleSaveCustomer() {
    const customerData = {
        user_id: $('#customerEditModal #customerEditUserId').val(),
        customer_id: $('#customerEditModal #customerEditCustomerId').val(),
        // Data for user_profiles table
        full_name: $('#customerEditModal #customerEditName').val(),
        phone_primary: $('#customerEditModal #customerEditContact').val(),
        phone_alternative: $('#customerEditModal #customerEditAlternativeContact').val(),
        // Data for users table (handle email change carefully server-side)
        email: $('#customerEditModal #customerEditEmail').val(),
        // Data for customers table
        address: $('#customerEditModal #customerEditAddress').val(),
        route_id: $('#customerEditModal #customerEditRoute').val() || null,
        // Optional Password Change - Check if fields are filled
        new_password: $('#customerEditModal #customerEditPassword').val() || null
    };
     // Basic Validation
     if (!customerData.full_name || !customerData.email || !customerData.phone_primary) {
         displayMessage('#customerEditModal #customerEditResult', 'Name, Email, and Primary Contact are required.', false);
         return;
     }
     // Add password confirmation check if new password is entered
     if (customerData.new_password && customerData.new_password !== $('#customerEditModal #customerEditConfirmPassword').val()) {
         displayMessage('#customerEditModal #customerEditResult', 'New passwords do not match.', false);
         return;
     }
     if (customerData.new_password && customerData.new_password.length < 6) {
          displayMessage('#customerEditModal #customerEditResult', 'New password must be at least 6 characters.', false);
          return;
     }

    displayMessage('#customerEditModal #customerEditResult', 'Saving...', true);

    // *** PHP Script Needed: knft/editCustomer.php ***
    // Needs to UPDATE users (email, maybe password_hash), user_profiles (name, phones), customers (address, route_id) within a transaction
    // Handle potential duplicate email errors if email is changed.
    $.ajax({
        url: '../knft/editCustomer.php', type: 'POST', contentType: 'application/json',
        data: JSON.stringify(customerData), dataType: 'json',
        success: function(response) {
             displayMessage('#customerEditModal #customerEditResult', response.message, response.success);
             if(response.success) {
                 var custModal = bootstrap.Modal.getInstance(document.getElementById('customerEditModal'));
                 if(custModal) custModal.hide();
                 getCustomerData();
             }
        },
        error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#customerEditModal #customerEditResult'); }
    });
}
function handleDeleteCustomer() {
    const userId = $(this).data('userid');
    const name = $(this).data('name');
    if (confirm(`Deactivate Customer: ${name} (ID: ${userId})?\nThey will not be able to log in.`)) {
        displayMessage('#result-customer', 'Deactivating...', true);
        // *** PHP Script Needed: knft/deactivateUser.php ***
        // Needs UPDATE users SET is_active = FALSE WHERE user_id = ?
         $.ajax({
            url: '../knft/deactivateUser.php', type: 'POST', contentType: 'application/json',
            data: JSON.stringify({ user_id: userId }), dataType: 'json',
            success: function(response) {
                 displayMessage('#result-customer', response.message, response.success);
                 if(response.success) {
                     getCustomerData(); // Refresh will remove them from the list if the PHP query filters by is_active=TRUE
                 }
            },
            error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#result-customer'); }
        });
    }
}

// --- Supplier Section --- (Follow Customer Pattern)
function getSupplierData() {
    // *** PHP: knft/getSuppliers.php ***
    // Needs SELECT sup.supplier_id, sup.user_id, prof.full_name, u.email, prof.phone_primary, prof.phone_alternative, sup.farm_location, sup.farm_size_acres
    // FROM suppliers sup
    // JOIN users u ON sup.user_id = u.user_id AND u.is_active = TRUE AND u.role = 'Farmer'
    // LEFT JOIN user_profiles prof ON u.user_id = prof.user_id
    // ORDER BY prof.full_name
     $.ajax({ url: '../knft/getSuppliers.php', type: 'GET', dataType: 'json',
        success: function(response) {
            if(response.success) displaySupplierTable(response.data); else $('.supplier-body').html('<tr><td colspan="7">No suppliers found.</td></tr>');
        }, error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et); $('.supplier-body').html('<tr><td colspan="7">Error loading suppliers.</td></tr>'); }
    });
}
function displaySupplierTable(suppliers) {
    const $tbody = $('.supplier-body'); $tbody.empty();
    if(!suppliers || suppliers.length === 0) { $tbody.html('<tr><td colspan="7">No suppliers defined.</td></tr>'); return; }
    suppliers.forEach(sup => {
        $tbody.append(`<tr>
            <td>${sup.full_name || 'N/A'}</td>
            <td>${sup.farm_location || 'N/A'}</td>
            <td>${sup.phone_primary || 'N/A'}</td>
            <td>${sup.phone_alternative || 'N/A'}</td>
            <td>${sup.farm_size_acres != null ? sup.farm_size_acres : 'N/A'}</td>
            <td>${sup.email || 'N/A'}</td>
            <td>
                 <button class="btn btn-sm btn-warning edit-supplier-btn"
                    data-userid="${sup.user_id}"
                    data-supplierid="${sup.supplier_id}"
                     data-name="${sup.full_name || ''}"
                    data-email="${sup.email || ''}"
                    data-contact="${sup.phone_primary || ''}"
                    data-altcontact="${sup.phone_alternative || ''}"
                    data-location="${sup.farm_location || ''}"
                    data-size="${sup.farm_size_acres || ''}"
                    data-bs-toggle="modal" data-bs-target="#supplierEditModal">Edit</button>
                <button class="btn btn-sm btn-danger delete-supplier-btn" data-userid="${sup.user_id}" data-name="${sup.full_name || sup.email}">Deactivate</button>
            </td></tr>`);
    });
}
function handleAddSupplier(e) {
    // Uses the existing refactored knft/submitSupplier.php
    e.preventDefault();
    const formData = {
        supplierName: $('#supplierForm #supplierName').val(), // Scope to form
        farmLocation: $('#supplierForm #farmLocation').val(),
        contact: $('#supplierForm #contact').val(), // Ensure unique ID in HTML if needed
        alternativeContact: $('#supplierForm #alternativeContact').val(), // Ensure unique ID
        farmSize: $('#supplierForm #farmSize').val(),
        emailID: $('#supplierForm #emailID').val(), // Ensure unique ID
        password: $('#supplierForm #password').val() // Ensure unique ID
    };
     // Add validation here if needed
     if (!formData.emailID || !formData.password || !formData.supplierName || !formData.contact) {
         displayMessage('#result-supplier', 'Name, Contact, Email, and Password are required.', false);
         return;
     }
    displayMessage('#result-supplier', 'Registering...', true);

    $.ajax({
        url: '../knft/submitSupplier.php', // Handles users, user_profiles, suppliers insert
        type: 'POST', contentType: 'application/json',
        data: JSON.stringify(formData), dataType: 'json',
        success: function(response) {
            displayMessage('#result-supplier', response.message, response.success);
            if (response.success) {
                $('#supplierForm')[0].reset();
                getSupplierData();
            }
        },
        error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#result-supplier'); }
    });
}
function handleEditSupplierClick() {
    // Populate supplierEditModal
    const btn = $(this);
    $('#supplierEditModal #supplierEditUserId').val(btn.data('userid'));
    $('#supplierEditModal #supplierEditSupplierId').val(btn.data('supplierid'));
    $('#supplierEditModal #supplierEditName').val(btn.data('name'));
    $('#supplierEditModal #supplierEditEmail').val(btn.data('email'));
    $('#supplierEditModal #supplierEditContact').val(btn.data('contact'));
    $('#supplierEditModal #supplierEditAlternativeContact').val(btn.data('altcontact'));
    $('#supplierEditModal #supplierEditLocation').val(btn.data('location'));
    $('#supplierEditModal #supplierEditSize').val(btn.data('size'));
    // Clear password fields
    $('#supplierEditModal #supplierEditPassword').val('');
    $('#supplierEditModal #supplierEditConfirmPassword').val('');
    displayMessage('#supplierEditModal #supplierEditResult', '', false);
}
function handleSaveSupplier() {
    // Gather data from supplierEditModal
    const supplierData = {
        user_id: $('#supplierEditModal #supplierEditUserId').val(),
        supplier_id: $('#supplierEditModal #supplierEditSupplierId').val(),
        // Data for user_profiles
        full_name: $('#supplierEditModal #supplierEditName').val(),
        phone_primary: $('#supplierEditModal #supplierEditContact').val(),
        phone_alternative: $('#supplierEditModal #supplierEditAlternativeContact').val(),
        // Data for users
        email: $('#supplierEditModal #supplierEditEmail').val(),
        // Data for suppliers
        farm_location: $('#supplierEditModal #supplierEditLocation').val(),
        farm_size_acres: $('#supplierEditModal #supplierEditSize').val() || null,
        // Optional Password Change
        new_password: $('#supplierEditModal #supplierEditPassword').val() || null
    };
     // Basic Validation
     if (!supplierData.full_name || !supplierData.email || !supplierData.phone_primary) {
         displayMessage('#supplierEditModal #supplierEditResult', 'Name, Email, and Primary Contact are required.', false);
         return;
     }
     // Add password confirmation check if new password is entered
     if (supplierData.new_password && supplierData.new_password !== $('#supplierEditModal #supplierEditConfirmPassword').val()) {
         displayMessage('#supplierEditModal #supplierEditResult', 'New passwords do not match.', false);
         return;
     }
    if (supplierData.new_password && supplierData.new_password.length < 6) {
         displayMessage('#supplierEditModal #supplierEditResult', 'New password must be at least 6 characters.', false);
         return;
    }

    displayMessage('#supplierEditModal #supplierEditResult', 'Saving...', true);
    // *** PHP Script Needed: knft/editSupplier.php ***
    // Needs to UPDATE users, user_profiles, suppliers tables within a transaction
    $.ajax({
        url: '../knft/editSupplier.php', type: 'POST', contentType: 'application/json',
        data: JSON.stringify(supplierData), dataType: 'json',
        success: function(response) {
             displayMessage('#supplierEditModal #supplierEditResult', response.message, response.success);
             if(response.success) {
                var supModal = bootstrap.Modal.getInstance(document.getElementById('supplierEditModal'));
                if(supModal) supModal.hide();
                getSupplierData();
            }
        },
        error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#supplierEditModal #supplierEditResult'); }
    });
}
function handleDeleteSupplier() {
     // Same as delete customer - deactivate user
     const userId = $(this).data('userid');
     const name = $(this).data('name');
     if (confirm(`Deactivate Supplier: ${name} (ID: ${userId})?\nThey will not be able to log in.`)) {
         displayMessage('#result-supplier', 'Deactivating...', true);
         // *** PHP Script Needed: knft/deactivateUser.php *** (Same script as customer)
          $.ajax({
             url: '../knft/deactivateUser.php', type: 'POST', contentType: 'application/json',
             data: JSON.stringify({ user_id: userId }), dataType: 'json',
             success: function(response) {
                  displayMessage('#result-supplier', response.message, response.success);
                  if(response.success) {
                      getSupplierData(); // Refresh might hide them
                  }
             },
             error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#result-supplier'); }
         });
     }
}


// --- Week Section --- (Follow UOM Pattern)
function getWeekData() {
    // *** PHP: knft/getWeeks.php ***
    // SELECT week_id, week_start_date, label, is_active_for_input, is_active_for_orders FROM weeks ORDER BY week_start_date DESC
    $.ajax({ url: '../knft/getWeeks.php', type: 'GET', dataType: 'json',
        success: function(response) { if(response.success) displayWeekTable(response.data); else $('.week-body').html('...'); },
        error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et); $('.week-body').html('...'); }
    });
}
function displayWeekTable(weeks) {
    const $tbody = $('.week-body'); $tbody.empty();
    if(!weeks || weeks.length === 0) { $tbody.html('<tr><td colspan="3">No weeks defined.</td></tr>'); return; }
    weeks.forEach(week => {
        // Format date for display if needed
        $tbody.append(`<tr>
            <td>${week.week_id}</td>
            <td>${week.week_start_date}</td>
            <td>
                 <button class="btn btn-sm btn-warning edit-week-btn" data-id="${week.week_id}" data-date="${week.week_start_date}" data-label="${week.label || ''}" data-activeinput="${week.is_active_for_input}" data-activeorder="${week.is_active_for_orders}" data-bs-toggle="modal" data-bs-target="#weekEditModal">Edit</button>
                 <button class="btn btn-sm btn-danger delete-week-btn" data-id="${week.week_id}" data-date="${week.week_start_date}">Delete</button>
            </td></tr>`);
    });
}
function handleAddWeek(e) {
     e.preventDefault();
     // Format date from input type=date (YYYY-MM-DD) if needed by backend
     const dateValue = $('#weekDate').val(); // From your form ID
     if (!dateValue) {
         displayMessage('#result-week', 'Week Start Date is required.', false);
         return;
     }
     const formData = {
         week_start_date: dateValue,
         label: null, // Add input field if needed
         is_active_for_input: true, // Default values
         is_active_for_orders: true
      };
     displayMessage('#result-week', 'Adding...', true);
     // *** PHP: knft/submitWeek.php *** (INSERT INTO weeks)
     $.ajax({ url: '../knft/submitWeek.php', type: 'POST', contentType: 'application/json', data: JSON.stringify(formData), dataType: 'json',
        success: function(response) {
             displayMessage('#result-week', response.message, response.success);
             if(response.success) { $('#weekForm')[0].reset(); getWeekData(); }
        },
        error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#result-week'); }
    });
}
function handleEditWeekClick() {
    // Populate weekEditModal
    const btn = $(this);
    $('#weekEditModal #weekEditId').val(btn.data('id'));
    $('#weekEditModal #weekEditDate').val(btn.data('date')); // Input type="date" should handle YYYY-MM-DD
    $('#weekEditModal #weekEditLabel').val(btn.data('label'));
    $('#weekEditModal #weekEditActiveInput').prop('checked', btn.data('activeinput') == 1); // Checkboxes based on 1/0
    $('#weekEditModal #weekEditActiveOrder').prop('checked', btn.data('activeorder') == 1);
    displayMessage('#weekEditModal #weekEditResult', '', false);
}
function handleSaveWeek() {
    // Gather data from weekEditModal
    const weekData = {
        week_id: $('#weekEditModal #weekEditId').val(),
        week_start_date: $('#weekEditModal #weekEditDate').val(),
        label: $('#weekEditModal #weekEditLabel').val() || null,
        is_active_for_input: $('#weekEditModal #weekEditActiveInput').is(':checked'),
        is_active_for_orders: $('#weekEditModal #weekEditActiveOrder').is(':checked')
    };
     if (!weekData.week_start_date) {
         displayMessage('#weekEditModal #weekEditResult', 'Week Start Date is required.', false);
         return;
     }
    displayMessage('#weekEditModal #weekEditResult', 'Saving...', true);
    // *** PHP: knft/editWeek.php *** (UPDATE weeks)
    $.ajax({ url: '../knft/editWeek.php', type: 'POST', contentType: 'application/json', data: JSON.stringify(weekData), dataType: 'json',
         success: function(response) {
            displayMessage('#weekEditModal #weekEditResult', response.message, response.success);
             if(response.success) {
                 var weekModal = bootstrap.Modal.getInstance(document.getElementById('weekEditModal'));
                 if(weekModal) weekModal.hide();
                 getWeekData();
             }
         },
         error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#weekEditModal #weekEditResult'); }
    });
}
function handleDeleteWeek() {
     const id = $(this).data('id'); const date = $(this).data('date');
     if (confirm(`Delete Week starting ${date} (ID: ${id})? (Ensure no yields or orders use it)`)) {
         displayMessage('#result-week', 'Deleting...', true);
         // *** PHP: knft/deleteWeek.php *** (DELETE FROM weeks)
         // Recommend check for dependencies in farmer_yields and orders before deleting
         $.ajax({ url: '../knft/deleteWeek.php', type: 'POST', contentType: 'application/json', data: JSON.stringify({ week_id: id }), dataType: 'json',
              success: function(response) {
                   displayMessage('#result-week', response.message, response.success);
                   if(response.success) getWeekData();
              },
              error: function(jqXHR, ts, et) { handleAjaxError(jqXHR, ts, et, '#result-week'); }
         });
     }
}