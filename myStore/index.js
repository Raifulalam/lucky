// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const Product = require('./Models/products');
const ProductCategory = require('./Models/ProductsCategoryModel');

const cors = require('cors');

// const productData = require('./productsData');
// const productCategories = require('./productsCategories');



// Load environment variables from .env file
require('dotenv').config();

// Middleware
const app = express();
const port = 3000;
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection URI from environment variables
const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(mongoURI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.log('Error connecting to MongoDB:', err);
    });

// Post the data to the database

// Product.insertMany(productData)
//     .then(() => console.log("Products inserted"))
//     .catch(err => console.log("Error inserting products:", err));


// // insert productCategory
// ProductCategory.insertMany(productCategories)
//     .then(() => console.log("Product Categories inserted"))
//     .catch(err => console.log("Error inserting product categories:", err));



// Sample route
app.get('/', (req, res) => {
    res.send('Hello World! 001120000');
});

// User router (if applicable)
app.use('/api', require('./Router/createUser'));
app.use('/api', require('./Router/createProducts'));
app.use('/api', require('./Router/createOrder'));
app.use('/api', require('./Router/complaints'));
app.use('/api', require('./Router/productcategory'));
app.use('/api', require('./Router/contactMessage'));


// Get all products


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
