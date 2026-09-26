const mongoose = require("mongoose");
const Inventory = require("../Models/Inventory");
const InventoryMovement = require("../Models/InventoryMovement");
const SerialNumber = require("../Models/SerialNumber");
const Warehouse = require("../Models/Warehouse");
const Product = require("../Models/products");

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

// Fix any legacy single-field unique index on productId in MongoDB
const fixInventoryIndexes = async () => {
    try {
        const collection = Inventory.collection;
        const indexes = await collection.indexes();
        const legacyIndex = indexes.find(idx => idx.name === "productId_1" && idx.unique);
        if (legacyIndex) {
            console.log("⚠️ Found legacy single-field unique index 'productId_1' on Inventory. Dropping index...");
            await collection.dropIndex("productId_1");
            console.log("✅ Successfully dropped legacy index 'productId_1'. Multi-warehouse inventory is now supported.");
        }
        await Inventory.syncIndexes();
    } catch (err) {
        if (err.codeName !== "IndexNotFound" && err.code !== 27) {
            console.warn("Notice during Inventory index check:", err.message);
        }
    }
};

// Get or create inventory for a product and optional warehouse.
// Uses atomic findOneAndUpdate with upsert to prevent E11000 duplicate key race conditions.
const getOrCreateInventory = async (productId, warehouseId = null, session = null) => {
    let targetWarehouseId = warehouseId;
    if (!targetWarehouseId) {
        const mainWh = (session
            ? await Warehouse.findOne({ code: "MAIN" }).session(session)
            : await Warehouse.findOne({ code: "MAIN" })) ||
            (session
            ? await Warehouse.findOne({ isActive: true }).session(session)
            : await Warehouse.findOne({ isActive: true }));
        if (mainWh) targetWarehouseId = mainWh._id;
    }

    const query = { productId };
    if (targetWarehouseId) query.warehouseId = targetWarehouseId;

    const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
    if (session) opts.session = session;

    const performUpsert = async () => {
        return await Inventory.findOneAndUpdate(
            query,
            { $setOnInsert: {
                productId,
                warehouseId: targetWarehouseId || undefined,
                currentStock: 0,
                availableStock: 0,
                reservedStock: 0,
                damagedStock: 0,
                locations: targetWarehouseId ? [{ locationId: targetWarehouseId, quantity: 0 }] : []
            }},
            opts
        );
    };

    try {
        return await performUpsert();
    } catch (err) {
        if (err.code === 11000) {
            // Auto-drop stale single-field unique index on E11000 detection
            if (err.message && (err.message.includes("productId_1") || err.message.includes("dup key"))) {
                try {
                    await Inventory.collection.dropIndex("productId_1");
                    console.log("⚡ Auto-dropped legacy unique index 'productId_1' on E11000 detection.");
                    return await performUpsert();
                } catch (dropErr) {
                    // Ignore drop error if already dropped or non-existent
                }
            }

            const found = session
                ? await Inventory.findOne(query).session(session)
                : await Inventory.findOne(query);
            if (found) return found;
        }
        throw err;
    }
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

        // Two-way synchronization: update Product.stock in lockstep
        try {
            await Product.findByIdAndUpdate(
                productId,
                { stock: newStock },
                session ? { session } : {}
            );
        } catch (prodSyncErr) {
            console.warn(`Warning: failed to sync Product.stock for ${productId}:`, prodSyncErr.message);
        }

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

// ==================== SYNC ALL PRODUCTS TO INVENTORY ====================
// Uses upsert to safely handle duplicate key errors during bulk sync.
const syncAllProductsToInventory = async () => {
    try {
        await fixInventoryIndexes();

        let warehouse = await Warehouse.findOne({ code: "MAIN" }) ||
                        await Warehouse.findOne({ isActive: true }) ||
                        await Warehouse.findOne();

        if (!warehouse) {
            warehouse = await Warehouse.create({
                name: "Lucky Impex Showroom",
                code: "MAIN",
                address: "Central Showroom & Distribution Center",
                manager: "Admin",
                phone: "+977-9800000000",
                isActive: true
            });
        }

        const products = await Product.find().lean();
        let createdCount = 0;
        let syncedCount = 0;

        for (const prod of products) {
            const prodStock = Number(prod.stock) || 0;
            const sellingPrice = Number(prod.price) || 0;
            const purchasePrice = prod.mrp ? Math.round(prod.mrp * 0.8) : sellingPrice;

            // Atomic upsert — prevents E11000 duplicate key errors
            const result = await Inventory.findOneAndUpdate(
                { productId: prod._id, warehouseId: warehouse._id },
                {
                    $setOnInsert: {
                        productId: prod._id,
                        warehouseId: warehouse._id,
                        currentStock: prodStock,
                        availableStock: prodStock,
                        reservedStock: 0,
                        damagedStock: 0,
                        sellingPrice,
                        purchasePrice,
                        status: "ACTIVE",
                        locations: [{
                            locationId: warehouse._id,
                            quantity: prodStock,
                            reserved: 0,
                            damaged: 0
                        }]
                    },
                    $set: {
                        ...(sellingPrice ? { sellingPrice } : {}),
                        ...(purchasePrice ? { purchasePrice } : {})
                    }
                },
                { upsert: true, new: false, setDefaultsOnInsert: true }
            );

            if (!result) {
                // null means upsert created a new doc
                createdCount++;
            } else {
                // Sync stock values if needed
                let needsSave = false;
                const inv = result;
                if (!inv.warehouseId) { inv.warehouseId = warehouse._id; needsSave = true; }
                if ((inv.currentStock === 0 || inv.currentStock === undefined) && prodStock > 0) {
                    inv.currentStock = prodStock;
                    inv.availableStock = Math.max(0, prodStock - (inv.reservedStock || 0));
                    needsSave = true;
                }
                if (prod.stock === 0 && (inv.currentStock || 0) > 0) {
                    await Product.findByIdAndUpdate(prod._id, { stock: inv.currentStock });
                }
                if (needsSave) { await inv.save(); syncedCount++; }
            }
        }

        console.log(`✅ [Inventory Sync] Total: ${products.length}, Created: ${createdCount}, Updated: ${syncedCount}`);
        return { success: true, total: products.length, createdCount, syncedCount };
    } catch (err) {
        console.error("❌ [Inventory Sync] Failed:", err);
        throw err;
    }
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
    getInventoryValuation,
    syncAllProductsToInventory
};
