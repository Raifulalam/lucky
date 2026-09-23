const mongoose = require("mongoose");
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

// Get or create inventory for a product and optional warehouse
const getOrCreateInventory = async (productId, warehouseId = null, session = null) => {
    const query = { productId };
    if (warehouseId) {
        query.warehouseId = warehouseId;
    }

    let inventory = session
        ? await Inventory.findOne(query).session(session)
        : await Inventory.findOne(query);

    if (!inventory) {
        // If searching with warehouseId didn't find one, check if legacy record without warehouseId exists
        if (warehouseId) {
            const legacyInv = session
                ? await Inventory.findOne({ productId, warehouseId: { $exists: false } }).session(session)
                : await Inventory.findOne({ productId, warehouseId: { $exists: false } });

            if (legacyInv) {
                legacyInv.warehouseId = warehouseId;
                await legacyInv.save({ session });
                return legacyInv;
            }
        }

        const createData = {
            productId,
            warehouseId: warehouseId || undefined,
            locations: warehouseId ? [{ locationId: warehouseId, quantity: 0 }] : []
        };

        if (session) {
            const created = await Inventory.create([createData], { session });
            inventory = created[0];
        } else {
            inventory = await Inventory.create(createData);
        }
    }
    return inventory;
};

// Update stock with movement record (supports external transaction session)
const updateStock = async (params) => {
    const {
        productId,
        warehouseId,
        locationId,
        quantity,
        movementType,
        referenceType,
        referenceModel,
        referenceId,
        userId,
        reason,
        notes,
        session: externalSession
    } = params;

    const targetWarehouseId = warehouseId || locationId || null;
    const cleanRefId = (referenceId && referenceId !== "") ? referenceId : null;
    
    // Normalize referenceModel
    let resolvedRefModel = referenceModel || null;
    if (!resolvedRefModel && referenceType) {
        const typeMap = {
            SALE: "Order",
            ORDER: "Order",
            PURCHASE: "Purchase",
            TRANSFER: "StockTransfer",
            ADJUSTMENT: "StockAdjustment",
            RETURN: "CustomerReturn",
            CUSTOMER_RETURN: "CustomerReturn",
            SUPPLIER_RETURN: "SupplierReturn"
        };
        resolvedRefModel = typeMap[referenceType] || null;
    }

    // Determine if caller provided an existing session or if we manage our own
    const isManagedSession = !externalSession;
    const session = externalSession || (await mongoose.startSession());
    if (isManagedSession) {
        session.startTransaction();
    }

    try {
        const inventory = await getOrCreateInventory(productId, targetWarehouseId, session);
        const previousStock = inventory.currentStock || 0;

        // Calculate new stock
        const isIncrease = [
            "PURCHASE",
            "SALE_RETURN",
            "CUSTOMER_RETURN",
            "TRANSFER_IN",
            "ADJUSTMENT_IN",
            "OPENING_STOCK"
        ].includes(movementType);

        const newStock = isIncrease ? previousStock + quantity : previousStock - quantity;

        // Prevent negative stock
        if (newStock < 0) {
            throw new Error(`Insufficient stock for product ${productId}. Current: ${previousStock}, Requested: ${quantity}`);
        }

        // Idempotency check if reference is provided
        if (cleanRefId && (referenceType || resolvedRefModel)) {
            const idempotencyQuery = {
                productId,
                referenceId: cleanRefId,
                movementType
            };
            const existingMovement = await InventoryMovement.findOne(idempotencyQuery).session(session);
            if (existingMovement) {
                if (isManagedSession) {
                    await session.abortTransaction();
                    session.endSession();
                }
                throw new Error("This inventory operation has already been processed");
            }
        }

        // Update inventory totals
        inventory.currentStock = newStock;
        inventory.availableStock = Math.max(0, newStock - (inventory.reservedStock || 0) - (inventory.damagedStock || 0));
        if (targetWarehouseId && !inventory.warehouseId) {
            inventory.warehouseId = targetWarehouseId;
        }

        // Update locations array for backward compatibility
        if (targetWarehouseId) {
            if (!inventory.locations) inventory.locations = [];
            const locIndex = inventory.locations.findIndex(
                loc => loc.locationId && loc.locationId.toString() === targetWarehouseId.toString()
            );

            if (locIndex >= 0) {
                inventory.locations[locIndex].quantity = isIncrease
                    ? (inventory.locations[locIndex].quantity || 0) + quantity
                    : Math.max(0, (inventory.locations[locIndex].quantity || 0) - quantity);
            } else {
                inventory.locations.push({
                    locationId: targetWarehouseId,
                    quantity: isIncrease ? quantity : 0,
                    reserved: 0,
                    damaged: 0
                });
            }
        }

        await inventory.save({ session });

        // Create movement record
        const movementData = {
            movementId: generateMovementId(),
            productId,
            sku: inventory.sku,
            warehouseId: targetWarehouseId,
            locationId: targetWarehouseId,
            movementType,
            quantity: isIncrease ? quantity : -quantity,
            previousStock,
            newStock,
            referenceType: referenceType || (resolvedRefModel ? resolvedRefModel.toUpperCase() : undefined),
            referenceModel: resolvedRefModel,
            referenceId: cleanRefId,
            userId: userId || undefined,
            reason: reason || "",
            notes: notes || ""
        };

        const movement = await InventoryMovement.create([movementData], { session });

        if (isManagedSession) {
            await session.commitTransaction();
            session.endSession();
        }

        return { inventory, movement: movement[0] };
    } catch (error) {
        if (isManagedSession) {
            await session.abortTransaction();
            session.endSession();
        }
        throw error;
    }
};

// Reserve stock for a sale (supports both positional and object arguments)
const reserveStock = async (arg1, arg2, arg3, arg4, arg5, arg6) => {
    let productId, quantity, referenceId, userId, warehouseId, externalSession;

    if (typeof arg1 === "object" && arg1 !== null) {
        ({ productId, quantity, referenceId, userId, warehouseId, session: externalSession } = arg1);
    } else {
        productId = arg1;
        quantity = arg2;
        referenceId = arg3;
        userId = arg4;
        warehouseId = arg5 || null;
        externalSession = arg6 || null;
    }

    const cleanRefId = (referenceId && referenceId !== "") ? referenceId : null;
    const isManagedSession = !externalSession;
    const session = externalSession || (await mongoose.startSession());
    if (isManagedSession) {
        session.startTransaction();
    }

    try {
        const inventory = await getOrCreateInventory(productId, warehouseId, session);
        const available = Math.max(0, (inventory.currentStock || 0) - (inventory.reservedStock || 0) - (inventory.damagedStock || 0));

        if (available < quantity) {
            throw new Error(`Insufficient available stock for product ${productId}. Available: ${available}, Requested: ${quantity}`);
        }

        inventory.reservedStock = (inventory.reservedStock || 0) + quantity;
        inventory.availableStock = Math.max(0, (inventory.currentStock || 0) - inventory.reservedStock - (inventory.damagedStock || 0));

        await inventory.save({ session });

        const movementData = {
            movementId: generateMovementId(),
            productId,
            sku: inventory.sku,
            warehouseId: warehouseId || inventory.warehouseId || null,
            locationId: warehouseId || inventory.warehouseId || null,
            movementType: "RESERVE",
            quantity: -quantity,
            previousStock: inventory.currentStock,
            newStock: inventory.currentStock,
            referenceType: "SALE",
            referenceModel: "Order",
            referenceId: cleanRefId,
            userId: userId || undefined,
            reason: "Stock reserved for sale"
        };

        const movement = await InventoryMovement.create([movementData], { session });

        if (isManagedSession) {
            await session.commitTransaction();
            session.endSession();
        }

        return { inventory, movement: movement[0] };
    } catch (error) {
        if (isManagedSession) {
            await session.abortTransaction();
            session.endSession();
        }
        throw error;
    }
};

// Release reserved stock (e.g. order cancelled)
const releaseReservedStock = async (arg1, arg2, arg3, arg4, arg5, arg6) => {
    let productId, quantity, referenceId, userId, warehouseId, externalSession;

    if (typeof arg1 === "object" && arg1 !== null) {
        ({ productId, quantity, referenceId, userId, warehouseId, session: externalSession } = arg1);
    } else {
        productId = arg1;
        quantity = arg2;
        referenceId = arg3;
        userId = arg4;
        warehouseId = arg5 || null;
        externalSession = arg6 || null;
    }

    const cleanRefId = (referenceId && referenceId !== "") ? referenceId : null;
    const isManagedSession = !externalSession;
    const session = externalSession || (await mongoose.startSession());
    if (isManagedSession) {
        session.startTransaction();
    }

    try {
        const inventory = await getOrCreateInventory(productId, warehouseId, session);

        if ((inventory.reservedStock || 0) < quantity) {
            // Cap release at current reservedStock to avoid negative reserved stock
            inventory.reservedStock = 0;
        } else {
            inventory.reservedStock = (inventory.reservedStock || 0) - quantity;
        }

        inventory.availableStock = Math.max(0, (inventory.currentStock || 0) - inventory.reservedStock - (inventory.damagedStock || 0));

        await inventory.save({ session });

        const movementData = {
            movementId: generateMovementId(),
            productId,
            sku: inventory.sku,
            warehouseId: warehouseId || inventory.warehouseId || null,
            locationId: warehouseId || inventory.warehouseId || null,
            movementType: "RELEASE",
            quantity: quantity,
            previousStock: inventory.currentStock,
            newStock: inventory.currentStock,
            referenceType: "SALE",
            referenceModel: "Order",
            referenceId: cleanRefId,
            userId: userId || undefined,
            reason: "Reserved stock released"
        };

        const movement = await InventoryMovement.create([movementData], { session });

        if (isManagedSession) {
            await session.commitTransaction();
            session.endSession();
        }

        return { inventory, movement: movement[0] };
    } catch (error) {
        if (isManagedSession) {
            await session.abortTransaction();
            session.endSession();
        }
        throw error;
    }
};

// Update serial number status
const updateSerialNumberStatus = async (serialNumber, status, additionalData = {}) => {
    const serial = await SerialNumber.findOne({ serialNumber });
    if (!serial) {
        throw new Error(`Serial number ${serialNumber} not found`);
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
        $expr: {
            $and: [
                { $gt: ["$currentStock", 0] },
                { $lte: ["$currentStock", "$reorderLevel"] }
            ]
        }
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

// Get low stock products with valid $expr check
const getLowStockProducts = async () => {
    return await Inventory.find({
        status: "ACTIVE",
        $expr: {
            $and: [
                { $gt: ["$currentStock", 0] },
                { $lte: ["$currentStock", "$reorderLevel"] }
            ]
        }
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
