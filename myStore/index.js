require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

// Base API router
const apiRoutes = require("./Router/index"); // Create a central routes file
const hrmsRoutes = require("./hrms/routes");


// Models for indexes
const Product = require("./Models/products");
const Mobile = require("./Models/SmartPhonesModels");

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.CORS_ORIGIN || process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

// -------------------- MIDDLEWARE --------------------
app.set("trust proxy", 1);
app.use(cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
}));                       // Enable CORS
app.use(helmet());                      // Security headers
app.use(compression());                 // Enable Gzip/Deflate compression
app.use(mongoSanitize());               // Prevent NoSQL injections
app.use(morgan("combined"));            // Logging
app.use(express.json({ limit: "10mb" })); // Parse JSON
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Global Rate Limiter
const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 300 requests per window
    message: { success: false, message: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use("/api", globalRateLimiter);

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads"), {
    maxAge: "30d",
    immutable: true,
}));

// -------------------- ROUTES --------------------
app.get("/", (req, res) => {
    res.send("✅ API is running");
});

app.use("/api", apiRoutes); // Mount all API routes under /api
app.use("/api/hrms", hrmsRoutes);


// 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Route not found" });
});

// Centralized error handler
app.use((err, req, res, next) => {
    console.error("Centralized Error Handler:", err);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" ? { stack: err.stack } : {})
    });
});

// -------------------- DATABASE CONNECTION --------------------
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("✅ MongoDB connected");

        // Ensure indexes for product search
        Promise.all([
            Product.createIndexes(),
            Mobile.createIndexes()
        ]).then(() => {
            console.log("Indexes created/ensured successfully ✅");
        }).catch(err => {
            console.error("Failed to build indexes:", err);
        });

        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("❌ Error connecting to MongoDB:", err);
        process.exit(1); // Exit process if DB connection fails
    });

