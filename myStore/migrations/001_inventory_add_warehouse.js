/**
 * Migration 001: Add Warehouse to Inventory
 * Idempotent: Can be run multiple times safely.
 *
 * 1. Finds or creates a default "Main Warehouse" (code: "MAIN").
 * 2. Migrates all Inventory records lacking a warehouseId to point to this warehouse.
 * 3. Enforces the compound index { productId: 1, warehouseId: 1 }.
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Warehouse = require("../Models/Warehouse");
const Inventory = require("../Models/Inventory");

async function runMigration() {
    console.log("🚀 [Migration 001] Starting inventory warehouse migration...");

    // 1. Ensure default Warehouse exists
    let defaultWarehouse = await Warehouse.findOne({ code: "MAIN" });
    if (!defaultWarehouse) {
        // Also check if any warehouse exists to use as default
        defaultWarehouse = await Warehouse.findOne({ isActive: true });
    }

    if (!defaultWarehouse) {
        console.log("📦 Creating default 'Main Warehouse' (code: MAIN)...");
        defaultWarehouse = await Warehouse.create({
            name: "Main Warehouse",
            code: "MAIN",
            address: "Central Showroom & Distribution Center",
            manager: "Admin",
            phone: "+977-9800000000",
            isActive: true
        });
        console.log(`✅ Created default warehouse: ${defaultWarehouse._id} (${defaultWarehouse.name})`);
    } else {
        console.log(`ℹ️ Using existing default warehouse: ${defaultWarehouse._id} (${defaultWarehouse.name})`);
    }

    // 2. Find inventory records lacking warehouseId
    const unassignedInventories = await Inventory.find({
        $or: [
            { warehouseId: { $exists: false } },
            { warehouseId: null }
        ]
    });

    console.log(`🔍 Found ${unassignedInventories.length} Inventory record(s) without warehouseId.`);

    let updatedCount = 0;
    for (const inv of unassignedInventories) {
        // Check if there's already an inventory record for this product with this warehouseId to prevent duplicate key
        const existingForWarehouse = await Inventory.findOne({
            productId: inv.productId,
            warehouseId: defaultWarehouse._id,
            _id: { $ne: inv._id }
        });

        if (existingForWarehouse) {
            // Merge stock into existing warehouse record
            existingForWarehouse.currentStock += (inv.currentStock || 0);
            existingForWarehouse.reservedStock += (inv.reservedStock || 0);
            existingForWarehouse.availableStock = Math.max(0, existingForWarehouse.currentStock - existingForWarehouse.reservedStock);
            await existingForWarehouse.save();
            await Inventory.findByIdAndDelete(inv._id);
            console.log(`🔀 Merged duplicate inventory for product ${inv.productId} into ${existingForWarehouse._id}`);
        } else {
            inv.warehouseId = defaultWarehouse._id;
            // Also ensure locations array contains the warehouse
            if (!inv.locations || inv.locations.length === 0) {
                inv.locations = [{
                    locationId: defaultWarehouse._id,
                    quantity: inv.currentStock || 0,
                    reserved: inv.reservedStock || 0,
                    damaged: inv.damagedStock || 0
                }];
            }
            await inv.save();
            updatedCount++;
        }
    }

    console.log(`✅ [Migration 001] Completed. Updated ${updatedCount} inventory record(s).`);
    return { success: true, updatedCount, defaultWarehouseId: defaultWarehouse._id };
}

// Standalone execution support
if (require.main === module) {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lucky";
    mongoose.connect(mongoUri)
        .then(async () => {
            console.log("Connected to MongoDB.");
            await runMigration();
            await mongoose.disconnect();
            console.log("Disconnected from MongoDB.");
            process.exit(0);
        })
        .catch((err) => {
            console.error("Migration failed:", err);
            process.exit(1);
        });
}

module.exports = runMigration;
