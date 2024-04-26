// Global variable to hold products
let products = [];  // This is the list that all functions can use

const apiUrl = "https://hez5ohf737.execute-api.us-east-1.amazonaws.com/prod"; // Replace with your API Gateway endpoint

// Function to toggle between dark and light modes
function toggleDarkMode() {
  const body = document.body;
  if (body.classList.contains("dark-mode")) {
    body.classList.remove("dark-mode");
    body.classList.add("light-mode");
  } else {
    body.classList.remove("light-mode");
    body.classList.add("dark-mode");
  }
}

// Function to handle product form submission (create or update)
async function handleProductSubmit(event) {
  event.preventDefault();

  // Reset the error/success message field
  setNotification(""); // Clear existing message

  const productId = document.getElementById("product-id").value;
  const productName = document.getElementById("product-name").value;
  const productDescription = document.getElementById("product-description").value;
  const productPrice = parseFloat(document.getElementById("product-price").value);
  const productStock = parseInt(document.getElementById("product-stock").value);

  const product = {
    name: productName,
    description: productDescription,
    price: productPrice,
    stock: productStock,
  };

  if (productId) {
    // Update product
    const success = await updateProduct(productId, product);
    if (success) {
      setNotification("Product updated successfully");
    } else {
      setNotification("Failed to update product");
    }
  } else {
    // Create new product
    const success = await createProduct(product);
    if (success) {
      setNotification("Product created successfully");
    } else {
      setNotification("Failed to create product");
    }
  }

  // Reset the form and reload products
  document.getElementById("product-form").reset();
  document.getElementById("product-id").value = "";
  loadProducts(); // Reload product list after update
}

// Function to create a new product
async function createProduct(product) {
  const response = await fetch(`${apiUrl}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });

  return response.ok; // Returns true if successful, false otherwise
}

// Function to update an existing product
// async function updateProduct(productId, product) {
//   const response = await fetch(`${apiUrl}/products/${productId}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(product),
//   });

//   return response.ok; // Returns true if successful, false otherwise
// }

// Function to update an existing product with productId included in the body
async function updateProduct(productId, product) {
    // Include productId in the product object
    const productWithId = {
      ...product,
      id: productId,
    };
    const response = await fetch(`${apiUrl}/products`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productWithId), // Ensure productId is part of the body
    });
  
    return response.ok; // Returns true if successful, false otherwise
  }
  

// Function to delete a product
async function deleteProduct(productId) {
  const response = await fetch(`${apiUrl}/products?id=${productId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    setNotification("Failed to delete product");
  } else {
    setNotification("Product deleted successfully");  // Notification for successful DELETE
  }

  loadProducts(); // Reload product list after delete
}

// Function to load all products from the API
async function loadProducts() {
  const response = await fetch(`${apiUrl}/products`, {
    method: "GET"
  });

  if (response.ok) {
    products = await response.json();  // Populate the global products list
    displayProducts(products);  // Display the products in the table
  } else {
    setNotification("Failed to load products");
  }
}

// Function to display products in the table
function displayProducts(products) {
  const productList = document.getElementById("product-list").getElementsByTagName("tbody")[0];
  productList.innerHTML = "";  // Clear existing rows

  products.forEach((product) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${product.name}</td>
      <td>${product.description}</td>
      <td>${product.price}</td>
      <td>${product.stock}</td>
      <td>
        <button onclick="editProduct('${product.id}')">Edit</button>
        <button onclick="deleteProduct('${product.id}')">Delete</button>
      </td>
    `;
    productList.appendChild(row);
  });
}

// Function to edit a product (pre-fill form)
function editProduct(productId) {
  const product = products.find((p) => p.id === productId);  // Find the correct product in the global products list
  if (product) {
    document.getElementById("product-id").value = productId;
    document.getElementById("product-name").value = product.name;
    document.getElementById("product-description").value = product.description;
    document.getElementById("product-price").value = product.price;
    document.getElementById("product-stock").value = product.stock;
  }
}

// Function to set the error or success message
function setNotification(message) {
  document.getElementById("notification").innerText = message;
}

// Load products on page load
window.onload = function () {
  loadProducts();  // Ensure products are loaded when the page is loaded
};
