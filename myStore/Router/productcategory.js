const express = require('express');
const router = express.Router();  // Corrected here
const ProductsCategory = require('../Models/ProductsCategoryModel');

// Fetch categories with associated products
router.get('/productCategories', (req, res) => {
    ProductsCategory.find()  // Use find() to get all categories
        .populate('products')  // Populate products field with actual product data
        .then(categories => {
            res.json(categories);  // Respond with the populated categories
        })
        .catch(err => {
            console.log('Error fetching categories:', err);
            res.status(500).json({ message: 'Error fetching categories', error: err });  // Handle errors
        });
});

module.exports = router;
