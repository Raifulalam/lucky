// Import necessary modules
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');


const cors = require('cors');

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


// Sample route
app.get('/', (req, res) => {
    res.send('Sucess ');
});

// User router (if applicable)
app.use('/api', require('./Router/createUser'));
app.use('/api', require('./Router/createProducts'));
app.use('/api', require('./Router/createOrder'));
app.use('/api', require('./Router/complaints'));
app.use('/api', require('./Router/productcategory'));
app.use('/api', require('./Router/contactMessage'));
app.use('/api', require('./Router/MobileRouter'));



app.use('/uploads', express.static(path.join(__dirname, './uploads')));
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
