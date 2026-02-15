const express = require("express");
const router = express.Router();

const User = require("../Models/user.model");
const Order = require("../Models/order");
const Complaint = require("../Models/complaintsSchema");
const Review = require("../Models/contactMessage");
const Product = require("../Models/products");

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
                outOfStockProducts,
            ] = await Promise.all([
                User.countDocuments(),
                Order.countDocuments(),
                Complaint.countDocuments(),
                Review.countDocuments(),
                Product.countDocuments(),
                Product.countDocuments({ stock: { $lte: 0 } }),
            ]);

            return res.status(200).json({
                success: true,
                data: {
                    users,
                    orders,
                    complaints,
                    reviews,
                    products,
                    outOfStockProducts,
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
