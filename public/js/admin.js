// const loadUoM = () => {
//   fetch('../knft/getUoM.php')
//       .then(response => response.json())
//       .then(data => {
//           console.log(data); // Handle the received JSON data here
//           const uomBody = document.querySelector(".uom-body");
//           const itmUoM = document.querySelector(".itmUoM");
//           uomBody.innerHTML = ""; // Clear existing content
//           for (let i = 0; i < data.length; i++) {
//             uomBody.innerHTML += `
//               <tr data-id="${data[i].UoMID}">
//                   <th scope="row">${data[i].UoMID}</th>
//                   <td>${data[i].UoM}</td>
//                   <td>
//                       <button class="btn btn-success" onclick="editUoM('${data[i].UoMID}')">Edit</button>
//                   </td>
//               </tr>`;
//               itmUoM.innerHTML += `<option value="${data[i].UoMID}">${data[i].UoM}</option>`;
//           }
//           document.getElementById("uomForm").reset();
//       })
//       .catch(error => console.error('Error fetching data:', error));
// };

// const editUoM = (oldId) => {
//   if (typeof oldId !== "string") {
//       console.error("Invalid UoMID:", oldId);
//       alert("Error: UoMID must be a string.");
//       return;
//   }

//   console.log("Editing UoM with ID:", oldId);
//   const uomRow = document.querySelector(`tr[data-id='${oldId}']`);
//   if (!uomRow) {
//       console.error("Row not found for ID:", oldId);
//       return;
//   }

//   const oldUoMName = uomRow.querySelector('td:nth-child(2)').innerText;

//   // Prompt user to enter new values
//   const newId = prompt("Edit UoMID:", oldId);
//   const newUoMName = prompt("Edit UoM Name:", oldUoMName);

//   // Check if user entered values and they are different
//   if (newId !== null && newUoMName !== null && (newId !== oldId || newUoMName !== oldUoMName)) {
//       const formData = {
//           oldUoMID: oldId,  // Old UoMID for reference
//           newUoMID: newId,  // New UoMID to update
//           UoM: newUoMName
//       };

//       console.log("Sending data:", formData);

//       fetch('../knft/editUoM.php', {
//           method: 'POST',
//           headers: {
//               'Content-Type': 'application/json'
//           },
//           body: JSON.stringify(formData)
//       })
//       .then(response => response.json())
//       .then(data => {
//           console.log("Response from server:", data);
//           alert(data.message);
//           loadUoM();  // Refresh table
//       })
//       .catch(error => {
//           console.error('Error:', error);
//           alert('An error occurred. Please try again.');
//       });
//   }
// };


// const loadCategory = () => {
//   fetch('../knft/getCategory.php')
//       .then(response => response.json())
//       .then(data => {
//           console.log(data);
//           const categoryBody = document.querySelector(".category-body");
//           const itmCategory = document.querySelector(".itmCategory");
//           categoryBody.innerHTML = ""; // Clear table before appending new rows

//           data.forEach(item => {
//               categoryBody.innerHTML += `
//                   <tr data-id="${item.categoryType}">
//                     <th scope="row">${item.categoryType}</th>
//                     <td>${item.categoryDesc}</td>
//                     <td>
//                         <button class="btn btn-success" onclick="editCategory('${item.categoryType}')">Edit</button>
//                     </td>
//                   </tr>`;

//               // Populate dropdown
//               itmCategory.innerHTML += `<option value="${item.categoryType}">${item.categoryDesc}</option>`;
//           });

//           document.getElementById("categoryForm").reset();
//       })
//       .catch(error => console.error('Error fetching data:', error));
// };


// const editCategory = (oldCategoryType) => {
//   const categoryRow = document.querySelector(`tr[data-id='${oldCategoryType}']`);

//   if (!categoryRow) {
//       alert("Row not found for Category Type: " + oldCategoryType);
//       return;
//   }

//   const oldCategoryDesc = categoryRow.querySelector('td:nth-child(2)').innerText;

//   const newCategoryType = prompt('Enter new Category Type:', oldCategoryType);
//   const newCategoryDesc = prompt('Enter new Category Description:', oldCategoryDesc);

//   if (!newCategoryType || !newCategoryDesc) {
//       alert("Both fields are required!");
//       return;
//   }

//   fetch('../knft/editCategory.php', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//           oldCategoryType: oldCategoryType,
//           newCategoryType: newCategoryType,
//           newCategoryDesc: newCategoryDesc
//       })
//   })
//   .then(response => response.json())
//   .then(data => {
//       alert(data.message);
//       if (data.success) {
//           // Update the row in the frontend without reloading the whole table
//           categoryRow.setAttribute("data-id", newCategoryType);
//           categoryRow.querySelector('th').innerText = newCategoryType;
//           categoryRow.querySelector('td:nth-child(2)').innerText = newCategoryDesc;
//           categoryRow.querySelector('button').setAttribute("onclick", `editCategory('${newCategoryType}')`);
//       }
//       loadCategory(); // Refresh the table
//   })
//   .catch(error => {
//       console.error('Error:', error);
//       alert('An error occurred. Please try again.');
//   });
// };




// const loadProducts = () => {
//   fetch('../knft/getProduct.php')
//       .then(response => response.json())
//       .then(data => {
//           console.log(data); // Debugging
//           const productTable = document.querySelector(".product-body");
//           productTable.innerHTML = ""; // Clear existing table data

//           for (let i = 0; i < data.data.length; i++) {
//               const row = `
//                   <tr>
//                       <td>${data.data[i].prod_id}</td>
//                       <td>${data.data[i].category_id}</td>
//                       <td>${data.data[i].product}</td>
//                       <td>${data.data[i].UoM_id}</td>
//                       <td>${data.data[i].price}</td>
//                       <td>
//                           <button class="btn btn-success" onclick="editProduct(${data.data[i].prod_id})">Edit</button>
//                       </td>
//                   </tr>`;
//               productTable.innerHTML += row;
//           }
//       })
//       .catch(error => console.error('Error fetching data:', error));
// };

// const editProduct = (prod_id) => {
//   const category_id = prompt("Enter new Category ID:");
//   const product = prompt("Enter new Product Name:");
//   const UoM_id = prompt("Enter new UoM ID:");
//   const price = prompt("Enter new Price:");

//   if (!category_id || !product || !UoM_id || !price) {
//       alert("All fields are required!");
//       return;
//   }

//   fetch('../knft/editProducts.php', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ prod_id, category_id, product, UoM_id, price })
//   })
//   .then(response => response.json())
//   .then(data => {
//       alert(data.message);
//       if (data.success) {
//           loadProducts(); // Reload products after update
//       }
//   })
//   .catch(error => console.error('Error updating product:', error));
// };


// const loadRoutes = () => {
//     fetch('../knft/getRoutes.php')
//         .then(response => response.json())
//         .then(data => {
//             console.log(data); // Debugging
            
//             // Populate the route table
//             const routeBody = document.querySelector(".route-body");
//             routeBody.innerHTML = ""; // Clear existing table data
//             for (let i = 0; i < data.length; i++) {
//                 const row = `
//                     <tr>
//                         <td>${data[i].route}</td>
//                         <td>${data[i].deliveryType}</td>
//                         <td>${data[i].rate}</td>
//                         <td>
//                             <button class="btn btn-success" onclick="editRoutes('${data[i].route}')">Edit</button>
//                         </td>
//                     </tr>`;
//                 routeBody.innerHTML += row;
//             }
  
//             // Populate the route dropdown in the customer registration form
//             const routeDropdown = document.querySelector("#routeID");
//             if (routeDropdown) {
//                 routeDropdown.innerHTML = '<option value="">Select Route</option>'; // Clear and add default option
//                 for (let i = 0; i < data.length; i++) {
//                     const option = `<option value="${data[i].route}">${data[i].route}</option>`;
//                     routeDropdown.innerHTML += option;
//                 }
//             }
//         })
//         .catch(error => console.error('Error fetching data:', error));
// };



// const editRoutes = (oldRoute) => {
//   const newRoute = prompt("Enter new Route Name:");
//   const newDeliveryType = prompt("Enter new Delivery Type:");

//   if (!newRoute || !newDeliveryType) {
//       alert("Both fields are required!");
//       return;
//   }

//   fetch('../knft/editRoutes.php', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ oldRoute, newRoute, newDeliveryType })
//   })
//   .then(response => response.json())
//   .then(data => {
//       alert(data.message);
//       if (data.success) {
//           loadRoutes(); // Reload routes after update
//       }
//   })
//   .catch(error => console.error('Error updating route:', error));
// };

// const loadCustomers = () => {
//   fetch('../knft/getCustomer.php')
//       .then(response => response.json())
//       .then(data => {
//           console.log(data); // Debugging
//           const customerBody = document.querySelector(".customer-body");
//           customerBody.innerHTML = ""; // Clear existing table data

//           for (let i = 0; i < data.length; i++) {
//               const row = `
//                   <tr>
//                       <td>${data[i].customerName}</td>
//                       <td>${data[i].routeID}</td>
//                       <td>${data[i].contact}</td>
//                       <td>${data[i].alternativeContact}</td>
//                       <td>${data[i].address}</td>
//                       <td>${data[i].emailID}</td>
//                       <td>
//                           <button class="btn btn-success" onclick="editCustomer('${data[i].emailID}')">Edit</button>
//                       </td>
//                   </tr>`;
//               customerBody.innerHTML += row;
//           }
//       })
//       .catch(error => console.error('Error fetching data:', error));
// };


// const editCustomer = (oldEmailID) => {
//   const customerName = prompt("Enter New Customer Name:");
//   const routeID = prompt("Enter New Route ID:");
//   const contact = prompt("Enter New Contact Number:");
//   const alternativeContact = prompt("Enter New Alternative Contact Number:");
//   const address = prompt("Enter New Address:");
//   const newEmailID = prompt("Enter New Email ID:");

//   if (!customerName || !routeID || !contact || !alternativeContact || !address || !newEmailID) {
//       alert("All fields are required!");
//       return;
//   }

//   fetch('../knft/editCustomer.php', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ oldEmailID, customerName, routeID, contact, alternativeContact, address, newEmailID })
//   })
//   .then(response => response.json())
//   .then(data => {
//       alert(data.message);
//       if (data.success) {
//           loadCustomers(); // Reload customers after update
//       }
//   })
//   .catch(error => console.error('Error updating customer:', error));
// };


// const loadSuppliers = () => {
//   fetch('../knft/getSupplier.php')
//       .then(response => response.json())
//       .then(data => {
//           console.log(data); // Debugging
//           const supplierBody = document.querySelector(".supplier-body");
//           supplierBody.innerHTML = ""; // Clear existing table data

//           for (let i = 0; i < data.length; i++) {
//               const row = `
//                   <tr>
//                       <td>${data[i].supplierName}</td>
//                       <td>${data[i].farmLocation}</td>
//                       <td>${data[i].contact}</td>
//                       <td>${data[i].alternativeContact}</td>
//                       <td>${data[i].farmSize}</td>
//                       <td>${data[i].emailID}</td>
//                       <td>
//                           <button class="btn btn-success" onclick="editSupplier('${data[i].emailID}')">Edit</button>
//                       </td>
//                   </tr>`;
//               supplierBody.innerHTML += row;
//           }
//       })
//       .catch(error => console.error('Error fetching data:', error));
// };


// const editSupplier = (oldEmailID) => {
//   const supplierName = prompt("Enter New Supplier Name:");
//   const farmLocation = prompt("Enter New Farm Location:");
//   const contact = prompt("Enter New Contact Number:");
//   const alternativeContact = prompt("Enter New Alternative Contact Number:");
//   const farmSize = prompt("Enter New Farm Size:");
//   const newEmailID = prompt("Enter New Email ID:");

//   if (!supplierName || !farmLocation || !contact || !alternativeContact || !farmSize || !newEmailID) {
//       alert("All fields are required!");
//       return;
//   }

//   fetch('../knft/editSupplier.php', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ oldEmailID, supplierName, farmLocation, contact, alternativeContact, farmSize, newEmailID })
//   })
//   .then(response => response.json())
//   .then(data => {
//       alert(data.message);
//       if (data.success) {
//           loadSuppliers(); // Reload suppliers after update
//       }
//   })
//   .catch(error => console.error('Error updating supplier:', error));
// };

// const loadWeek = () => {
//   fetch('../knft/getWeek.php')
//       .then(response => response.json())
//       .then(data => {
//           console.log(data); // Debugging
//           const weekBody = document.querySelector(".week-body");
//           weekBody.innerHTML = ""; // Clear existing table data

//           for (let item of data) {
//               const row = `
//                   <tr>
//                       <th scope="row">${item.weekID}</th>
//                       <td>${item.weekdate}</td>
//                       <td>
//                           <button class="btn btn-success" onclick="editWeek(${item.weekID})">Edit</button>
//                       </td>
//                   </tr>`;
//               weekBody.innerHTML += row;
//           }
//       })
//       .catch(error => console.error('Error fetching data:', error));
// };


// const editWeek = (weekID) => {
//   const weekdate = prompt("Enter New Week Date:");

//   if (!weekdate) {
//       alert("Week date is required!");
//       return;
//   }

//   fetch('../knft/editWeek.php', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ weekID, weekdate })
//   })
//   .then(response => response.json())
//   .then(data => {
//       alert(data.message);
//       if (data.success) {
//           loadWeek(); // Reload weeks after update
//       }
//   })
//   .catch(error => console.error('Error updating week:', error));
// };


// loadUoM();
// loadCategory();
// loadProducts();
// loadRoutes();
// loadCustomers();
// loadSuppliers();
// loadWeek();

// //to sent data to sql - done with form action
// document.addEventListener('DOMContentLoaded', function() {
//   document.getElementById('uomForm').addEventListener('submit', function(e) {
//       e.preventDefault(); // Prevent the default form submission
//       console.log("work")
//       // Get form data and convert it to JSON
//       const formData = {
//           UoMID: document.getElementById('UoMID').value,
//           UoM: document.getElementById('UoM').value
//       };
//       const jsonData = JSON.stringify(formData);

//       fetch('../knft/submitUoM.php', {
//           method: 'POST',
//           headers: {
//               'Content-Type': 'application/json'
//           },
//           body: jsonData
//       })
//       .then(response => response.text())
//       .then(data => {
//           document.getElementById('result-uom').innerText = data; // Display the response in the result div
//           document.querySelector(".uom-body").innerHTML="";
//           loadUoM();
//       })
//       .catch(error => {
//           document.getElementById('result-uom').innerText = 'An error occurred. Please try again.';
//       });
//   });
// });
// document.addEventListener('DOMContentLoaded', function() {
//   document.getElementById('weekForm').addEventListener('submit', function(e) {
//       e.preventDefault(); // Prevent the default form submission
//       console.log("work");
//       const dateInput = document.getElementById('weekDate').value;
//       if (dateInput) { 
//           const dateParts = dateInput.split('-'); // Split the input date (YYYY-MM-DD) 
//           const formattedDate = dateParts[2] + dateParts[1] + dateParts[0].substring(2, 4); // Reformat to DDMMYY 
//           document.getElementById('formattedWeekDate').value = formattedDate; // Set the hidden input value 
//       }
//       // Get form data and convert it to JSON
//       const formData = {
//           weekdate: document.getElementById('weekDate').value
//       };
//       const jsonData = JSON.stringify(formData);

//       fetch('../knft/submitWeek.php', {
//           method: 'POST',
//           headers: {
//               'Content-Type': 'application/json'
//           },
//           body: jsonData
//       })
//       .then(response => response.text())
//       .then(data => {
//           document.getElementById('result-week').innerText = data; // Display the response in the result div
//           document.querySelector(".week-body").innerHTML="";
//           loadWeek();
//       })
//       .catch(error => {
//           document.getElementById('result-week').innerText = 'An error occurred. Please try again.';
//       });
//   });
// });
// document.addEventListener('DOMContentLoaded', function() {
//   document.getElementById('categoryForm').addEventListener('submit', function(e) {
//       e.preventDefault(); // Prevent the default form submission
//       console.log("work")
//       // Get form data and convert it to JSON
//       const formData = {
//         categoryType: document.getElementById('categoryType').value,
//         categoryDesc: document.getElementById('categoryDesc').value
//       };
//       const jsonData = JSON.stringify(formData);

//       fetch('../knft/submitCategory.php', {
//           method: 'POST',
//           headers: {
//               'Content-Type': 'application/json'
//           },
//           body: jsonData
//       })
//       .then(response => response.text())
//       .then(data => {
//           document.getElementById('result-category').innerText = data; // Display the response in the result div
//           document.querySelector(".category-body").innerHTML="";
//           loadCategory();
//       })
//       .catch(error => {
//           document.getElementById('result-category').innerText = 'An error occurred. Please try again.';
//       });
//   });
// });

// document.querySelector(".ADDPRODUCT").addEventListener("click",(e)=>{
//   e.preventDefault(); // Prevent the default form submission
//   console.log("work")
//   // Get form data and convert it to JSON
//   if (!validateForm()) {
//     return;
//   }
//   else {
//     const ProductZIP =  {
//         category_id:document.querySelector(".itmCategory").value,
//         product: document.querySelector(".itmProduct").value,
//         UoM_id: document.querySelector(".itmUoM").value,
//         price: document.querySelector(".itmRate").value,
//     };
//     const jsonData = JSON.stringify(ProductZIP);

//     fetch('../knft/submitProduct.php', {
//         method: 'POST',
//         headers: {
//             "Content-Type": 'application/json'
//         },
//         body: jsonData
//     })
//     .then(response => response.json())
//     .then(data => {
//         console.log('Success:', data);
//         document.querySelector(".product-body").innerHTML="";
//         loadProducts();
//     })
//     .catch((error) => {
//         console.error('Error:', error);
//         document.querySelector(".product-body").innerHTML="";
//         loadProducts();
//     })
// }});
// document.querySelector("#routeForm").addEventListener("submit", (e) => {
//   e.preventDefault(); // Prevent the default form submission
//   // Get form data and convert it to JSON
//   let formData = new FormData(e.target);
//   let data = {};
//   formData.forEach((value, key) => {
//       data[key] = value;
//   });
//   console.log(data);

//   fetch('../knft/submitRoute.php', {
//       method: 'POST',
//       headers: {
//           "Content-Type": 'application/json'
//       },
//       body: JSON.stringify(data)
//   })
//   .then(response => response.json())
//   .then(data => {
//       console.log('Success:', data);
//       document.querySelector(".route-body").innerHTML = "";
//       loadRoutes();
//   })
//   .catch((error) => {
//       document.querySelector(".route-body").innerHTML = "";
//       loadRoutes();
//   });
// });

// //------------------------------------------------------------------------------------------------------------

// // Supplier Form Submission
//  document.querySelector("#supplierForm").addEventListener("submit", (e) => {
//   e.preventDefault();// Prevent the default form submission
//   // Get form data and convert it to JSON
//   let formData = new FormData(e.target);
//   let data = {};
//   formData.forEach((value, key) => {
//     data[key] = value;
//   });
//   console.log("Supplier form data:", data);
//   // Fetch for submitSupplier.php
//   fetch('../knft/submitSupplier.php', {
//     method: 'POST',
//     headers: {
//       "Content-Type": 'application/json'
//     },
//     body: JSON.stringify(data)
//   })
//   .then(response => response.json())
//   .then(data => {
//     console.log('Supplier Submit Success:', data);
//     document.querySelector(".supplier-body").innerHTML = "";
//     loadSuppliers();
//   })
//   .catch((error) => {
//     console.error('Supplier Submit Error:', error);
//     document.querySelector(".supplier-body").innerHTML = "";
//     loadSuppliers();
//   });
//   // Fetch for submitSupplierAcc.php
//   fetch('../knft/submitSupplierAcc.php', {
//     method: 'POST',
//     headers: {
//       "Content-Type": 'application/json'
//     },
//     body: JSON.stringify(data)
//   })
//   .then(response => response.json())
//   .then(data => {
//     console.log('Supplier Account Submit Success:', data);
//   })
//   .catch((error) => {
//     console.error('Supplier Account Submit Error:', error);
//   });
// });

// //------------------------------------------------------------------------------------------------------------

// // Customer Form Submission
// document.querySelector("#customerForm").addEventListener("submit", (e) => {
//   e.preventDefault(); // Prevent the default form submission
//   // Get form data and convert it to JSON
//   let formData = new FormData(e.target);
//   let data = {};
//   formData.forEach((value, key) => {
//       data[key] = value;
//   });
//   console.log(data);

//   fetch('../knft/submitCustomer.php', {
//       method: 'POST',
//       headers: {
//           "Content-Type": 'application/json'
//       },
//       body: JSON.stringify(data)
//   })
//   fetch('../knft/submitCustomerAcc.php', {
//     method: 'POST',
//     headers: {
//         "Content-Type": 'application/json'
//     },
//     body: JSON.stringify(data)
//   })
// }).then(response => response.json())
// .then(data => {
//       console.log('Supplier Submit Success:', data);
//       document.querySelector(".customer-body").innerHTML = "";
//       loadCustomers();
//   })
// .catch((error) => {
//       console.error('Customer Submit Error:', error);
//       document.querySelector(".customer-body").innerHTML = "";
//       loadCustomers();
// });

// //-----------------------------------------------------------------------------------------------------------
   
// function validateForm() {
//   let category_id = document.querySelector(".itmCategory").value;
//   let product = document.querySelector(".itmProduct").value;
//   let UoM_id = document.querySelector(".itmUoM").value;
//   let price = document.querySelector(".itmRate").value;

//   if (category_id === "" || product === "" || UoM_id === "" || price === "") {
//       alert("All fields must be filled out");
//       return false;
//   }
//   return true;
// }

// //---------------------------------------------------------------------------------------------------------------
// document.getElementById('downloadOrdersBtn').addEventListener('click', function() {
//   fetch('../knft/printorder.php')
//       .then(response => {
//           if (response.ok) {
//               return response.blob();
//           }
//           throw new Error('Network response was not ok.');
//       })
//       .then(blob => {
//           const url = window.URL.createObjectURL(blob);
//           const a = document.createElement('a');
//           a.style.display = 'none';
//           a.href = url;
//           a.download = 'orders.xlsx';
//           document.body.appendChild(a);
//           a.click();
//           window.URL.revokeObjectURL(url);
//       })
//       .catch(error => console.error('Download error:', error));
// });

// // ...existing code...


document.addEventListener('DOMContentLoaded', function() {

    // --- Initial Data Loading ---
    loadAllAdminData(); // Load data for all admin sections

    // --- Event Listeners ---

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
    console.error("Fetch Error:", response.status, response.statusText);
    let msg = `Request failed: ${response.status} ${response.statusText}. `;
    try {
        const errorText = await response.text(); // Get raw response text
        console.error("Raw Error Response:", errorText);
        // Attempt to parse as JSON
        try {
             const errJson = JSON.parse(errorText);
             if (errJson && errJson.message) {
                 msg += errJson.message;
             } else if (errorText) {
                 msg += "Details: " + errorText.substring(0, 150) + (errorText.length > 150 ? '...' : '');
             }
        } catch (e) { // If not JSON, use raw text snippet
             if (errorText) {
                 msg += "Details: " + errorText.substring(0, 150) + (errorText.length > 150 ? '...' : '');
             }
        }
    } catch (e) {
        console.error("Error reading error response body", e);
    }

    if (resultSelector) {
        displayMessage(resultSelector, msg, false);
    } else {
        alert("Fetch Error: " + msg); // Fallback
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
            const option = document.createElement('option');
            option.value = cat.categoryType; // Use categoryType (PK) as value
            option.textContent = `${cat.categoryDesc} (${cat.categoryType})`; // Use categoryDesc as text
            select.appendChild(option);
        });
    }
}
function populateUomDropdownForProductForm(uoms) {
    const select = document.getElementById('itmUoM'); // Original product form UoM select ID
    if (!select) return;
    select.innerHTML = '<option value="">-- Select UoM --</option>';
    if (uoms && uoms.length > 0) {
        uoms.forEach(uom => {
            const option = document.createElement('option');
            option.value = uom.UoMID; // Use UoMID (PK) as value
            option.textContent = `${uom.UoM} (${uom.UoMID})`;
            select.appendChild(option);
        });
    }
}
function populateRouteDropdownForCustomerForm(routes) {
    const select = document.getElementById('routeID'); // Original customer form route select ID
    if (!select) return;
    select.innerHTML = '<option value="">-- Select Route --</option>';
    if (routes && routes.length > 0) {
        routes.forEach(route => {
            const option = document.createElement('option');
            option.value = route.id; // Use id (PK) as value
            option.textContent = route.route; // Use route name as text
            select.appendChild(option);
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
                    <button class="btn btn-sm btn-warning edit-uom-btn" data-id="${uom.UoMID}" data-name="${uom.UoM}"><img src="../public/Assets/edit.png" alt="Edit" class="icon-sm"></button>
                    <button class="btn btn-sm btn-danger delete-uom-btn" data-id="${uom.UoMID}" data-name="${uom.UoM}"><img src="../public/Assets/delete.png" alt="Delete" class="icon-sm"></button>
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
    const id = button.dataset.id;
    const name = button.dataset.name;
    if (confirm(`Delete UoM: ${name} (${id})?\n(Action might fail if UoM is in use)`)) {
        displayMessage('#result-uom', 'Deleting...', true);
        fetch('../knft/deleteUoM.php', { // New endpoint needed
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ UoMID: id }) // Send PK
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
                    <button class="btn btn-sm btn-warning edit-category-btn" data-id="${cat.categoryType}" data-desc="${cat.categoryDesc}"><img src="../public/Assets/edit.png" class="icon-sm"></button>
                    <button class="btn btn-sm btn-danger delete-category-btn" data-id="${cat.categoryType}" data-name="${cat.categoryDesc}"><img src="../public/Assets/delete.png" class="icon-sm"></button>
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
    const id = button.dataset.id; const name = button.dataset.name;
    if (confirm(`Delete Category: ${name} (${id})?\n(Check products)`)) {
        displayMessage('#result-category', 'Deleting...', true);
        fetch('../knft/deleteCategory.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ categoryType: id }) }) // New endpoint needed
            .then(response => { if (!response.ok) throw response; return response.json(); })
            .then(data => { displayMessage('#result-category', data.message, data.success); if(data.success) getCategoryData(); })
            .catch(errorResponse => handleFetchError(errorResponse, '#result-category'));
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
                    <button class="btn btn-sm btn-warning edit-product-btn" data-id="${prod.prod_id}" data-name="${prod.product||''}" data-categoryid="${prod.category_id||''}" data-uomid="${prod.UoM_id||''}" data-price="${prod.price||''}"><img src="../public/Assets/edit.png" class="icon-sm"></button>
                    <button class="btn btn-sm btn-danger delete-product-btn" data-id="${prod.prod_id}" data-name="${prod.product}"><img src="../public/Assets/delete.png" class="icon-sm"></button>
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
    const id = button.dataset.id; const name = button.dataset.name;
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
                    <button class="btn btn-sm btn-danger delete-route-btn" data-id="${route.id}" data-name="${route.route}"><img src="../public/Assets/delete.png" class="icon-sm"></button>
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
         fetch('../knft/deleteRoute.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({route_id: id}) }) // New endpoint needed, send ID
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
                    <button class="btn btn-sm btn-danger delete-customer-btn" data-email="${cust.emailId}" data-name="${cust.customerName}"><img src="../public/Assets/delete.png" class="icon-sm"></button>
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
     const email = button.dataset.email; const name = button.dataset.name;
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
                    <button class="btn btn-sm btn-danger delete-supplier-btn" data-email="${sup.emailID}" data-name="${sup.supplierName}"><img src="../public/Assets/delete.png" class="icon-sm"></button>
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
    const email = button.dataset.email; const name = button.dataset.name;
     if (confirm(`Delete Supplier: ${name} (${email})?\n(Also deletes login account)`)) {
         displayMessage('#result-supplier', 'Deleting...', true);
         fetch('../knft/deleteSupplier.php', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({emailID: email}) }) // New endpoint needed
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