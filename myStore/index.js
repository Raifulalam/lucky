// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

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

// Product.insertMany(productData)
//     .then(() => console.log("Products inserted"))
//     .catch(err => console.log("Error inserting products:", err));


// Get product details by ID


// Sample route
app.get('/', (req, res) => {
    res.send('Hello World! 001120000');
});

// User router (if applicable)
app.use('/api', require('./Router/createUser'));
app.use('/api', require('./Router/createProducts'));

// Get all products


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
