const express = require("express");
const router = express.Router();

const User = require("../Models/user.model");
const Order = require("../Models/order");
const Complaint = require("../Models/complaintsSchema");
const Review = require("../Models/contactMessage");
const Product = require("../Models/products");
const Inventory = require("../Models/Inventory");

const authenticateToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");

/**
 * GET DASHBOARD STATS (ADMIN ONLY)
 * GET /api/dashboard/stats
 */
router.get(
    "/stats",
    authenticateToken,
    isAdmin,
    async (req, res) => {
        try {
            const [
                users,
                orders,
                complaints,
                reviews,
                products,
                invOutOfStock,
                invLowStock,
                legacyOutOfStock,
            ] = await Promise.all([
                User.countDocuments(),
                Order.countDocuments(),
                Complaint.countDocuments(),
                Review.countDocuments(),
                Product.countDocuments(),
                Inventory.countDocuments({ currentStock: { $lte: 0 }, status: "ACTIVE" }),
                Inventory.countDocuments({
                    status: "ACTIVE",
                    $expr: {
                        $and: [
                            { $gt: ["$currentStock", 0] },
                            { $lte: ["$currentStock", "$reorderLevel"] }
                        ]
                    }
                }),
                Product.countDocuments({ stock: { $lte: 0 } }),
            ]);

            // Prefer Inventory count, fallback to legacy Product.stock if inventory has not been initialized
            const totalInventoryRecords = await Inventory.countDocuments();
            const outOfStockProducts = totalInventoryRecords > 0 ? invOutOfStock : legacyOutOfStock;

            return res.status(200).json({
                success: true,
                data: {
                    users,
                    orders,
                    complaints,
                    reviews,
                    products,
                    outOfStockProducts,
                    lowStockProducts: invLowStock,
                },
            });
        } catch (error) {
            console.error("Dashboard Stats Error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch dashboard stats",
            });
        }
    }
);

module.exports = router;
