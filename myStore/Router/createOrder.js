const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Order = require("../Models/order");
const authenticateToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/**
 * CREATE ORDER (USER)
 */
router.post("/orders", authenticateToken, async (req, res) => {
    try {
        const {
            items,
            totalPrice,
            tax,
            deliveryDate,
            address,
            phone,
            name,
            postalCode,
            country,
            deliveryInstructions,
            additionalPhone,
        } = req.body;

        // 1️⃣ Validate items array
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Cart items are required" });
        }

        for (const item of items) {
            if (!mongoose.Types.ObjectId.isValid(item.itemId)) {
                return res.status(400).json({ message: `Invalid itemId: ${item.itemId}` });
            }
            if (!item.name || !item.price || !item.quantity) {
                return res.status(400).json({ message: "Each item must have name, price, and quantity" });
            }
        }

        // 2️⃣ Validate user info
        if (!req.user || !req.user.id || !req.user.name || !req.user.email) {
            return res.status(401).json({ message: "Invalid user info" });
        }

        // 3️⃣ Validate required order fields
        if (!totalPrice || !tax || !deliveryDate || !address || !phone || !name || !postalCode || !country) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const newOrder = new Order({
            items,
            user: {
                userId: req.user.id,
                name: req.user.name,
                email: req.user.email
            },
            totalPrice,
            tax,
            deliveryDate,
            name,
            address,
            phone,
            postalCode,
            country,
            deliveryInstructions,
            additionalPhone
        });

        await newOrder.save();

        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: newOrder,
        });

    } catch (error) {
        console.error("Create Order Error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});


/**
 * GET MY ORDERS (USER)
 */
router.get("/orders/my", authenticateToken, async (req, res) => {
    try {
        const orders = await Order.find({ "user.userId": req.user.id }).sort({
            createdAt: -1,
        });

        res.json(orders);
    } catch (error) {
        console.error("Fetch My Orders Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * GET ALL ORDERS (ADMIN)
 */
router.get("/orders", authenticateToken, isAdmin, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        console.error("Fetch Orders Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * GET SINGLE ORDER (ADMIN)
 */
router.get("/orders/:id", authenticateToken, isAdmin, async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid order ID" });
    }

    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });

        res.json(order);
    } catch (error) {
        console.error("Fetch Order Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * UPDATE ORDER (ADMIN)
 */
router.put("/orders/:id", authenticateToken, isAdmin, async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid order ID" });
    }

    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!updatedOrder)
            return res.status(404).json({ message: "Order not found" });

        res.json(updatedOrder);
    } catch (error) {
        console.error("Update Order Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

/**
 * DELETE ORDER (ADMIN)
 */
router.delete("/orders/:id", authenticateToken, isAdmin, async (req, res) => {
    if (!isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid order ID" });
    }

    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder)
            return res.status(404).json({ message: "Order not found" });

        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error("Delete Order Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
