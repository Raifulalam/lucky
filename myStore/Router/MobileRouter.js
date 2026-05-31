const express = require("express");
const mongoose = require("mongoose");
const MobileProduct = require("../Models/SmartPhonesModels");
const authenticateToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const redisClient = require("../config/redis");

const router = express.Router();

const getCache = async (key) => {
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error("Redis getCache error:", err);
        return null;
    }
};

const setCache = async (key, value, expiry = 600) => {
    try {
        await redisClient.setEx(key, expiry, JSON.stringify(value));
    } catch (err) {
        console.error("Redis setCache error:", err);
    }
};

const clearMobileCache = async () => {
    try {
        let cursor = 0;
        do {
            const reply = await redisClient.scan(cursor, { MATCH: "mobile:*", COUNT: 100 });
            cursor = Number(reply.cursor);
            const keys = reply.keys;
            if (keys && keys.length > 0) {
                await redisClient.del(keys);
            }
        } while (cursor !== 0);
    } catch (err) {
        console.error("clearMobileCache error:", err);
    }
};

/**
 * CREATE MOBILE (ADMIN ONLY)
 */
router.post(
    "/mobile",
    authenticateToken,
    isAdmin,
    async (req, res) => {
        try {
            const { name, price, brand, model } = req.body;

            if (!name || !price || !brand || !model) {
                return res.status(400).json({
                    success: false,
                    message: "name, price, brand, model are required",
                });
            }

            const product = await MobileProduct.create(req.body);
            await clearMobileCache();

            res.status(201).json({
                success: true,
                message: "Mobile product created",
                data: product,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to create product",
                error: error.message,
            });
        }
    }
);

/**
 * GET ALL MOBILES (PUBLIC, PAGINATED)
 */
router.get("/mobile", async (req, res) => {
    try {
        const { page = 1, limit = 10, brand, price, search } = req.query;
        const cacheKey = `mobile:${brand || "all"}:${price || "all"}:${search || "all"}:${page}:${limit}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            return res.status(200).json(cached);
        }

        const query = {};
        if (brand) query.brand = brand;
        if (price) query.price = { $lte: Number(price) };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { brand: { $regex: search, $options: "i" } },
                { model: { $regex: search, $options: "i" } }
            ];
        }

        const products = await MobileProduct.find(query)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort({ createdAt: -1 })
            .lean();

        const total = await MobileProduct.countDocuments(query);

        const response = {
            success: true,
            total,
            page: Number(page),
            data: products,
        };

        await setCache(cacheKey, response);

        res.status(200).json(response);
    } catch (err) {
        console.error("Error fetching mobiles:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching products",
        });
    }
});

/**
 * GET SINGLE MOBILE BY ID
 */
router.get("/mobile/:id", async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const product = await MobileProduct.findById(req.params.id).lean();

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ success: true, data: product });
    } catch (err) {
        res.status(500).json({ message: "Error fetching product" });
    }
});

/**
 * UPDATE MOBILE (ADMIN ONLY)
 */
router.put(
    "/mobile/:id",
    authenticateToken,
    isAdmin,
    async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: "Invalid product ID" });
            }

            const updated = await MobileProduct.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
            );

            if (!updated) {
                return res.status(404).json({ message: "Product not found" });
            }

            await clearMobileCache();

            res.status(200).json({
                success: true,
                message: "Product updated",
                data: updated,
            });
        } catch (err) {
            res.status(500).json({ message: "Update failed" });
        }
    }
);

/**
 * DELETE MOBILE (ADMIN ONLY)
 */
router.delete(
    "/mobile/:id",
    authenticateToken,
    isAdmin,
    async (req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(400).json({ message: "Invalid product ID" });
            }

            const deleted = await MobileProduct.findByIdAndDelete(req.params.id);

            if (!deleted) {
                return res.status(404).json({ message: "Product not found" });
            }

            await clearMobileCache();

            res.status(200).json({
                success: true,
                message: "Product deleted successfully",
            });
        } catch (err) {
            res.status(500).json({ message: "Delete failed" });
        }
    }
);

module.exports = router;
