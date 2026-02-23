const express = require("express");
const router = express.Router();
const { body, param, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const Product = require("../Models/products");
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const redisClient = require("../config/redis");
/* -------------------- COMMON VALIDATOR -------------------- */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
const DEFAULT_EXPIRY = 600; // 10 minutes

const getCache = async (key) => {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
};

const setCache = async (key, value, expiry = DEFAULT_EXPIRY) => {
    await redisClient.setEx(key, expiry, JSON.stringify(value));
};


/* -------------------- RATE LIMIT (SEARCH) -------------------- */
const searchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});

const clearProductCache = async () => {
    const keys = await redisClient.keys("products:*");
    const brandKeys = await redisClient.keys("brand:*");
    const singleKeys = await redisClient.keys("product:*");

    const allKeys = [...keys, ...brandKeys, ...singleKeys];

    if (allKeys.length > 0) {
        await redisClient.del(allKeys);
    }
};
/* ===========================================================
   CREATE PRODUCT (ADMIN)
   =========================================================== */
router.post(
    "/products",
    auth,
    isAdmin,
    [
        body("name").notEmpty().trim(),
        body("price").isNumeric(),
        body("category").notEmpty().trim(),
        body("brand").notEmpty().trim(),
        body("model").notEmpty().trim(),
    ],
    validate,
    async (req, res) => {
        try {
            const product = await Product.create(req.body);
            await clearProductCache();
            res.status(201).json(product);
        } catch (err) {
            res.status(500).json({ message: "Product creation failed" });
        }
    }
);

/* ===========================================================
   GET PRODUCTS (CATEGORY + PAGINATION + UNIQUE MODEL)
   =========================================================== */
router.get("/products", async (req, res) => {
    try {
        const { category, page = 1, limit = 20 } = req.query;
        const cacheKey = `products:${category || "all"}:${page}:${limit}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        const match = category ? { category } : {};

        const products = await Product.aggregate([
            { $match: match },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$model",
                    product: { $first: "$$ROOT" },
                },
            },
            { $replaceRoot: { newRoot: "$product" } },
            { $skip: (page - 1) * limit },
            { $limit: Number(limit) },
        ]);

        const total = await Product.distinct("model", match).then(r => r.length);

        const response = {
            products,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
        };

        await setCache(cacheKey, response);

        res.json(response);
    } catch {
        res.status(500).json({ message: "Failed to fetch products" });
    }
});

/* ===========================================================
   BRAND FILTER
   =========================================================== */
router.get("/products/brand/:brand", async (req, res) => {
    try {
        const { brand } = req.params;
        const { page = 1, limit = 20 } = req.query;
        const cacheKey = `brand:${brand}:${page}:${limit}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            console.log("⚡ Brand products from Redis");
            return res.json(cached);
        }

        const products = await Product.find({ brand })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .lean();

        const total = await Product.countDocuments({ brand });

        const response = {
            products,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
        };

        await setCache(cacheKey, response);

        res.json(response);
    } catch {
        res.status(500).json({ message: "Failed to fetch brand products" });
    }
});


/* ===========================================================
   SEARCH PRODUCTS (TEXT INDEX)
   =========================================================== */
router.get(
    "/products/search/:keyword",
    searchLimiter,
    async (req, res) => {
        try {
            const { keyword } = req.params;
            const { page = 1, limit = 20 } = req.query;

            const products = await Product.find(
                { $text: { $search: keyword } },
                { score: { $meta: "textScore" } }
            )
                .sort({ score: { $meta: "textScore" } })
                .skip((page - 1) * limit)
                .limit(Number(limit));

            const total = await Product.countDocuments({
                $text: { $search: keyword },
            });

            res.json({
                products,
                total,
                page: Number(page),
                pages: Math.ceil(total / limit),
            });
        } catch {
            res.status(500).json({ message: "Search failed" });
        }
    }
);

/* ===========================================================
   PRODUCT DETAILS
   =========================================================== */
router.get(
    "/products/:id",
    [param("id").isMongoId()],
    validate,
    async (req, res) => {
        const cacheKey = `product:${req.params.id}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            console.log("⚡ Single product from Redis");
            return res.json(cached);
        }

        const product = await Product.findById(req.params.id).lean();
        if (!product) return res.status(404).json({ message: "Product not found" });

        await setCache(cacheKey, product);

        res.json(product);
    }
);


/* ===========================================================
   UPDATE PRODUCT (ADMIN)
   =========================================================== */
router.put("/products/:id", auth, isAdmin, async (req, res) => {
    try {
        const allowedFields = (({
            name,
            price,
            category,
            brand,
            model,
            description,
            images,
            stock,
        }) => ({
            name,
            price,
            category,
            brand,
            model,
            description,
            images,
            stock,
        }))(req.body);

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            allowedFields,
            { new: true }
        );
        if (!product) return res.status(404).json({ message: "Product not found" });
        await clearProductCache();

        res.json(product);
    } catch {
        res.status(500).json({ message: "Update failed" });
    }
});

/* ===========================================================
   DELETE PRODUCT (ADMIN)
   =========================================================== */
router.delete("/products/:id", auth, isAdmin, async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) return res.status(404).json({ message: "Product not found" });
    await clearProductCache();

    res.json({ message: "Product deleted successfully" });
});

module.exports = router;
