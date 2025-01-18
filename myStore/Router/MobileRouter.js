const MobileProduct = require('../Models/SmartPhonesModels');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../Models/SmartPhonesModels');

// Get all products (mobiles)
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
        } = req.body;
        const newProduct = new Product({
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
        });
        await newProduct.save();
        res.status(200).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})
router.get('/mobile', async (req, res) => {
    try {
        const response = await MobileProduct.find(); // Fetch all mobile products from DB
        res.json(response);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products', error: err.message });
    }
});
router.get('/mobile/:id', async (req, res) => {
    try {
        const response = await MobileProduct.findById(req.params.id);
        res.json(response);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching product', error: err.message });
    }
});

// Delete product by ID
router.delete('/mobile/:id', async (req, res) => {  // Corrected the URL parameter syntax
    try {
        const product = await MobileProduct.findByIdAndDelete(req.params.id); // Using async/await
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json({ message: 'Product deleted successfully', product });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product', error: err.message });
    }
});

router.put('/mobile/:id', async (req, res) => {
    try {
        // Perform some task, like updating the product
        const updatedProduct = await MobileProduct.findByIdAndUpdate(req.params.id, req.body);
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(updatedProduct);
    } catch (err) {

    }
});


module.exports = router;
