const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");
const authenticateToken = require("../middlewares/auth");

// Apply canonical authentication to all inventory routes
router.use(authenticateToken);

// ==================== INVENTORY SUMMARY ====================
router.get("/summary", inventoryController.getInventorySummary);

// ==================== INVENTORY CRUD ====================
router.get("/products", inventoryController.getAllInventory);
router.get("/products/:productId", inventoryController.getInventoryByProduct);
router.put("/products/:productId/settings", inventoryController.updateInventorySettings);

// ==================== STOCK OPERATIONS ====================
router.post("/stock-in", inventoryController.stockIn);
router.post("/stock-out", inventoryController.stockOut);
router.post("/adjustment", inventoryController.stockAdjustment);

// ==================== STOCK TRANSFERS ====================
router.get("/transfers", inventoryController.getTransfers);
router.post("/transfers", inventoryController.createTransfer);
router.put("/transfers/:id/approve", inventoryController.approveTransfer);
router.put("/transfers/:id/dispatch", inventoryController.dispatchTransfer);
router.put("/transfers/:id/receive", inventoryController.receiveTransfer);

// ==================== SERIAL NUMBERS ====================
router.get("/serial-numbers", inventoryController.getSerialNumbers);
router.post("/serial-numbers", inventoryController.createSerialNumber);

// ==================== WAREHOUSES ====================
router.get("/warehouses", inventoryController.getWarehouses);
router.post("/warehouses", inventoryController.createWarehouse);
router.put("/warehouses/:id", inventoryController.updateWarehouse);

// ==================== ALERTS ====================
router.get("/low-stock", inventoryController.getLowStock);
router.get("/out-of-stock", inventoryController.getOutOfStock);

// ==================== MOVEMENTS ====================
router.get("/movements", inventoryController.getMovements);

// ==================== VALUATION ====================
router.get("/valuation", inventoryController.getValuation);

module.exports = router;
