// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const Product = require('./Models/products');
const productData = require('./productsData');


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

// // Post the data to the database
app.post('/api/products', async (req, res) => {
    try {
        const productsData = req.body.Products;
        const products = await Product.insertMany(productsData);
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Product.insertMany(productData)
//     .then(() => console.log("Products inserted"))
//     .catch(err => console.log("Error inserting products:", err));


// Get product details by ID
app.get('/api/productsDetails/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id); // Find a product by its ID
        if (!product) {
            return res.status(404).json({ message: 'Product not found' }); // If no product found, return 404
        }
        res.status(200).json(product); // Return the found product
    } catch (error) {
        res.status(500).json({ message: error.message }); // Return any server error
    }
});

// Sample route
app.get('/', (req, res) => {
    res.send('Hello World! 001120000');
});

// User router (if applicable)
app.use('/api', require('./Router/createUser'));

// Get all products
app.get('/api/products', (req, res) => {
    Product.find()
        .then(products => res.json(products))
        .catch(err => res.status(500).json({ message: err.message }));
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
