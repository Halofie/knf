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
