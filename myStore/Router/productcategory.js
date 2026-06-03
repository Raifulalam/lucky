const express = require('express');
const router = express.Router();
const ProductsCategory = require('../Models/ProductsCategoryModel');
const redisClient = require("../config/redis");

const DEFAULT_EXPIRY = 3600; // 1 hour cache since category relationships are mostly static

const getCache = async (key) => {
    try {
        if (redisClient && typeof redisClient.get === "function") {
            const data = await redisClient.get(key);
            return data ? JSON.parse(data) : null;
        }
        return null;
    } catch (err) {
        console.error("Redis getCache error:", err);
        return null;
    }
};

const setCache = async (key, value, expiry = DEFAULT_EXPIRY) => {
    try {
        if (redisClient && typeof redisClient.setEx === "function") {
            await redisClient.setEx(key, expiry, JSON.stringify(value));
        }
    } catch (err) {
        console.error("Redis setCache error:", err);
    }
};

const setPublicCacheHeaders = (res, maxAgeSeconds = 3600) => {
    res.set("Cache-Control", `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 2}`);
    return res;
};

// Fetch categories with associated products (with Redis caching, lean queries, and robust async fallback)
router.get('/productCategories', async (req, res) => {
    const cacheKey = "categories:all";

    try {
        // Try resolving from cache first
        const cached = await getCache(cacheKey);
        if (cached) {
            return setPublicCacheHeaders(res, 3600).json(cached);
        }

        // Fallback to database with lean optimization
        const categories = await ProductsCategory.find()
            .select("name description products createdAt")
            .sort({ name: 1 })
            .populate({
                path: 'products',
                select: "name slug brand category price mrp stock image createdAt",
                options: { sort: { createdAt: -1 } }
            })
            .lean();

        // Write-through cache
        await setCache(cacheKey, categories);

        setPublicCacheHeaders(res, 3600).json(categories);
    } catch (err) {
        console.error('Error fetching categories:', err);
        
        // Resilient fallback: bypass Redis in case of connection failure
        try {
            const categories = await ProductsCategory.find().populate('products').lean();
            return setPublicCacheHeaders(res, 3600).json(categories);
        } catch (dbErr) {
            res.status(500).json({ message: 'Error fetching categories', error: dbErr.message });
        }
    }
});

module.exports = router;
