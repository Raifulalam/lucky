// routes/dashboard.js
const express = require('express');
const router = express.Router();
const User = require('../Models/user.model');
const Order = require('../Models/order');
const Complaint = require('../Models/complaintsSchema');
const Review = require('../Models/contactMessage');
const Product = require('../Models/products');


// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
    try {
        const [users, orders, complaints, reviews, products, brands] = await Promise.all([
            User.countDocuments(),
            Order.countDocuments(),
            Complaint.countDocuments(),
            Review.countDocuments(),
            Product.countDocuments(),

        ]);

        res.json({
            users,
            orders,
            complaints,
            reviews,
            products,

        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;
