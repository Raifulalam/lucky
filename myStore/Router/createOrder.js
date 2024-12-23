const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../Models/order');

// POST: Create Order
router.post('/createOrder', async (req, res) => {
    const orderData = req.body;

    // Validate input data before creating the order
    if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        return res.status(400).json({ message: 'Items are required and must be an array with at least one item' });
    }

    if (!orderData.totalPrice || typeof orderData.totalPrice !== 'number') {
        return res.status(400).json({ message: 'Total price must be provided and should be a number' });
    }

    if (!orderData.tax || typeof orderData.tax !== 'number') {
        return res.status(400).json({ message: 'Tax must be provided and should be a number' });
    }

    if (!orderData.deliveryDate) {
        return res.status(400).json({ message: 'Delivery date is required' });
    }

    if (!orderData.address) {
        return res.status(400).json({ message: 'Address is required' });
    }

    // Validate new fields
    if (!orderData.postalCode) {
        return res.status(400).json({ message: 'Postal code is required' });
    }

    if (!orderData.country) {
        return res.status(400).json({ message: 'Country is required' });
    }

    try {
        // Create a new order
        const newOrder = new Order({
            items: orderData.items,
            totalPrice: orderData.totalPrice,
            tax: orderData.tax,
            deliveryDate: orderData.deliveryDate,
            address: orderData.address,
            phone: orderData.phone,
            name: orderData.name,
            postalCode: orderData.postalCode,  // Added postal code
            country: orderData.country,        // Added country
            deliveryInstructions: orderData.deliveryInstructions,  // Added delivery instructions
            additionalPhone: orderData.additionalPhone  // Added additional phone number
        });

        // Save the order to the database
        await newOrder.save();

        // Respond with a success message
        res.status(201).json({ message: 'Order created successfully', order: newOrder });

    } catch (err) {
        console.error('Error creating order:', err);  // Log error for debugging
        res.status(500).json({ message: 'Error creating order', error: err.message });
    }
});

// GET: Fetch Orders
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        console.error('Error fetching orders:', err);  // Log error for debugging
        res.status(500).json({ message: 'Error fetching orders', error: err.message });
    }
});

module.exports = router;
