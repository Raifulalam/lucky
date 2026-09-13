
const express = require("express");
const mongoose = require("mongoose");

const MobileProduct = require("../Models/SmartPhonesModels");
const authenticateToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const redisClient = require("../config/redis");

const router = express.Router();

// ==========================================
// CONFIGURATION
// ==========================================

const CACHE_EXPIRY = 600;

// ==========================================
// SLUG GENERATOR
// ==========================================

const toSlug = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ==========================================
// REDIS CACHE HELPERS
// ==========================================

const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Redis getCache error:", err);
    return null;
  }
};

const setCache = async (
  key,
  value,
  expiry = CACHE_EXPIRY
) => {
  try {
    await redisClient.setEx(
      key,
      expiry,
      JSON.stringify(value)
    );
  } catch (err) {
    console.error("Redis setCache error:", err);
  }
};

// ==========================================
// PUBLIC CACHE HEADERS
// ==========================================

const setPublicCacheHeaders = (
  res,
  maxAgeSeconds = 300
) => {
  res.set(
    "Cache-Control",
    `public, max-age=${maxAgeSeconds}, stale-while-revalidate=${maxAgeSeconds * 2}`
  );

  return res;
};

// ==========================================
// CLEAR MOBILE CACHE
// ==========================================

const clearMobileCache = async () => {
  try {
    let cursor = 0;

    do {
      const reply = await redisClient.scan(cursor, {
        MATCH: "mobile:*",
        COUNT: 100,
      });

      cursor = Number(reply.cursor);

      const keys = reply.keys || [];

      if (keys.length > 0) {
        await redisClient.del(keys);
      }
    } while (cursor !== 0);
  } catch (err) {
    console.error("clearMobileCache error:", err);
  }
};

// ==========================================
// RESPONSE HELPERS
// ==========================================

const successResponse = (
  res,
  statusCode,
  message,
  data = null
) => {
  const response = {
    success: true,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const errorResponse = (
  res,
  statusCode,
  message,
  error = null
) => {
  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV !== "production" && error) {
    response.error = error.message || error;
  }

  return res.status(statusCode).json(response);
};

// ==========================================
// VALIDATION HELPERS
// ==========================================

const isValidObjectId = (id) =>
  mongoose.Types.ObjectId.isValid(id);

const parseBoolean = (value) => {
  if (value === true || value === "true") {
    return true;
  }

  if (value === false || value === "false") {
    return false;
  }

  return undefined;
};

const parseNumber = (value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

// ==========================================
// PRODUCT PAYLOAD
// ==========================================

const buildProductPayload = (body) => {
  const payload = {
    ...body,
  };

  // Generate slug automatically
  if (!payload.slug && payload.name) {
    payload.slug = toSlug(
      `${payload.name}-${payload.model || ""}`
    );
  }

  // Convert boolean fields when received as strings
  const booleanFields = [
    "addToSale",
    "isFeatured",
    "isActive",
    "isDeleted",
    "dualSim",
    "fiveG",
    "nfc",
    "wirelessCharging",
    "fastCharging",
    "chargerIncluded",
    "expandableStorage",
    "faceUnlock",
    "stereoSpeakers",
    "headphoneJack",
  ];

  booleanFields.forEach((field) => {
    if (payload[field] !== undefined) {
      const parsed = parseBoolean(payload[field]);

      if (parsed !== undefined) {
        payload[field] = parsed;
      }
    }
  });

  return payload;
};

// ==========================================
// PUBLIC PRODUCT FILTERS
// ==========================================

const buildPublicQuery = (queryParams) => {
  const {
    brand,
    category,
    search,
    minPrice,
    maxPrice,
    price,
    isFeatured,
    addToSale,
    availability,
  } = queryParams;

  const query = {
    isActive: true,
    isDeleted: false,
  };

  if (brand) {
    query.brand = brand;
  }

  if (category) {
    query.category = category;
  }

  if (availability) {
    query.availability = availability;
  }

  const priceFilter = {};

  if (minPrice !== undefined) {
    const min = parseNumber(minPrice);

    if (min !== null && min !== undefined && min >= 0) {
      priceFilter.$gte = min;
    }
  }

  if (maxPrice !== undefined) {
    const max = parseNumber(maxPrice);

    if (max !== null && max !== undefined && max >= 0) {
      priceFilter.$lte = max;
    }
  }

  // Backward-compatible maximum price filter
  if (
    price !== undefined &&
    minPrice === undefined &&
    maxPrice === undefined
  ) {
    const max = parseNumber(price);

    if (max !== null && max !== undefined && max >= 0) {
      priceFilter.$lte = max;
    }
  }

  if (Object.keys(priceFilter).length > 0) {
    query.price = priceFilter;
  }

  if (search) {
    const safeSearch = String(search)
      .trim()
      .slice(0, 100)
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    if (safeSearch) {
      query.$or = [
        { name: { $regex: safeSearch, $options: "i" } },
        { brand: { $regex: safeSearch, $options: "i" } },
        { model: { $regex: safeSearch, $options: "i" } },
        {
          description: {
            $regex: safeSearch,
            $options: "i",
          },
        },
      ];
    }
  }

  if (isFeatured !== undefined) {
    const parsed = parseBoolean(isFeatured);

    if (parsed !== undefined) {
      query.isFeatured = parsed;
    }
  }

  if (addToSale !== undefined) {
    const parsed = parseBoolean(addToSale);

    if (parsed !== undefined) {
      query.addToSale = parsed;
    }
  }

  return query;
};

// ==========================================
// PUBLIC ROUTES
// ==========================================

/**
 * GET ALL PUBLIC MOBILES
 *
 * GET /api/mobiles
 *
 * Query:
 * page, limit, brand, category, search,
 * minPrice, maxPrice, price,
 * isFeatured, addToSale, availability
 */
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sort = "newest",
    } = req.query;

    const pageNum = Math.max(
      1,
      Number(page) || 1
    );

    const limitNum = Math.max(
      1,
      Math.min(100, Number(limit) || 12)
    );

    const query = buildPublicQuery(req.query);

    // Allowed sorting options
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      priceLow: { price: 1 },
      priceHigh: { price: -1 },
      nameAZ: { name: 1 },
      featured: {
        featuredOrder: 1,
        createdAt: -1,
      },
    };

    const sortQuery =
      sortOptions[sort] || sortOptions.newest;

    const cacheKey = `mobile:public:${JSON.stringify({
      query,
      page: pageNum,
      limit: limitNum,
      sort,
    })}`;

    const cached = await getCache(cacheKey);

    if (cached) {
      return setPublicCacheHeaders(res, 180)
        .status(200)
        .json(cached);
    }

    const [products, total] = await Promise.all([
      MobileProduct.find(query)
        .select("-isDeleted")
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .sort(sortQuery)
        .lean(),

      MobileProduct.countDocuments(query),
    ]);

    const response = {
      success: true,
      message: "Mobile products fetched successfully",
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      data: products,
    };

    await setCache(cacheKey, response);

    return setPublicCacheHeaders(res, 180)
      .status(200)
      .json(response);
  } catch (error) {
    console.error("Public mobiles error:", error);

    return errorResponse(
      res,
      500,
      "Failed to fetch mobile products",
      error
    );
  }
});

/**
 * GET FEATURED MOBILES
 *
 * GET /api/mobiles/featured
 */
router.get("/featured", async (req, res) => {
  try {
    const limitNum = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 12)
    );

    const cacheKey = `mobile:featured:${limitNum}`;

    const cached = await getCache(cacheKey);

    if (cached) {
      return setPublicCacheHeaders(res, 180)
        .status(200)
        .json(cached);
    }

    const products = await MobileProduct.find({
      isFeatured: true,
      isActive: true,
      isDeleted: false,
    })
      .sort({
        featuredOrder: 1,
        createdAt: -1,
      })
      .limit(limitNum)
      .lean();

    const response = {
      success: true,
      message: "Featured products fetched successfully",
      count: products.length,
      data: products,
    };

    await setCache(cacheKey, response);

    return setPublicCacheHeaders(res, 180)
      .status(200)
      .json(response);
  } catch (error) {
    console.error("Featured mobiles error:", error);

    return errorResponse(
      res,
      500,
      "Failed to fetch featured products",
      error
    );
  }
});

/**
 * GET CLEARANCE SALE MOBILES
 *
 * GET /api/mobiles/sale
 */
router.get("/sale", async (req, res) => {
  try {
    const limitNum = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 12)
    );

    const cacheKey = `mobile:sale:${limitNum}`;

    const cached = await getCache(cacheKey);

    if (cached) {
      return setPublicCacheHeaders(res, 180)
        .status(200)
        .json(cached);
    }

    const products = await MobileProduct.find({
      addToSale: true,
      isActive: true,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .lean();

    const response = {
      success: true,
      message: "Clearance products fetched successfully",
      count: products.length,
      data: products,
    };

    await setCache(cacheKey, response);

    return setPublicCacheHeaders(res, 180)
      .status(200)
      .json(response);
  } catch (error) {
    console.error("Sale mobiles error:", error);

    return errorResponse(
      res,
      500,
      "Failed to fetch sale products",
      error
    );
  }
});

/**
 * GET SINGLE PUBLIC MOBILE
 *
 * GET /api/mobiles/:identifier
 *
 * Supports MongoDB ID or slug
 */
router.get("/:identifier", async (req, res) => {
  try {
    const { identifier } = req.params;

    const query = isValidObjectId(identifier)
      ? {
          _id: identifier,
          isActive: true,
          isDeleted: false,
        }
      : {
          slug: identifier,
          isActive: true,
          isDeleted: false,
        };

    const cacheKey = `mobile:single:${identifier}`;

    const cached = await getCache(cacheKey);

    if (cached) {
      return setPublicCacheHeaders(res, 300)
        .status(200)
        .json(cached);
    }

    const product = await MobileProduct.findOne(query)
      .select("-isDeleted")
      .lean();

    if (!product) {
      return errorResponse(
        res,
        404,
        "Mobile product not found"
      );
    }

    const response = {
      success: true,
      message: "Mobile product fetched successfully",
      data: product,
    };

    await setCache(cacheKey, response);

    return setPublicCacheHeaders(res, 300)
      .status(200)
      .json(response);
  } catch (error) {
    console.error("Single mobile error:", error);

    return errorResponse(
      res,
      500,
      "Failed to fetch mobile product",
      error
    );
  }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

/**
 * GET ALL MOBILES FOR ADMIN
 *
 * GET /api/mobiles/admin/all
 *
 * Includes inactive and deleted products.
 */
router.get(
  "/admin/all",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        brand,
        category,
        isFeatured,
        addToSale,
        isActive,
        isDeleted,
      } = req.query;

      const pageNum = Math.max(
        1,
        Number(page) || 1
      );

      const limitNum = Math.max(
        1,
        Math.min(100, Number(limit) || 20)
      );

      const query = {};

      if (search) {
        const safeSearch = String(search)
          .trim()
          .slice(0, 100)
          .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        query.$or = [
          { name: { $regex: safeSearch, $options: "i" } },
          { brand: { $regex: safeSearch, $options: "i" } },
          { model: { $regex: safeSearch, $options: "i" } },
          { sku: { $regex: safeSearch, $options: "i" } },
        ];
      }

      if (brand) query.brand = brand;
      if (category) query.category = category;

      const featured = parseBoolean(isFeatured);
      const sale = parseBoolean(addToSale);
      const active = parseBoolean(isActive);
      const deleted = parseBoolean(isDeleted);

      if (featured !== undefined) {
        query.isFeatured = featured;
      }

      if (sale !== undefined) {
        query.addToSale = sale;
      }

      if (active !== undefined) {
        query.isActive = active;
      }

      if (deleted !== undefined) {
        query.isDeleted = deleted;
      }

      const [products, total] = await Promise.all([
        MobileProduct.find(query)
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum)
          .sort({ createdAt: -1 })
          .lean(),

        MobileProduct.countDocuments(query),
      ]);

      return res.status(200).json({
        success: true,
        message: "Admin mobile products fetched",
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
        data: products,
      });
    } catch (error) {
      console.error("Admin mobiles error:", error);

      return errorResponse(
        res,
        500,
        "Failed to fetch admin products",
        error
      );
    }
  }
);

/**
 * GET SINGLE MOBILE FOR ADMIN
 *
 * GET /api/mobiles/admin/:id
 */
router.get(
  "/admin/:id",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return errorResponse(
          res,
          400,
          "Invalid product ID"
        );
      }

      const product = await MobileProduct.findById(id)
        .lean();

      if (!product) {
        return errorResponse(
          res,
          404,
          "Mobile product not found"
        );
      }

      return successResponse(
        res,
        200,
        "Admin product fetched successfully",
        product
      );
    } catch (error) {
      console.error("Admin single mobile error:", error);

      return errorResponse(
        res,
        500,
        "Failed to fetch admin product",
        error
      );
    }
  }
);

/**
 * CREATE MOBILE
 *
 * POST /api/mobiles
 */
router.post(
  "/",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const {
        name,
        price,
        brand,
        model,
      } = req.body;

      if (
        !name ||
        price === undefined ||
        price === null ||
        !brand ||
        !model
      ) {
        return errorResponse(
          res,
          400,
          "name, price, brand, and model are required"
        );
      }

      const numericPrice = Number(price);

      if (
        !Number.isFinite(numericPrice) ||
        numericPrice < 0
      ) {
        return errorResponse(
          res,
          400,
          "Price must be a valid non-negative number"
        );
      }

      const payload = buildProductPayload(req.body);

      const product = await MobileProduct.create(payload);

      await clearMobileCache();

      return successResponse(
        res,
        201,
        "Mobile product created successfully",
        product
      );
    } catch (error) {
      console.error("Create mobile error:", error);

      if (error.code === 11000) {
        return errorResponse(
          res,
          409,
          "A product with this slug or SKU already exists"
        );
      }

      return errorResponse(
        res,
        500,
        "Failed to create mobile product",
        error
      );
    }
  }
);

/**
 * UPDATE MOBILE
 *
 * PUT /api/mobiles/:id
 */
router.put(
  "/:id",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return errorResponse(
          res,
          400,
          "Invalid product ID"
        );
      }

      const existing = await MobileProduct.findById(id);

      if (!existing) {
        return errorResponse(
          res,
          404,
          "Mobile product not found"
        );
      }

      const payload = buildProductPayload(req.body);

      // Keep existing slug if name/model are not updated
      if (!payload.slug) {
        payload.slug = existing.slug;
      }

      const updated = await MobileProduct.findByIdAndUpdate(
        id,
        { $set: payload },
        {
          new: true,
          runValidators: true,
        }
      );

      await clearMobileCache();

      return successResponse(
        res,
        200,
        "Mobile product updated successfully",
        updated
      );
    } catch (error) {
      console.error("Update mobile error:", error);

      if (error.code === 11000) {
        return errorResponse(
          res,
          409,
          "A product with this slug or SKU already exists"
        );
      }

      return errorResponse(
        res,
        500,
        "Failed to update mobile product",
        error
      );
    }
  }
);

/**
 * TOGGLE FEATURED STATUS
 *
 * PATCH /api/mobiles/:id/featured
 *
 * Body:
 * { "isFeatured": true }
 */
router.patch(
  "/:id/featured",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return errorResponse(
          res,
          400,
          "Invalid product ID"
        );
      }

      const isFeatured = parseBoolean(
        req.body.isFeatured
      );

      if (isFeatured === undefined) {
        return errorResponse(
          res,
          400,
          "isFeatured must be true or false"
        );
      }

      const updated = await MobileProduct.findByIdAndUpdate(
        id,
        {
          $set: {
            isFeatured,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updated) {
        return errorResponse(
          res,
          404,
          "Mobile product not found"
        );
      }

      await clearMobileCache();

      return successResponse(
        res,
        200,
        isFeatured
          ? "Product added to featured products"
          : "Product removed from featured products",
        updated
      );
    } catch (error) {
      console.error("Featured toggle error:", error);

      return errorResponse(
        res,
        500,
        "Failed to update featured status",
        error
      );
    }
  }
);

/**
 * TOGGLE CLEARANCE SALE STATUS
 *
 * PATCH /api/mobiles/:id/sale
 *
 * Body:
 * { "addToSale": true }
 */
router.patch(
  "/:id/sale",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return errorResponse(
          res,
          400,
          "Invalid product ID"
        );
      }

      const addToSale = parseBoolean(
        req.body.addToSale
      );

      if (addToSale === undefined) {
        return errorResponse(
          res,
          400,
          "addToSale must be true or false"
        );
      }

      const updated = await MobileProduct.findByIdAndUpdate(
        id,
        {
          $set: {
            addToSale,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!updated) {
        return errorResponse(
          res,
          404,
          "Mobile product not found"
        );
      }

      await clearMobileCache();

      return successResponse(
        res,
        200,
        addToSale
          ? "Product added to clearance sale"
          : "Product removed from clearance sale",
        updated
      );
    } catch (error) {
      console.error("Sale toggle error:", error);

      return errorResponse(
        res,
        500,
        "Failed to update sale status",
        error
      );
    }
  }
);

/**
 * SOFT DELETE MOBILE
 *
 * DELETE /api/mobiles/:id
 */
router.delete(
  "/:id",
  authenticateToken,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!isValidObjectId(id)) {
        return errorResponse(
          res,
          400,
          "Invalid product ID"
        );
      }

      const deleted = await MobileProduct.findByIdAndUpdate(
        id,
        {
          $set: {
            isDeleted: true,
            isActive: false,
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!deleted) {
        return errorResponse(
          res,
          404,
          "Mobile product not found"
        );
      }

      await clearMobileCache();

      return successResponse(
        res,
        200,
        "Mobile product moved to trash successfully"
      );
    } catch (error) {
      console.error("Delete mobile error:", error);

      return errorResponse(
        res,
        500,
        "Failed to delete mobile product",
        error
      );
    }
  }
);

// ==========================================
// EXPORT
// ==========================================

module.exports = router;