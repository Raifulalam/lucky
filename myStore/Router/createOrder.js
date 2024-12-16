const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../Models/order');




router.post('/createOrder', async (req, res) => {
    const orderData = req.body;
    try {
        const newOrder = new Order({
            items: orderData.items,
            totalPrice: orderData.totalPrice,
            tax: orderData.tax,
            deliveryDate: orderData.deliveryDate,

        });
        await newOrder.save();
        res.status(201).json({ message: 'Order created successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error creating order' });
    }
});
router.get('/orders', (req, res) => {
    Order.find()
        .then((orders) => {
            res.json(orders);
        }).catch((err) => {
            res.status(500).json({ message: 'Error fetching orders' });
        });
})
module.exports = router;
