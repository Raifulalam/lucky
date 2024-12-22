const express = require('express');
const router = express.Router();
const Product = require('../Models/products');

// Create multiple products
router.post('/products', async (req, res) => {
    try {
        const productsData = req.body.Products;  // Assuming body contains an array of products
        const products = await Product.insertMany(productsData);
        res.status(200).json(products);  // Send back the inserted products
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all products or filter by category
router.get('/products', async (req, res) => {
    try {
        const { category } = req.query;  // Get the category from query parameters
        let products;

        if (category) {
            // If category is provided, filter products by category
            products = await Product.find({ category: category });
        } else {
            // Otherwise, get all products
            products = await Product.find();
        }

        res.status(200).json(products);  // Send products to client
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a product by ID
router.get('/productsDetails/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id); // Find a product by ID
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product); // Return the found product
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete product
router.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);  // Find and delete product by ID
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a product
router.put('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }); // Update the product
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);  // Return the updated product
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;  // Export the router so it can be used in the main app
