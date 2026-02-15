const express = require("express");
const router = express.Router();

// User Routes
const userRoutes = require("./createUser");                 // Handles user auth and profile
const productRoutes = require("./createProducts");   // Products CRUD
const mobileRoutes = require("./MobileRouter");      // Mobile products
const orderRoutes = require("./createOrder");        // Orders
const complaintRoutes = require("./complaints");     // Complaints
const contactRoutes = require("./contactMessage");   // Contact messages
const categoryRoutes = require("./productcategory"); // Product categories
const employeeRoutes = require("./EmployeeRoutes");  // Employee related routes
const dashboardRoutes = require("./Dashboard");      // Dashboard stats

// -------------------- ROUTES --------------------
// User routes
router.use("/users", userRoutes);

// Product routes
router.use("/products", productRoutes);

// Mobile product routes
router.use("/mobiles", mobileRoutes);

// Order routes
router.use("/orders", orderRoutes);

// Complaint routes
router.use("/complaints", complaintRoutes);

// Contact messages
router.use("/contact", contactRoutes);

// Product categories
router.use("/categories", categoryRoutes);

// Employee routes
router.use("/employees", employeeRoutes);

// Dashboard routes
router.use("/dashboard", dashboardRoutes);

module.exports = router;
