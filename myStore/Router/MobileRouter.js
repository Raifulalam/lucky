const MobileProduct = require('../Models/SmartPhonesModels');
const express = require('express');
const router = express.Router();


// Create a new mobile product
router.post('/mobile', async (req, res) => {
    try {
        const {
            name,
            price,
            brand,
            model,
            color,
            ram,
            storage,
            battery,
            camera,
            processor,
            display,
            operatingSystem,
            releaseDate,
            category,
            description,
            image,
            charging,
            stock,
        } = req.body;

        // Validate the required fields
        if (!name || !price || !brand || !model) {
            return res.status(400).json({ message: 'Missing required fields: name, price, brand, and model are mandatory.' });
        }

        // Create new product
        const newProduct = new MobileProduct({
            name,
            price,
            brand,
            model,
            color,
            ram,
            storage,
            battery,
            camera,
            processor,
            display,
            operatingSystem,
            releaseDate,
            category,
            description,
            image,
            charging,
            stock,
        });

        await newProduct.save();
        res.status(201).json(newProduct); // 201 status code for resource creation
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error: error.message });
    }
});

// Get all mobile products
router.get('/mobile', async (req, res) => {
    try {
        const response = await MobileProduct.find(); // Fetch all mobile products from DB
        res.status(200).json(response); // 200 OK
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products', error: err.message });
    }
});

// Get a specific mobile product by ID
router.get('/mobile/:id', async (req, res) => {
    try {
        const response = await MobileProduct.findById(req.params.id);
        if (!response) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(response); // 200 OK
    } catch (err) {
        res.status(500).json({ message: 'Error fetching product', error: err.message });
    }
});

// Delete product by ID
router.delete('/mobile/:id', async (req, res) => {
    try {
        const product = await MobileProduct.findByIdAndDelete(req.params.id); // Find and delete product by ID
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully', product });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product', error: err.message });
    }
});

// Update mobile product by ID
router.put('/mobile/:id', async (req, res) => {
    try {

        const updatedProduct = await MobileProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(updatedProduct); // Return the updated product
    } catch (err) {
        res.status(500).json({ message: 'Error updating product', error: err.message });
    }
});

module.exports = router;
