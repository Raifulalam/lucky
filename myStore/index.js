require("dotenv").config();

const http = require("http");
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

// Base API router
const apiRoutes = require("./Router/index");
const hrmsRoutes = require("./hrms/routes");

// Health check router (liveness + readiness)
const healthRouter = require("./Router/health");
const { livenessHandler } = require("./Router/health");

// Dynamic sitemap (includes all products from MongoDB)
const sitemapRouter = require("./Router/sitemap");


// Models for indexes
const Product = require("./Models/products");
const Mobile = require("./Models/SmartPhonesModels");

const whatsaapRoutes = require("./Router/whatsaap");
const { initBaileysClient } = require("./utils/baileysClient");
const { handleIncomingMessage } = require("./utils/whatsappBotAgent");

const app = express();
const PORT = process.env.PORT || 3000;

// Never fall back to a guessable JWT secret outside local development.
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== "development") {
    console.error("❌ JWT_SECRET is not set. Refusing to start with a guessable signing key.");
    process.exit(1);
}

// -------------------- CORS ORIGINS --------------------

const allowedOrigins = (
    process.env.CORS_ORIGIN ||
    process.env.CLIENT_ORIGIN ||
    ""
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

// If CORS_ORIGIN is not configured, fall back to the production site (plus local dev)
// rather than reflecting any origin together with credentials.
if (!allowedOrigins.length) {
    allowedOrigins.push(
        "https://luckyimpex4u.com",
        "https://www.luckyimpex4u.com",
        "http://localhost:3000"
    );
    console.warn("ℹ️  CORS_ORIGIN not set; using default allowlist:", allowedOrigins.join(", "));
}

// -------------------- HTTP SERVER --------------------

const server = http.createServer(app);

// -------------------- SOCKET.IO --------------------

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});

const parseCookieHeader = (cookieHeader = "") =>
    cookieHeader.split(";").reduce((acc, part) => {
        const [rawKey, ...rawValue] = part.trim().split("=");
        if (!rawKey) {
            return acc;
        }

        const key = rawKey.trim();
        const value = rawValue.join("=").trim();
        if (key) {
            acc[key] = decodeURIComponent(value || "");
        }

        return acc;
    }, {});

// Make Socket.IO available inside routes using req.app.get("io")
app.set("io", io);

io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    const cookies = parseCookieHeader(socket.handshake?.headers?.cookie || "");
    const token = socket.handshake?.auth?.token || cookies.authToken;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || "change-me-in-env");

            if (decoded?.id) {
                socket.data.user = {
                    id: decoded.id,
                    role: decoded.role || "user",
                    name: decoded.name || "",
                    email: decoded.email || "",
                };

                if (decoded.role === "admin") {
                    socket.join("admins");
                } else {
                    socket.join(`user:${decoded.id}`);
                }
            }
        } catch (error) {
            console.warn("Socket auth failed:", error.message);
        }
    }

    socket.on("disconnect", () => {
        console.log("🔌 User disconnected:", socket.id);
    });
});

// -------------------- MIDDLEWARE --------------------

app.set("trust proxy", 1);

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true,
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(helmet());
app.use(compression());
app.use(mongoSanitize());
app.use(morgan("combined"));

// -------------------- GLOBAL RATE LIMITER --------------------

const globalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: {
        success: false,
        message: "Too many requests, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use("/api", globalRateLimiter);

// WhatsApp admin endpoints (each route enforces auth + admin role)
app.use("/api/whatsapp", whatsaapRoutes);

// ── Dynamic sitemap — MUST come before express.static so Express handles it ──
// Serves /sitemap.xml with all products fetched live from MongoDB.
app.use("/", sitemapRouter);

// -------------------- STATIC FILES --------------------

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"), {
        maxAge: "30d",
        immutable: true,
    })
);


// -------------------- ROUTES --------------------

app.get("/", (req, res) => {
    res.send("✅ API is running");
});

// Liveness probe — pre-built JSON body, zero allocations, sub-millisecond.
// Safe to call even when DB is down; purely checks the process is alive.
app.get("/healthz", livenessHandler);
app.get("/health", livenessHandler); // convenience alias


app.use("/api", apiRoutes);
app.use("/api/hrms", hrmsRoutes);

// Full readiness probe — DB ping, memory, system stats (GET /api/health)
app.use("/api/health", healthRouter);


// -------------------- 404 HANDLER --------------------

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});

// -------------------- ERROR HANDLER --------------------

app.use((err, req, res, next) => {
    console.error("Centralized Error Handler:", err);

    const statusCode = err.status || err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development"
            ? { stack: err.stack }
            : {}),
    });
});

const { syncAllProductsToInventory } = require("./utils/inventoryService");

// -------------------- DATABASE CONNECTION + STARTUP --------------------

// Start accepting traffic immediately. Previously the server only listened AFTER MongoDB
// connected and exited on failure, so a slow/failed connection meant no CORS headers and
// the storefront saw a bare "failed to fetch". Now routes answer (503/500 JSON) while the
// database connects, and the connection is retried instead of crashing the process.
mongoose.set("bufferTimeoutMS", 8000);

let whatsappStarted = false;

server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`🔌 Socket.IO is ready`);

    if (!whatsappStarted) {
        whatsappStarted = true;
        // ── WhatsApp Baileys Agent ── scan the QR in Admin Dashboard → /admin/whatsapp
        initBaileysClient(io, handleIncomingMessage)
            .catch((err) => console.error("❌ Baileys init error:", err.message));
    }
});

const connectMongo = async (attempt = 1) => {
    try {
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
        console.log("✅ MongoDB connected");

        // Ensure all products are synced into Inventory (non-blocking)
        syncAllProductsToInventory()
            .then((res) => console.log(`📦 [Inventory System] Synced ${res.total} products with inventory.`))
            .catch((err) => console.error("❌ [Inventory System] Initial sync error:", err.message));
    } catch (err) {
        const delay = Math.min(attempt * 3000, 30000);
        console.error(`❌ MongoDB connection failed (attempt ${attempt}): ${err.message}. Retrying in ${delay / 1000}s`);
        setTimeout(() => connectMongo(attempt + 1), delay);
    }
};

connectMongo();
