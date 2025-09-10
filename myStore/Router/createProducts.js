const express = require('express');
const router = express.Router();
const Product = require('../Models/products');


// ✅ Create a single product
router.post('/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Get all products (with pagination + optional category filter)
router.get('/products', async (req, res) => {
    try {
        const { category, page = 1, limit = 20 } = req.query;

        const matchCriteria = category ? { category } : {};

        const products = await Product.aggregate([
            { $match: matchCriteria },

            // Sort before grouping
            { $sort: { createdAt: -1, _id: -1 } },

            // Group by model (latest product only)
            {
                $group: {
                    _id: "$model",
                    productDetails: { $first: "$$ROOT" }
                }
            },

            { $replaceRoot: { newRoot: "$productDetails" } },

            { $sort: { createdAt: -1 } },

            // Pagination
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) }
        ]);

        const total = await Product.countDocuments(matchCriteria);

        res.status(200).json({
            products,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ✅ Get products by brand (with pagination)
router.get('/products/brand/:brand', async (req, res) => {
    try {
        const { brand } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const products = await Product.find({ brand })
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const total = await Product.countDocuments({ brand });

        res.status(200).json({
            products,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ✅ Search products by keyword (name, model, brand, description)
router.get('/products/search/:keyword', async (req, res) => {
    try {
        const { keyword } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const query = {
            $or: [
                { name: new RegExp(keyword, "i") },
                { model: new RegExp(keyword, "i") },
                { brand: new RegExp(keyword, "i") },
                { description: new RegExp(keyword, "i") },
                { keywords: new RegExp(keyword, "i") }
            ]
        };

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip((parseInt(page) - 1) * parseInt(limit))
            .limit(parseInt(limit));

        const total = await Product.countDocuments(query);

        res.status(200).json({
            products,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit),
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// ✅ Get a product by ID
router.get('/productsDetails/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Delete product by ID
router.delete('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// ✅ Update product by ID
router.put('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;
