
# demo https://sims.ar-w.info

# Simple CRUD and Search Filter

This project is a serverless inventory management system that provides a REST API for CRUD operations on an inventory of products. The frontend allows users to interact with the API and perform CRUD operations, with search and filtering functionalities to locate specific products. This system is built with AWS services, including Lambda, DynamoDB, API Gateway.

## Features

- **CRUD Operations**
  - **Create:** add new products to the inventory.
  - **Read:** view product details, including stock level, price, and description.
  - **Update:** update product information.
  - **Delete:** Deletion of products

- **Search and Filtering**
  - Users can search for products by name (case-insensitive).
  - Filters for price range (minimum and maximum), allowing users to find products within a specific price range.

## Technology Stack

- **Backend**
  - AWS Lambda
  - Amazon DynamoDB for database storage.
  - Amazon Route 53 for Alias pointt to CDN
  - Amazon Certificate Manager for TLS/SSL Certificate
  - Amazon API Gateway for RESTful API endpoints.
  - Amazon S3 for Static Website hosting service
  - Github for Repository
  - Github Actions for CI/CD

- **Frontend**
  - HTML, CSS, and JavaScript.
  - Hosted on Amazon S3 as a static website.

