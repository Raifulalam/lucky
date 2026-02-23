require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Base API router
const apiRoutes = require("./Router/index"); // Create a central routes file

// Models for indexes
const Product = require("./Models/products");

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------- MIDDLEWARE --------------------
app.use(cors());                       // Enable CORS
app.use(helmet());                      // Security headers
app.use(morgan("combined"));            // Logging
app.use(express.json({ limit: "10mb" })); // Parse JSON
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -------------------- ROUTES --------------------
app.get("/", (req, res) => {
    res.send("✅ API is running");
});

app.use("/api", apiRoutes); // Mount all API routes under /api

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Global Error:", err.stack);
    res.status(500).json({ message: "Something went wrong!" });
});

// -------------------- DATABASE CONNECTION --------------------
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log("✅ MongoDB connected");

        // Ensure indexes for product search
        Product.collection.createIndex({ category: 1 });
        Product.collection.createIndex({ brand: 1 });
        Product.collection.createIndex({ model: 1 });
        Product.collection.createIndex({ createdAt: -1 });
        Product.collection.createIndex({ name: "text", description: "text", keywords: "text" });
        console.log("Indexes created/ensured successfully ✅");

        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error("❌ Error connecting to MongoDB:", err);
        process.exit(1); // Exit process if DB connection fails
    });

const redisClient = require("./config/redis"); // adjust path

async function testRedis() {
    await redisClient.set("hello", "world");
    const data = await redisClient.get("hello");
    console.log(data);
}

testRedis();