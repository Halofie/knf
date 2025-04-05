const loadUoM = () => {
  fetch('../knft/getUoM.php')
      .then(response => response.json())
      .then(data => {
          console.log(data); // Handle the received JSON data here
          const uomBody = document.querySelector(".uom-body");
          const itmUoM = document.querySelector(".itmUoM");
          uomBody.innerHTML = ""; // Clear existing content
          for (let i = 0; i < data.length; i++) {
            uomBody.innerHTML += `
              <tr data-id="${data[i].UoMID}">
                  <th scope="row">${data[i].UoMID}</th>
                  <td>${data[i].UoM}</td>
                  <td>
                      <button class="btn btn-success" onclick="editUoM('${data[i].UoMID}')">Edit</button>
                  </td>
              </tr>`;
              itmUoM.innerHTML += `<option value="${data[i].UoMID}">${data[i].UoM}</option>`;
          }
          document.getElementById("uomForm").reset();
      })
      .catch(error => console.error('Error fetching data:', error));
};

const editUoM = (oldId) => {
  if (typeof oldId !== "string") {
      console.error("Invalid UoMID:", oldId);
      alert("Error: UoMID must be a string.");
      return;
  }

  console.log("Editing UoM with ID:", oldId);
  const uomRow = document.querySelector(`tr[data-id='${oldId}']`);
  if (!uomRow) {
      console.error("Row not found for ID:", oldId);
      return;
  }

  const oldUoMName = uomRow.querySelector('td:nth-child(2)').innerText;

  // Prompt user to enter new values
  const newId = prompt("Edit UoMID:", oldId);
  const newUoMName = prompt("Edit UoM Name:", oldUoMName);

  // Check if user entered values and they are different
  if (newId !== null && newUoMName !== null && (newId !== oldId || newUoMName !== oldUoMName)) {
      const formData = {
          oldUoMID: oldId,  // Old UoMID for reference
          newUoMID: newId,  // New UoMID to update
          UoM: newUoMName
      };

      console.log("Sending data:", formData);

      fetch('../knft/editUoM.php', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
      })
      .then(response => response.json())
      .then(data => {
          console.log("Response from server:", data);
          alert(data.message);
          loadUoM();  // Refresh table
      })
      .catch(error => {
          console.error('Error:', error);
          alert('An error occurred. Please try again.');
      });
  }
};


const loadCategory = () => {
  fetch('../knft/getCategory.php')
      .then(response => response.json())
      .then(data => {
          console.log(data);
          const categoryBody = document.querySelector(".category-body");
          const itmCategory = document.querySelector(".itmCategory");
          categoryBody.innerHTML = ""; // Clear table before appending new rows

          data.forEach(item => {
              categoryBody.innerHTML += `
                  <tr data-id="${item.categoryType}">
                    <th scope="row">${item.categoryType}</th>
                    <td>${item.categoryDesc}</td>
                    <td>
                        <button class="btn btn-success" onclick="editCategory('${item.categoryType}')">Edit</button>
                    </td>
                  </tr>`;

              // Populate dropdown
              itmCategory.innerHTML += `<option value="${item.categoryType}">${item.categoryDesc}</option>`;
          });

          document.getElementById("categoryForm").reset();
      })
      .catch(error => console.error('Error fetching data:', error));
};


const editCategory = (oldCategoryType) => {
  const categoryRow = document.querySelector(`tr[data-id='${oldCategoryType}']`);

  if (!categoryRow) {
      alert("Row not found for Category Type: " + oldCategoryType);
      return;
  }

  const oldCategoryDesc = categoryRow.querySelector('td:nth-child(2)').innerText;

  const newCategoryType = prompt('Enter new Category Type:', oldCategoryType);
  const newCategoryDesc = prompt('Enter new Category Description:', oldCategoryDesc);

  if (!newCategoryType || !newCategoryDesc) {
      alert("Both fields are required!");
      return;
  }

  fetch('../knft/editCategory.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
          oldCategoryType: oldCategoryType,
          newCategoryType: newCategoryType,
          newCategoryDesc: newCategoryDesc
      })
  })
  .then(response => response.json())
  .then(data => {
      alert(data.message);
      if (data.success) {
          // Update the row in the frontend without reloading the whole table
          categoryRow.setAttribute("data-id", newCategoryType);
          categoryRow.querySelector('th').innerText = newCategoryType;
          categoryRow.querySelector('td:nth-child(2)').innerText = newCategoryDesc;
          categoryRow.querySelector('button').setAttribute("onclick", `editCategory('${newCategoryType}')`);
      }
      loadCategory(); // Refresh the table
  })
  .catch(error => {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
  });
};




const loadProducts = () => {
  fetch('../knft/getProduct.php')
      .then(response => response.json())
      .then(data => {
          console.log(data); // Debugging
          const productTable = document.querySelector(".product-body");
          productTable.innerHTML = ""; // Clear existing table data

          for (let i = 0; i < data.data.length; i++) {
              const row = `
                  <tr>
                      <td>${data.data[i].prod_id}</td>
                      <td>${data.data[i].category_id}</td>
                      <td>${data.data[i].product}</td>
                      <td>${data.data[i].UoM_id}</td>
                      <td>${data.data[i].price}</td>
                      <td>
                          <button class="btn btn-success" onclick="editProduct(${data.data[i].prod_id})">Edit</button>
                      </td>
                  </tr>`;
              productTable.innerHTML += row;
          }
      })
      .catch(error => console.error('Error fetching data:', error));
};

const editProduct = (prod_id) => {
  const category_id = prompt("Enter new Category ID:");
  const product = prompt("Enter new Product Name:");
  const UoM_id = prompt("Enter new UoM ID:");
  const price = prompt("Enter new Price:");

  if (!category_id || !product || !UoM_id || !price) {
      alert("All fields are required!");
      return;
  }

  fetch('../knft/editProducts.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prod_id, category_id, product, UoM_id, price })
  })
  .then(response => response.json())
  .then(data => {
      alert(data.message);
      if (data.success) {
          loadProducts(); // Reload products after update
      }
  })
  .catch(error => console.error('Error updating product:', error));
};


const loadRoutes = () => {
    fetch('../knft/getRoutes.php')
        .then(response => response.json())
        .then(data => {
            console.log(data); // Debugging
            
            // Populate the route table
            const routeBody = document.querySelector(".route-body");
            routeBody.innerHTML = ""; // Clear existing table data
            for (let i = 0; i < data.length; i++) {
                const row = `
                    <tr>
                        <td>${data[i].route}</td>
                        <td>${data[i].deliveryType}</td>
                        <td>${data[i].rate}</td>
                        <td>
                            <button class="btn btn-success" onclick="editRoutes('${data[i].route}')">Edit</button>
                        </td>
                    </tr>`;
                routeBody.innerHTML += row;
            }
  
            // Populate the route dropdown in the customer registration form
            const routeDropdown = document.querySelector("#routeID");
            if (routeDropdown) {
                routeDropdown.innerHTML = '<option value="">Select Route</option>'; // Clear and add default option
                for (let i = 0; i < data.length; i++) {
                    const option = `<option value="${data[i].route}">${data[i].route}</option>`;
                    routeDropdown.innerHTML += option;
                }
            }
        })
        .catch(error => console.error('Error fetching data:', error));
};



const editRoutes = (oldRoute) => {
  const newRoute = prompt("Enter new Route Name:");
  const newDeliveryType = prompt("Enter new Delivery Type:");

  if (!newRoute || !newDeliveryType) {
      alert("Both fields are required!");
      return;
  }

  fetch('../knft/editRoutes.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldRoute, newRoute, newDeliveryType })
  })
  .then(response => response.json())
  .then(data => {
      alert(data.message);
      if (data.success) {
          loadRoutes(); // Reload routes after update
      }
  })
  .catch(error => console.error('Error updating route:', error));
};

const loadCustomers = () => {
  fetch('../knft/getCustomer.php')
      .then(response => response.json())
      .then(data => {
          console.log(data); // Debugging
          const customerBody = document.querySelector(".customer-body");
          customerBody.innerHTML = ""; // Clear existing table data

          for (let i = 0; i < data.length; i++) {
              const row = `
                  <tr>
                      <td>${data[i].customerName}</td>
                      <td>${data[i].routeID}</td>
                      <td>${data[i].contact}</td>
                      <td>${data[i].alternativeContact}</td>
                      <td>${data[i].address}</td>
                      <td>${data[i].emailID}</td>
                      <td>
                          <button class="btn btn-success" onclick="editCustomer('${data[i].emailID}')">Edit</button>
                      </td>
                  </tr>`;
              customerBody.innerHTML += row;
          }
      })
      .catch(error => console.error('Error fetching data:', error));
};


const editCustomer = (oldEmailID) => {
  const customerName = prompt("Enter New Customer Name:");
  const routeID = prompt("Enter New Route ID:");
  const contact = prompt("Enter New Contact Number:");
  const alternativeContact = prompt("Enter New Alternative Contact Number:");
  const address = prompt("Enter New Address:");
  const newEmailID = prompt("Enter New Email ID:");

  if (!customerName || !routeID || !contact || !alternativeContact || !address || !newEmailID) {
      alert("All fields are required!");
      return;
  }

  fetch('../knft/editCustomer.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldEmailID, customerName, routeID, contact, alternativeContact, address, newEmailID })
  })
  .then(response => response.json())
  .then(data => {
      alert(data.message);
      if (data.success) {
          loadCustomers(); // Reload customers after update
      }
  })
  .catch(error => console.error('Error updating customer:', error));
};


const loadSuppliers = () => {
  fetch('../knft/getSupplier.php')
      .then(response => response.json())
      .then(data => {
          console.log(data); // Debugging
          const supplierBody = document.querySelector(".supplier-body");
          supplierBody.innerHTML = ""; // Clear existing table data

          for (let i = 0; i < data.length; i++) {
              const row = `
                  <tr>
                      <td>${data[i].supplierName}</td>
                      <td>${data[i].farmLocation}</td>
                      <td>${data[i].contact}</td>
                      <td>${data[i].alternativeContact}</td>
                      <td>${data[i].farmSize}</td>
                      <td>${data[i].emailID}</td>
                      <td>
                          <button class="btn btn-success" onclick="editSupplier('${data[i].emailID}')">Edit</button>
                      </td>
                  </tr>`;
              supplierBody.innerHTML += row;
          }
      })
      .catch(error => console.error('Error fetching data:', error));
};


const editSupplier = (oldEmailID) => {
  const supplierName = prompt("Enter New Supplier Name:");
  const farmLocation = prompt("Enter New Farm Location:");
  const contact = prompt("Enter New Contact Number:");
  const alternativeContact = prompt("Enter New Alternative Contact Number:");
  const farmSize = prompt("Enter New Farm Size:");
  const newEmailID = prompt("Enter New Email ID:");

  if (!supplierName || !farmLocation || !contact || !alternativeContact || !farmSize || !newEmailID) {
      alert("All fields are required!");
      return;
  }

  fetch('../knft/editSupplier.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldEmailID, supplierName, farmLocation, contact, alternativeContact, farmSize, newEmailID })
  })
  .then(response => response.json())
  .then(data => {
      alert(data.message);
      if (data.success) {
          loadSuppliers(); // Reload suppliers after update
      }
  })
  .catch(error => console.error('Error updating supplier:', error));
};

const loadWeek = () => {
  fetch('../knft/getWeek.php')
      .then(response => response.json())
      .then(data => {
          console.log(data); // Debugging
          const weekBody = document.querySelector(".week-body");
          weekBody.innerHTML = ""; // Clear existing table data

          for (let item of data) {
              const row = `
                  <tr>
                      <th scope="row">${item.weekID}</th>
                      <td>${item.weekdate}</td>
                      <td>
                          <button class="btn btn-success" onclick="editWeek(${item.weekID})">Edit</button>
                      </td>
                  </tr>`;
              weekBody.innerHTML += row;
          }
      })
      .catch(error => console.error('Error fetching data:', error));
};


const editWeek = (weekID) => {
  const weekdate = prompt("Enter New Week Date:");

  if (!weekdate) {
      alert("Week date is required!");
      return;
  }

  fetch('../knft/editWeek.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weekID, weekdate })
  })
  .then(response => response.json())
  .then(data => {
      alert(data.message);
      if (data.success) {
          loadWeek(); // Reload weeks after update
      }
  })
  .catch(error => console.error('Error updating week:', error));
};


loadUoM();
loadCategory();
loadProducts();
loadRoutes();
loadCustomers();
loadSuppliers();
loadWeek();

//to sent data to sql - done with form action
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('uomForm').addEventListener('submit', function(e) {
      e.preventDefault(); // Prevent the default form submission
      console.log("work")
      // Get form data and convert it to JSON
      const formData = {
          UoMID: document.getElementById('UoMID').value,
          UoM: document.getElementById('UoM').value
      };
      const jsonData = JSON.stringify(formData);

      fetch('../knft/submitUoM.php', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: jsonData
      })
      .then(response => response.text())
      .then(data => {
          document.getElementById('result-uom').innerText = data; // Display the response in the result div
          document.querySelector(".uom-body").innerHTML="";
          loadUoM();
      })
      .catch(error => {
          document.getElementById('result-uom').innerText = 'An error occurred. Please try again.';
      });
  });
});
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('weekForm').addEventListener('submit', function(e) {
      e.preventDefault(); // Prevent the default form submission
      console.log("work");
      const dateInput = document.getElementById('weekDate').value;
      if (dateInput) { 
          const dateParts = dateInput.split('-'); // Split the input date (YYYY-MM-DD) 
          const formattedDate = dateParts[2] + dateParts[1] + dateParts[0].substring(2, 4); // Reformat to DDMMYY 
          document.getElementById('formattedWeekDate').value = formattedDate; // Set the hidden input value 
      }
      // Get form data and convert it to JSON
      const formData = {
          weekdate: document.getElementById('weekDate').value
      };
      const jsonData = JSON.stringify(formData);

      fetch('../knft/submitWeek.php', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: jsonData
      })
      .then(response => response.text())
      .then(data => {
          document.getElementById('result-week').innerText = data; // Display the response in the result div
          document.querySelector(".week-body").innerHTML="";
          loadWeek();
      })
      .catch(error => {
          document.getElementById('result-week').innerText = 'An error occurred. Please try again.';
      });
  });
});
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('categoryForm').addEventListener('submit', function(e) {
      e.preventDefault(); // Prevent the default form submission
      console.log("work")
      // Get form data and convert it to JSON
      const formData = {
        categoryType: document.getElementById('categoryType').value,
        categoryDesc: document.getElementById('categoryDesc').value
      };
      const jsonData = JSON.stringify(formData);

      fetch('../knft/submitCategory.php', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: jsonData
      })
      .then(response => response.text())
      .then(data => {
          document.getElementById('result-category').innerText = data; // Display the response in the result div
          document.querySelector(".category-body").innerHTML="";
          loadCategory();
      })
      .catch(error => {
          document.getElementById('result-category').innerText = 'An error occurred. Please try again.';
      });
  });
});

document.querySelector(".ADDPRODUCT").addEventListener("click",(e)=>{
  e.preventDefault(); // Prevent the default form submission
  console.log("work")
  // Get form data and convert it to JSON
  if (!validateForm()) {
    return;
  }
  else {
    const ProductZIP =  {
        category_id:document.querySelector(".itmCategory").value,
        product: document.querySelector(".itmProduct").value,
        UoM_id: document.querySelector(".itmUoM").value,
        price: document.querySelector(".itmRate").value,
    };
    const jsonData = JSON.stringify(ProductZIP);

    fetch('../knft/submitProduct.php', {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json'
        },
        body: jsonData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
        document.querySelector(".product-body").innerHTML="";
        loadProducts();
    })
    .catch((error) => {
        console.error('Error:', error);
        document.querySelector(".product-body").innerHTML="";
        loadProducts();
    })
}});
document.querySelector("#routeForm").addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent the default form submission
  // Get form data and convert it to JSON
  let formData = new FormData(e.target);
  let data = {};
  formData.forEach((value, key) => {
      data[key] = value;
  });
  console.log(data);

  fetch('../knft/submitRoute.php', {
      method: 'POST',
      headers: {
          "Content-Type": 'application/json'
      },
      body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
      console.log('Success:', data);
      document.querySelector(".route-body").innerHTML = "";
      loadRoutes();
  })
  .catch((error) => {
      document.querySelector(".route-body").innerHTML = "";
      loadRoutes();
  });
});

//------------------------------------------------------------------------------------------------------------

// Supplier Form Submission
 document.querySelector("#supplierForm").addEventListener("submit", (e) => {
  e.preventDefault();// Prevent the default form submission
  // Get form data and convert it to JSON
  let formData = new FormData(e.target);
  let data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });
  console.log("Supplier form data:", data);
  // Fetch for submitSupplier.php
  fetch('../knft/submitSupplier.php', {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Supplier Submit Success:', data);
    document.querySelector(".supplier-body").innerHTML = "";
    loadSuppliers();
  })
  .catch((error) => {
    console.error('Supplier Submit Error:', error);
    document.querySelector(".supplier-body").innerHTML = "";
    loadSuppliers();
  });
  // Fetch for submitSupplierAcc.php
  fetch('../knft/submitSupplierAcc.php', {
    method: 'POST',
    headers: {
      "Content-Type": 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Supplier Account Submit Success:', data);
  })
  .catch((error) => {
    console.error('Supplier Account Submit Error:', error);
  });
});

//------------------------------------------------------------------------------------------------------------

// Customer Form Submission
document.querySelector("#customerForm").addEventListener("submit", (e) => {
  e.preventDefault(); // Prevent the default form submission
  // Get form data and convert it to JSON
  let formData = new FormData(e.target);
  let data = {};
  formData.forEach((value, key) => {
      data[key] = value;
  });
  console.log(data);

  fetch('../knft/submitCustomer.php', {
      method: 'POST',
      headers: {
          "Content-Type": 'application/json'
      },
      body: JSON.stringify(data)
  })
  fetch('../knft/submitCustomerAcc.php', {
    method: 'POST',
    headers: {
        "Content-Type": 'application/json'
    },
    body: JSON.stringify(data)
  })
}).then(response => response.json())
.then(data => {
      console.log('Supplier Submit Success:', data);
      document.querySelector(".customer-body").innerHTML = "";
      loadCustomers();
  })
.catch((error) => {
      console.error('Customer Submit Error:', error);
      document.querySelector(".customer-body").innerHTML = "";
      loadCustomers();
});

//-----------------------------------------------------------------------------------------------------------
   
function validateForm() {
  let category_id = document.querySelector(".itmCategory").value;
  let product = document.querySelector(".itmProduct").value;
  let UoM_id = document.querySelector(".itmUoM").value;
  let price = document.querySelector(".itmRate").value;

  if (category_id === "" || product === "" || UoM_id === "" || price === "") {
      alert("All fields must be filled out");
      return false;
  }
  return true;
}

//---------------------------------------------------------------------------------------------------------------
document.getElementById('downloadOrdersBtn').addEventListener('click', function() {
  fetch('../knft/printorder.php')
      .then(response => {
          if (response.ok) {
              return response.blob();
          }
          throw new Error('Network response was not ok.');
      })
      .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = 'orders.xlsx';
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
      })
      .catch(error => console.error('Download error:', error));
});

// ...existing code...
