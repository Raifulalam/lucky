const mongoose = require("mongoose");
const Inventory = require("../Models/Inventory");
const InventoryMovement = require("../Models/InventoryMovement");
const StockTransfer = require("../Models/StockTransfer");
const StockAdjustment = require("../Models/StockAdjustment");
const SerialNumber = require("../Models/SerialNumber");
const Warehouse = require("../Models/Warehouse");
const Product = require("../Models/products");
const {
    updateStock,
    reserveStock,
    releaseReservedStock,
    updateSerialNumberStatus,
    getInventorySummary,
    getLowStockProducts,
    getOutOfStockProducts,
    getInventoryValuation,
    generateTransferNumber,
    generateAdjustmentNumber
} = require("../utils/inventoryService");

// ==================== INVENTORY SUMMARY ====================
exports.getInventorySummary = async (req, res) => {
    try {
        const summary = await getInventorySummary();
        res.json({ success: true, data: summary });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== GET ALL INVENTORY ====================
exports.getAllInventory = async (req, res) => {
    try {
        const { page = 1, limit = 20, category, brand, status } = req.query;
        
        const query = {};
        if (category) query.category = category;
        if (brand) query.brand = brand;
        if (status) query.status = status;

        const inventory = await Inventory.find(query)
            .populate("productId")
            .populate("locations.locationId")
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Inventory.countDocuments(query);

        res.json({
            success: true,
            data: inventory,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== GET INVENTORY BY PRODUCT ====================
exports.getInventoryByProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const inventory = await Inventory.findOne({ productId })
            .populate("productId")
            .populate("locations.locationId");

        if (!inventory) {
            return res.status(404).json({ success: false, message: "Inventory not found" });
        }

        // Get recent movements
        const movements = await InventoryMovement.find({ productId })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("userId", "name email")
            .populate("locationId", "name code");

        // Get serial numbers if tracking enabled
        let serialNumbers = [];
        if (inventory.trackSerialNumber) {
            serialNumbers = await SerialNumber.find({ productId })
                .sort({ createdAt: -1 })
                .limit(20)
                .populate("currentLocationId", "name code");
        }

        res.json({
            success: true,
            data: {
                inventory,
                movements,
                serialNumbers
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== STOCK IN ====================
exports.stockIn = async (req, res) => {
    try {
        const {
            productId,
            warehouseId,
            locationId,
            quantity,
            purchasePrice,
            referenceType,
            referenceId,
            serialNumbers,
            notes
        } = req.body;

        const userId = req.user?.id;
        const targetWarehouseId = warehouseId || locationId;

        // Update stock
        const { inventory, movement } = await updateStock({
            productId,
            warehouseId: targetWarehouseId,
            locationId: targetWarehouseId,
            quantity,
            movementType: "PURCHASE",
            referenceType: referenceType || "MANUAL",
            referenceId,
            userId,
            reason: "Stock received",
            notes
        });

        // Update purchase price if provided
        if (purchasePrice) {
            inventory.purchasePrice = purchasePrice;
            await inventory.save();
        }

        // Add serial numbers if provided
        if (serialNumbers && serialNumbers.length > 0) {
            const serialDocs = serialNumbers.map(sn => ({
                serialNumber: sn,
                productId,
                purchaseReference: referenceId,
                purchaseDate: new Date(),
                currentLocationId: targetWarehouseId,
                warehouseId: targetWarehouseId,
                status: "IN_STOCK"
            }));

            await SerialNumber.insertMany(serialDocs);
        }

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.to("admins").emit("inventoryUpdated", { productId, movement });
        }

        res.json({ success: true, data: { inventory, movement } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== STOCK OUT ====================
exports.stockOut = async (req, res) => {
    try {
        const {
            productId,
            warehouseId,
            locationId,
            quantity,
            referenceType,
            referenceId,
            serialNumber,
            reason,
            notes
        } = req.body;

        const userId = req.user?.id;
        const targetWarehouseId = warehouseId || locationId;

        // Update stock
        const { inventory, movement } = await updateStock({
            productId,
            warehouseId: targetWarehouseId,
            locationId: targetWarehouseId,
            quantity,
            movementType: "SALE",
            referenceType: referenceType || "MANUAL",
            referenceId,
            userId,
            reason: reason || "Stock issued",
            notes
        });

        // Update serial number if provided
        if (serialNumber) {
            await updateSerialNumberStatus(serialNumber, "SOLD", {
                saleReference: referenceId,
                saleDate: new Date()
            });
        }

        // Emit socket event
        const io = req.app.get("io");
        if (io) {
            io.to("admins").emit("inventoryUpdated", { productId, movement });
        }

        res.json({ success: true, data: { inventory, movement } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== STOCK ADJUSTMENT ====================
exports.stockAdjustment = async (req, res) => {
    try {
        const {
            productId,
            warehouseId,
            locationId,
            adjustmentType,
            currentQuantity,
            adjustedQuantity,
            reason,
            notes
        } = req.body;

        const userId = req.user?.id;
        const targetWarehouseId = warehouseId || locationId;
        const difference = adjustedQuantity - currentQuantity;

        const adjustment = await StockAdjustment.create({
            adjustmentNumber: generateAdjustmentNumber(),
            productId,
            locationId: targetWarehouseId,
            warehouseId: targetWarehouseId,
            adjustmentType,
            currentQuantity,
            adjustedQuantity,
            difference,
            reason,
            notes,
            approvedBy: userId,
            status: "APPROVED"
        });

        // Update stock based on difference
        if (difference !== 0) {
            const movementType = difference > 0 ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT";
            const { inventory, movement } = await updateStock({
                productId,
                warehouseId: targetWarehouseId,
                locationId: targetWarehouseId,
                quantity: Math.abs(difference),
                movementType,
                referenceType: "ADJUSTMENT",
                referenceModel: "StockAdjustment",
                referenceId: adjustment._id,
                userId,
                reason: reason || "Stock adjustment",
                notes
            });

            // Emit socket event
            const io = req.app.get("io");
            if (io) {
                io.to("admins").emit("inventoryUpdated", { productId, movement });
            }

            res.json({ success: true, data: { adjustment, inventory, movement } });
        } else {
            res.json({ success: true, data: { adjustment } });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== STOCK TRANSFER ====================
exports.createTransfer = async (req, res) => {
    try {
        const {
            fromLocationId,
            toLocationId,
            items,
            notes
        } = req.body;

        const userId = req.user?.id;

        const transfer = await StockTransfer.create({
            transferNumber: generateTransferNumber(),
            fromLocationId,
            toLocationId,
            items,
            requestedBy: userId,
            status: "REQUESTED",
            requestedAt: new Date(),
            notes
        });

        res.json({ success: true, data: transfer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.approveTransfer = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const transfer = await StockTransfer.findById(id);
        if (!transfer) {
            return res.status(404).json({ success: false, message: "Transfer not found" });
        }

        if (transfer.status !== "REQUESTED") {
            return res.status(400).json({ success: false, message: "Transfer cannot be approved" });
        }

        transfer.status = "APPROVED";
        transfer.approvedBy = userId;
        transfer.approvedAt = new Date();
        await transfer.save();

        res.json({ success: true, data: transfer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.dispatchTransfer = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const { notes } = req.body || {};
        const userId = req.user?.id;

        const transfer = await StockTransfer.findById(id).session(session);
        if (!transfer) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Transfer not found" });
        }

        if (transfer.status !== "APPROVED") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Transfer must be approved first" });
        }

        // Decrease stock from source location
        for (const item of transfer.items) {
            await updateStock({
                productId: item.productId,
                warehouseId: transfer.fromLocationId,
                locationId: transfer.fromLocationId,
                quantity: item.quantity,
                movementType: "TRANSFER_OUT",
                referenceType: "TRANSFER",
                referenceModel: "StockTransfer",
                referenceId: transfer._id,
                userId,
                reason: "Stock transfer dispatched",
                notes: notes || transfer.notes,
                session
            });

            // Update serial numbers if provided
            if (item.serialNumbers && item.serialNumbers.length > 0) {
                for (const sn of item.serialNumbers) {
                    const serial = await SerialNumber.findOne({ serialNumber: sn }).session(session);
                    if (serial) {
                        serial.status = "TRANSFERRED";
                        serial.currentLocationId = null;
                        serial.warehouseId = null;
                        await serial.save({ session });
                    }
                }
            }
        }

        transfer.status = "IN_TRANSIT";
        transfer.dispatchedBy = userId;
        transfer.dispatchedAt = new Date();
        await transfer.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Emit socket event after commit
        const io = req.app.get("io");
        if (io) {
            io.to("admins").emit("transferUpdated", { transfer });
        }

        res.json({ success: true, data: transfer });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.receiveTransfer = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const { notes } = req.body || {};
        const userId = req.user?.id;

        const transfer = await StockTransfer.findById(id).session(session);
        if (!transfer) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ success: false, message: "Transfer not found" });
        }

        if (transfer.status !== "IN_TRANSIT") {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Transfer must be in transit" });
        }

        // Increase stock at destination location
        for (const item of transfer.items) {
            await updateStock({
                productId: item.productId,
                warehouseId: transfer.toLocationId,
                locationId: transfer.toLocationId,
                quantity: item.quantity,
                movementType: "TRANSFER_IN",
                referenceType: "TRANSFER",
                referenceModel: "StockTransfer",
                referenceId: transfer._id,
                userId,
                reason: "Stock transfer received",
                notes: notes || transfer.notes,
                session
            });

            // Update serial numbers if provided
            if (item.serialNumbers && item.serialNumbers.length > 0) {
                for (const sn of item.serialNumbers) {
                    const serial = await SerialNumber.findOne({ serialNumber: sn }).session(session);
                    if (serial) {
                        serial.status = "IN_STOCK";
                        serial.currentLocationId = transfer.toLocationId;
                        serial.warehouseId = transfer.toLocationId;
                        await serial.save({ session });
                    }
                }
            }
        }

        transfer.status = "RECEIVED";
        transfer.receivedBy = userId;
        transfer.receivedAt = new Date();
        await transfer.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Emit socket event after commit
        const io = req.app.get("io");
        if (io) {
            io.to("admins").emit("transferUpdated", { transfer });
        }

        res.json({ success: true, data: transfer });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTransfers = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        
        const query = {};
        if (status) query.status = status;

        const transfers = await StockTransfer.find(query)
            .populate("fromLocationId", "name code")
            .populate("toLocationId", "name code")
            .populate("requestedBy", "name email")
            .populate("approvedBy", "name")
            .populate("items.productId", "name model")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await StockTransfer.countDocuments(query);

        res.json({
            success: true,
            data: transfers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== SERIAL NUMBERS ====================
exports.getSerialNumbers = async (req, res) => {
    try {
        const { productId, status, page = 1, limit = 20 } = req.query;
        
        const query = {};
        if (productId) query.productId = productId;
        if (status) query.status = status;

        const serialNumbers = await SerialNumber.find(query)
            .populate("productId", "name model")
            .populate("currentLocationId", "name code")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await SerialNumber.countDocuments(query);

        res.json({
            success: true,
            data: serialNumbers,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createSerialNumber = async (req, res) => {
    try {
        const { serialNumber, productId, model, purchaseReference, currentLocationId } = req.body;

        const serial = await SerialNumber.create({
            serialNumber,
            productId,
            model,
            purchaseReference,
            purchaseDate: new Date(),
            currentLocationId,
            status: "IN_STOCK"
        });

        res.json({ success: true, data: serial });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== WAREHOUSES ====================
exports.getWarehouses = async (req, res) => {
    try {
        const warehouses = await Warehouse.find({ isActive: true }).sort({ name: 1 });
        res.json({ success: true, data: warehouses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createWarehouse = async (req, res) => {
    try {
        const { name, code, address, manager, phone } = req.body;

        const warehouse = await Warehouse.create({
            name,
            code: code.toUpperCase(),
            address,
            manager,
            phone
        });

        res.json({ success: true, data: warehouse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateWarehouse = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, address, manager, phone, isActive } = req.body;

        const warehouse = await Warehouse.findByIdAndUpdate(
            id,
            { name, address, manager, phone, isActive },
            { new: true }
        );

        if (!warehouse) {
            return res.status(404).json({ success: false, message: "Warehouse not found" });
        }

        res.json({ success: true, data: warehouse });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== LOW STOCK ====================
exports.getLowStock = async (req, res) => {
    try {
        const lowStock = await getLowStockProducts();
        res.json({ success: true, data: lowStock });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== OUT OF STOCK ====================
exports.getOutOfStock = async (req, res) => {
    try {
        const outOfStock = await getOutOfStockProducts();
        res.json({ success: true, data: outOfStock });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== INVENTORY MOVEMENTS ====================
exports.getMovements = async (req, res) => {
    try {
        const { productId, movementType, page = 1, limit = 50 } = req.query;
        
        const query = {};
        if (productId) query.productId = productId;
        if (movementType) query.movementType = movementType;

        const movements = await InventoryMovement.find(query)
            .populate("productId", "name model")
            .populate("locationId", "name code")
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await InventoryMovement.countDocuments(query);

        res.json({
            success: true,
            data: movements,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== INVENTORY VALUATION ====================
exports.getValuation = async (req, res) => {
    try {
        const valuation = await getInventoryValuation();
        res.json({ success: true, data: valuation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==================== UPDATE INVENTORY SETTINGS ====================
exports.updateInventorySettings = async (req, res) => {
    try {
        const { productId } = req.params;
        const {
            sku,
            barcode,
            purchasePrice,
            sellingPrice,
            vat,
            minStockLevel,
            reorderLevel,
            maxStockLevel,
            trackSerialNumber,
            warrantyPeriod,
            status
        } = req.body;

        const inventory = await Inventory.findOneAndUpdate(
            { productId },
            {
                sku,
                barcode,
                purchasePrice,
                sellingPrice,
                vat,
                minStockLevel,
                reorderLevel,
                maxStockLevel,
                trackSerialNumber,
                warrantyPeriod,
                status
            },
            { new: true, upsert: true }
        );

        res.json({ success: true, data: inventory });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
