const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { body, param, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const Product = require("../Models/products");
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const redisClient = require("../config/redis");
const uploadProductImage = require("../middlewares/uploadProductImage");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");

const toSlug = (value) =>
    String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
/* -------------------- COMMON VALIDATOR -------------------- */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
const DEFAULT_EXPIRY = 600; // 10 minutes cache by default

const getCache = async (key) => {
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (err) {
        console.error("Redis getCache error:", err);
        return null;
    }
};

const setCache = async (key, value, expiry = DEFAULT_EXPIRY) => {
    try {
        await redisClient.setEx(key, expiry, JSON.stringify(value));
    } catch (err) {
        console.error("Redis setCache error:", err);
    }
};

/* -------------------- RATE LIMIT (SEARCH) -------------------- */
const searchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
});

const scanAndDelete = async (pattern) => {
    try {
        let cursor = 0;
        do {
            const reply = await redisClient.scan(cursor, { MATCH: pattern, COUNT: 100 });
            cursor = Number(reply.cursor);
            const keys = reply.keys;
            if (keys && keys.length > 0) {
                await redisClient.del(keys);
            }
        } while (cursor !== 0);
    } catch (err) {
        console.error(`Redis SCAN & Delete failed for pattern ${pattern}:`, err);
    }
};

const clearProductCache = async () => {
    try {
        await scanAndDelete("products:*");
        await scanAndDelete("brand:*");
        await scanAndDelete("product:*");
        if (redisClient && typeof redisClient.del === "function") {
            await redisClient.del("categories:all");
        }
    } catch (err) {
        console.error("clearProductCache error:", err);
    }
};

const setPublicCacheHeaders = (res, maxAgeSeconds = 300) => {
    res.set("Cache-Control", `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 2}`);
    return res;
};

const deleteCloudinaryImage = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary cleanup failed:", error);
    }
};
/* ===========================================================
   CREATE PRODUCT (ADMIN)
   =========================================================== */
router.post(
    "/products",
    auth,
    isAdmin,
    uploadProductImage.single("image"),
    [
        body("name").notEmpty().trim(),
        body("price").isNumeric(),
        body("category").notEmpty().trim(),
        body("brand").notEmpty().trim(),
        body("model").notEmpty().trim(),
    ],
    validate,
    async (req, res) => {
        let uploadedImageResult = null;

        try {
            if (req.file) {
                uploadedImageResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: "products" },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result || null);
                        }
                    );

                    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
                });
            }

            const bodyImages = Array.isArray(req.body.images)
                ? req.body.images
                : typeof req.body.images === "string" && req.body.images
                    ? req.body.images.split(",").map((item) => item.trim()).filter(Boolean)
                    : [];

            const payload = {
                ...req.body,
                images: uploadedImageResult?.secure_url ? [uploadedImageResult.secure_url] : bodyImages,
                slug: req.body.slug || toSlug(`${req.body.name || ""}-${req.body.model || ""}`),
            };

            const product = await Product.create(payload);
            await clearProductCache();
            res.status(201).json(product);
        } catch (err) {
            await deleteCloudinaryImage(uploadedImageResult?.public_id);
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
        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
        const cacheKey = `products:${category || "all"}:${pageNum}:${limitNum}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            return setPublicCacheHeaders(res, 180).json(cached);
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
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum },
        ]).allowDiskUse(true);

        const totalResult = await Product.aggregate([
            { $match: match },
            { $group: { _id: "$model" } },
            { $count: "total" },
        ]);
        const total = totalResult[0]?.total || 0;

        const response = {
            products,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
        };

        await setCache(cacheKey, response, DEFAULT_EXPIRY);

        setPublicCacheHeaders(res, 180).json(response);
    } catch (err) {
        console.error("Error fetching products:", err);
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
        const pageNum = Math.max(1, Number(page) || 1);
        const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));
        const cacheKey = `brand:${brand}:${pageNum}:${limitNum}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            console.log("⚡ Brand products from Redis");
            return setPublicCacheHeaders(res, 180).json(cached);
        }

        const products = await Product.find({ brand })
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean();

        const total = await Product.countDocuments({ brand });

        const response = {
            products,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
        };

        await setCache(cacheKey, response);

        setPublicCacheHeaders(res, 180).json(response);
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
            const pageNum = Math.max(1, Number(page) || 1);
            const limitNum = Math.max(1, Math.min(100, Number(limit) || 20));

            const products = await Product.find(
                { $text: { $search: keyword } },
                { score: { $meta: "textScore" } }
            )
                .sort({ score: { $meta: "textScore" } })
                .skip((pageNum - 1) * limitNum)
                .limit(limitNum)
                .lean();

            const total = await Product.countDocuments({
                $text: { $search: keyword },
            });

            res.json({
                products,
                total,
                page: pageNum,
                pages: Math.ceil(total / limitNum),
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
    "/products/:identifier",
    [param("identifier").notEmpty().trim()],
    validate,
    async (req, res) => {
        const { identifier } = req.params;
        const cacheKey = `product:${identifier}`;

        const cached = await getCache(cacheKey);
        if (cached) {
            console.log("⚡ Single product from Redis");
            return setPublicCacheHeaders(res, 300).json(cached);
        }

        const query = mongoose.Types.ObjectId.isValid(identifier)
            ? { _id: identifier }
            : { slug: identifier };
        const product = await Product.findOne(query).lean();
        if (!product) return res.status(404).json({ message: "Product not found" });

        await setCache(cacheKey, product);

        setPublicCacheHeaders(res, 300).json(product);
    }
);


/* ===========================================================
   UPDATE PRODUCT (ADMIN)
   =========================================================== */
router.put("/products/:id", auth, isAdmin, uploadProductImage.single("image"), async (req, res) => {
    let uploadedImageResult = null;

    try {
        if (req.file) {
            uploadedImageResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "products" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result || null);
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            });
        }

        const bodyImages = Array.isArray(req.body.images)
            ? req.body.images
            : typeof req.body.images === "string" && req.body.images
                ? req.body.images.split(",").map((item) => item.trim()).filter(Boolean)
                : [];

        const allowedFields = (({
            name,
            price,
            category,
            brand,
            model,
            description,
            image,
            images,
            stock,
            slug,
        }) => ({
            name,
            price,
            category,
            brand,
            model,
            description,
            images: uploadedImageResult?.secure_url ? [uploadedImageResult.secure_url] : (images || (image ? [image] : bodyImages)),
            stock,
            slug,
        }))(req.body);

        if (!allowedFields.slug && (allowedFields.name || allowedFields.model)) {
            allowedFields.slug = toSlug(`${allowedFields.name || ""}-${allowedFields.model || ""}`);
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            allowedFields,
            { new: true }
        );
        if (!product) return res.status(404).json({ message: "Product not found" });
        await clearProductCache();

        res.json(product);
    } catch {
        await deleteCloudinaryImage(uploadedImageResult?.public_id);
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
