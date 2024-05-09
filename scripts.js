// Global variable to hold products
let products = [];  // This is the list that all functions can use

const apiUrl = "https://hez5ohf737.execute-api.us-east-1.amazonaws.com/test"; // Replace with your API Gateway endpoint

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
  const createdAt = document.getElementById("created-at").value;  // Fetch `created_at`
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
    product.created_at = createdAt;
    
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

// Function to update an existing product with productId included in the body
async function updateProduct(productId, product) {
    // Include productId in the product object
    const createdAt = document.getElementById("created-at").value;
    const productWithId = {
      ...product,
      id: productId,
      created_at: createdAt,
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
  const product = products.find((p) => p.id === productId);

  if (product && product.created_at) {
    const response = await fetch(`${apiUrl}/products?id=${productId}&created_at=${product.created_at}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      setNotification("Failed to delete product.");
    } else {
      setNotification("Product deleted successfully.");
    }

    loadProducts(); // Reload the product list after deletion
  } else {
    setNotification("Product deletion failed: created_at is undefined.");
  }
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
    document.getElementById("created-at").value = product.created_at || "Unknown";
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

// Function to apply filters and search
async function applyFilters() {
  const searchQuery = document.getElementById("search-input").value;  // Get search input
  const minPrice = parseFloat(document.getElementById("min-price").value);  // Get min price
  const maxPrice = parseFloat(document.getElementById("max-price").value);  // Get max price
  
  // Create query parameters for filtering
  const queryParams = new URLSearchParams();
  if (searchQuery) queryParams.append("search", searchQuery);
  if (!isNaN(minPrice)) queryParams.append("minPrice", minPrice);
  if (!isNaN(maxPrice)) queryParams.append("maxPrice", maxPrice);

  // Fetch filtered product list from the backend
  const response = await fetch(`${apiUrl}/products?${queryParams.toString()}`);
  
  if (response.ok) {
    const products = await response.json();  // Parse the JSON response
    displayProducts(products);  // Function to display products on the frontend
  } else {
    console.error("Failed to fetch products:", response.statusText);
  }
}

function clearFilters() {
  // Reset search and filtering fields to default values
  document.getElementById("search-input").value = "";  // Clear search input
  document.getElementById("min-price").value = "";  // Clear min price
  document.getElementById("max-price").value = "";  // Clear max price
  
  // Reload product list without filters
  applyFilters();  // Re-apply filters with default (empty) values
  loadProducts();  // Ensure products are loaded when the page is loaded

}

// Load products on page load
window.onload = function () {
  loadProducts();  // Ensure products are loaded when the page is loaded
};


// Function to parse CSV content into a JSON array
function parseCSV(csvContent) {
  const lines = csvContent.split("\n"); // Split CSV content into lines
  const headers = lines[0].split(","); // Get the headers from the first line
  const data = []; // Array to hold parsed data
  
  // Iterate through the remaining lines to create product objects
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "") continue; // Skip empty lines
    const values = line.split(","); // Split the line into values
    const product = {}; // Create a product object

    // Assign values to product object based on headers
    for (let j = 0; j < headers.length; j++) {
      product[headers[j].trim()] = values[j].trim(); // Trim spaces
    }

    data.push(product); // Add the product to the data array
  }

  return data; // Return the JSON array of products
}

// Function to upload CSV data for bulk input
async function uploadCSV() {
  const fileInput = document.getElementById("csv-file");
  if (fileInput.files.length === 0) {
    setNotification("Please select a CSV file to upload."); // No file selected
    return;
  }

  const file = fileInput.files[0]; // Get the selected file

  // Read the CSV file as text
  const reader = new FileReader();
  reader.onload = async (event) => {
    const csvData = event.target.result; // Get the CSV content
    
    // Parse CSV content into a JSON array
    const jsonData = parseCSV(csvData);

    try {
      // Make a POST request to the Lambda function with the JSON array
      const response = await fetch(`${apiUrl}/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData), // Send parsed JSON data
      });

      if (response.ok) {
        setNotification("Bulk upload successful!"); // Display success message
        loadProducts();
      } else {
        setNotification("Bulk upload failed."); // Display error message
      }

    } catch (error) {
      setNotification("An error occurred during the upload."); // Handle exceptions
    }
  };

  reader.readAsText(file); // Read the CSV file
}


function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  CognitoAuth.signIn(username, password)
    .then((user) => {
      console.log('Login successful:', user);
      // Redirect or update UI to reflect login status
    })
    .catch((error) => {
      console.error('Login failed:', error);
    });
}

function handleSignup(event) {
  event.preventDefault();
  const newUsername = document.getElementById('new-username').value;
  const newPassword = document.getElementById('new-password').value;

  CognitoAuth.signUp({
    username: newUsername,
    password: newPassword,
    attributes: {
      email: newUsername, // Assuming email as username
    },
  })
    .then((data) => {
      console.log('Signup successful:', data);
      // Redirect to confirm sign-up or update UI
    })
    .catch((error) => {
      console.error('Signup failed:', error);
    });
}
