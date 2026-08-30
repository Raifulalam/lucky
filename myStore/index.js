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

// Models for indexes
const Product = require("./Models/products");
const Mobile = require("./Models/SmartPhonesModels");

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------- CORS ORIGINS --------------------

const allowedOrigins = (
    process.env.CORS_ORIGIN ||
    process.env.CLIENT_ORIGIN ||
    ""
)
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

// -------------------- HTTP SERVER --------------------

const server = http.createServer(app);

// -------------------- SOCKET.IO --------------------

const io = new Server(server, {
    cors: {
        origin: allowedOrigins.length ? allowedOrigins : true,
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
        origin: allowedOrigins.length ? allowedOrigins : true,
        credentials: true,
    })
);

app.use(helmet());
app.use(compression());
app.use(mongoSanitize());
app.use(morgan("combined"));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

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


app.use("/api", apiRoutes);
app.use("/api/hrms", hrmsRoutes);

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

// -------------------- DATABASE CONNECTION --------------------

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB connected");

        // Ensure indexes for product search
       

        // IMPORTANT:
        // Use server.listen(), NOT app.listen()
        server.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`🔌 Socket.IO is ready`);
        });
    })
    .catch((err) => {
        console.error("❌ Error connecting to MongoDB:", err);
        process.exit(1);
    });
