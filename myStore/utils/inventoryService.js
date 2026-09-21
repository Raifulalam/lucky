const Inventory = require("../Models/Inventory");
const InventoryMovement = require("../Models/InventoryMovement");
const SerialNumber = require("../Models/SerialNumber");
const Warehouse = require("../Models/Warehouse");

// Generate unique movement ID
const generateMovementId = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `INV-${year}${month}-${random}`;
};

// Generate transfer number
const generateTransferNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `TRF-${year}${month}-${random}`;
};

// Generate adjustment number
const generateAdjustmentNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `ADJ-${year}${month}-${random}`;
};

// Get or create inventory for a product
const getOrCreateInventory = async (productId) => {
    let inventory = await Inventory.findOne({ productId });
    if (!inventory) {
        inventory = await Inventory.create({ productId });
    }
    return inventory;
};

// Update stock with movement record
const updateStock = async ({
    productId,
    locationId,
    quantity,
    movementType,
    referenceType,
    referenceId,
    userId,
    reason,
    notes
}) => {
    const session = await Inventory.startSession();
    session.startTransaction();

    try {
        const inventory = await getOrCreateInventory(productId);
        const previousStock = inventory.currentStock;
        
        // Calculate new stock
        const isIncrease = ["PURCHASE", "SALE_RETURN", "TRANSFER_IN", "ADJUSTMENT_IN", "OPENING_STOCK"].includes(movementType);
        const newStock = isIncrease ? previousStock + quantity : previousStock - quantity;

        // Prevent negative stock
        if (newStock < 0) {
            throw new Error("Insufficient stock for this operation");
        }

        // Check for idempotency - prevent duplicate operations
        const existingMovement = await InventoryMovement.findOne({
            referenceType,
            referenceId,
            productId
        });

        if (existingMovement) {
            await session.abortTransaction();
            session.endSession();
            throw new Error("This operation has already been processed");
        }

        // Update inventory
        inventory.currentStock = newStock;
        inventory.availableStock = newStock - inventory.reservedStock;

        // Update location stock if location provided
        if (locationId) {
            const locationIndex = inventory.locations.findIndex(
                loc => loc.locationId.toString() === locationId.toString()
            );

            if (locationIndex >= 0) {
                inventory.locations[locationIndex].quantity = isIncrease
                    ? inventory.locations[locationIndex].quantity + quantity
                    : inventory.locations[locationIndex].quantity - quantity;
            } else {
                inventory.locations.push({
                    locationId,
                    quantity: isIncrease ? quantity : 0,
                    reserved: 0,
                    damaged: 0
                });
            }
        }

        await inventory.save({ session });

        // Create movement record
        const movement = await InventoryMovement.create([{
            movementId: generateMovementId(),
            productId,
            sku: inventory.sku,
            locationId,
            movementType,
            quantity: isIncrease ? quantity : -quantity,
            previousStock,
            newStock,
            referenceType,
           referenceId: referenceId || null,
            userId,
            reason,
            notes
        }], { session });

        await session.commitTransaction();
        session.endSession();

        return { inventory, movement: movement[0] };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

// Reserve stock for a sale
const reserveStock = async (productId, quantity, referenceId, userId) => {
    const session = await Inventory.startSession();
    session.startTransaction();

    try {
        const inventory = await getOrCreateInventory(productId);
        
        if (inventory.availableStock < quantity) {
            throw new Error("Insufficient available stock");
        }

        inventory.reservedStock += quantity;
        inventory.availableStock = inventory.currentStock - inventory.reservedStock;

        await inventory.save({ session });

        // Create movement record
        const movement = await InventoryMovement.create([{
            movementId: generateMovementId(),
            productId,
            sku: inventory.sku,
            movementType: "RESERVE",
            quantity: -quantity,
            previousStock: inventory.currentStock,
            newStock: inventory.currentStock,
            referenceType: "SALE",
            referenceId: referenceId || null,
            userId,
            reason: "Stock reserved for sale"
        }], { session });

        await session.commitTransaction();
        session.endSession();

        return { inventory, movement: movement[0] };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

// Release reserved stock
const releaseReservedStock = async (productId, quantity, referenceId, userId) => {
    const session = await Inventory.startSession();
    session.startTransaction();

    try {
        const inventory = await getOrCreateInventory(productId);
        
        if (inventory.reservedStock < quantity) {
            throw new Error("Insufficient reserved stock to release");
        }

        inventory.reservedStock -= quantity;
        inventory.availableStock = inventory.currentStock - inventory.reservedStock;

        await inventory.save({ session });

        // Create movement record
        const movement = await InventoryMovement.create([{
            movementId: generateMovementId(),
            productId,
            sku: inventory.sku,
            movementType: "RELEASE",
            quantity: quantity,
            previousStock: inventory.currentStock,
            newStock: inventory.currentStock,
            referenceType: "SALE",
            referenceId: referenceId || null,
            userId,
            reason: "Reserved stock released"
        }], { session });

        await session.commitTransaction();
        session.endSession();

        return { inventory, movement: movement[0] };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};

// Update serial number status
const updateSerialNumberStatus = async (serialNumber, status, additionalData = {}) => {
    const serial = await SerialNumber.findOne({ serialNumber });
    if (!serial) {
        throw new Error("Serial number not found");
    }

    Object.assign(serial, { status, ...additionalData });
    await serial.save();

    return serial;
};

// Get inventory summary
const getInventorySummary = async () => {
    const totalProducts = await Inventory.countDocuments({ status: "ACTIVE" });
    const totalStock = await Inventory.aggregate([
        { $match: { status: "ACTIVE" } },
        { $group: { _id: null, total: { $sum: "$currentStock" } } }
    ]);
    const totalValue = await Inventory.aggregate([
        { $match: { status: "ACTIVE" } },
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },
        {
            $group: {
                _id: null,
                total: { $sum: { $multiply: ["$currentStock", "$product.price"] } }
            }
        }
    ]);
    const lowStock = await Inventory.countDocuments({
        status: "ACTIVE",
        currentStock: { $gt: 0, $lte: "$reorderLevel" }
    });
    const outOfStock = await Inventory.countDocuments({
        status: "ACTIVE",
        currentStock: 0
    });

    return {
        totalProducts,
        totalStock: totalStock[0]?.total || 0,
        totalValue: totalValue[0]?.total || 0,
        lowStock,
        outOfStock
    };
};

// Get low stock products
const getLowStockProducts = async () => {
    return await Inventory.find({
        status: "ACTIVE",
        $expr: { $lte: ["$currentStock", "$reorderLevel"] }
    }).populate("productId");
};

// Get out of stock products
const getOutOfStockProducts = async () => {
    return await Inventory.find({
        status: "ACTIVE",
        currentStock: 0
    }).populate("productId");
};

// Calculate inventory valuation
const getInventoryValuation = async () => {
    const valuation = await Inventory.aggregate([
        { $match: { status: "ACTIVE" } },
        {
            $lookup: {
                from: "products",
                localField: "productId",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" },
        {
            $group: {
                _id: "$product.category",
                totalQuantity: { $sum: "$currentStock" },
                totalValue: { $sum: { $multiply: ["$currentStock", "$purchasePrice"] } },
                products: {
                    $push: {
                        productId: "$productId",
                        name: "$product.name",
                        quantity: "$currentStock",
                        purchasePrice: "$purchasePrice",
                        value: { $multiply: ["$currentStock", "$purchasePrice"] }
                    }
                }
            }
        }
    ]);

    return valuation;
};

module.exports = {
    generateMovementId,
    generateTransferNumber,
    generateAdjustmentNumber,
    getOrCreateInventory,
    updateStock,
    reserveStock,
    releaseReservedStock,
    updateSerialNumberStatus,
    getInventorySummary,
    getLowStockProducts,
    getOutOfStockProducts,
    getInventoryValuation
};
