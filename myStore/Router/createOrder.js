const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../Models/order');
const ObjectId = mongoose.Types.ObjectId;

// POST: Create Order
router.post('/createOrder', async (req, res) => {
    const orderData = req.body;

    try {
        const user = orderData.user;
        if (!user || !user.name || !user.email || !user.userId) {
            return res.status(400).json({
                message: "User information is missing required fields: name, email, and userId."
            });
        }
        const newOrder = new Order({
            items: orderData.items,
            user: {
                name: user.name,
                email: user.email,
                userId: user.userId
            },
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
// router.get('/orders/:id', async (req, res) => {
//     try {
//         const order = await Order.findById(req.params.id);
//         if (!order) {
//             return res.status(404).json({ message: 'Order not found' });
//         }
//         res.json(order);
//     }
//     catch (err) {
//         console.error('Error fetching order:', err);  // Log error for debugging
//         res.status(500).json({ message: 'Error fetching order', error: err.message });
//     }
// });

router.get('/orders/:id', async (req, res) => {
    try {
        const userId = new ObjectId(req.params.id);
        const orders = await Order.find({ 'user.userId': userId });
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No orders found for this user' });
        }
        res.json(orders); // Return all orders for the user
    }
    catch (err) {
        console.error('Error fetching order:', err);  // Log error for debugging
        res.status(500).json({ message: 'Error fetching order', error: err.message });
    }
});

// PUT: Update Order
router.put('/orders/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.json(order);
    }
    catch (err) {
        console.error('Error updating order:', err);  // Log error for debugging
        res.status(500).json({ message: 'Error updating order', error: err.message });
    }
});

// DELETE: Delete Order// DELETE: Delete Order
router.delete('/orders/:id', async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);  // Use findByIdAndDelete instead
        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });  // If order doesn't exist, return 404
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error('Error deleting order:', err);  // Log the error on the server
        res.status(500).json({ message: 'Error deleting order', error: err.message });
    }
});




module.exports = router;
