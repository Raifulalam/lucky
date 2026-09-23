/**
 * Migration 003: Product Stock to Inventory
 * Idempotent: Can be run multiple times safely.
 *
 * 1. Resolves default Warehouse.
 * 2. Scans all Product documents. If an Inventory record doesn't exist, creates one
 *    using Product.stock as initial currentStock.
 * 3. If an Inventory record exists but currentStock is 0 while Product.stock > 0,
 *    syncs Product.stock into Inventory.currentStock without overwriting active inventory.
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Product = require("../Models/products");
const Inventory = require("../Models/Inventory");
const Warehouse = require("../Models/Warehouse");

async function runMigration() {
    console.log("🚀 [Migration 003] Starting product stock to inventory sync...");

    // 1. Resolve default Warehouse
    let warehouse = await Warehouse.findOne({ code: "MAIN" }) || await Warehouse.findOne({ isActive: true });
    if (!warehouse) {
        warehouse = await Warehouse.create({
            name: "Main Warehouse",
            code: "MAIN",
            address: "Central Showroom & Distribution Center",
            manager: "Admin",
            phone: "+977-9800000000",
            isActive: true
        });
    }

    const products = await Product.find().lean();
    console.log(`🔍 Found ${products.length} product(s) to check.`);

    let createdCount = 0;
    let syncedCount = 0;

    for (const prod of products) {
        let inv = await Inventory.findOne({
            productId: prod._id,
            warehouseId: warehouse._id
        });

        if (!inv) {
            // Check if there is an inventory record without warehouseId
            inv = await Inventory.findOne({ productId: prod._id });
            if (inv) {
                inv.warehouseId = warehouse._id;
            }
        }

        const initialStock = Number(prod.stock) || 0;

        if (!inv) {
            // Create new inventory record
            await Inventory.create({
                productId: prod._id,
                warehouseId: warehouse._id,
                currentStock: initialStock,
                availableStock: initialStock,
                reservedStock: 0,
                damagedStock: 0,
                sellingPrice: prod.price || 0,
                purchasePrice: prod.mrp ? Math.round(prod.mrp * 0.8) : (prod.price || 0),
                status: "ACTIVE",
                locations: [{
                    locationId: warehouse._id,
                    quantity: initialStock,
                    reserved: 0,
                    damaged: 0
                }]
            });
            createdCount++;
        } else if ((inv.currentStock === 0 || !inv.currentStock) && initialStock > 0) {
            // Only sync if inventory is 0 and product has stock
            inv.currentStock = initialStock;
            inv.availableStock = Math.max(0, initialStock - (inv.reservedStock || 0));
            if (!inv.warehouseId) {
                inv.warehouseId = warehouse._id;
            }
            await inv.save();
            syncedCount++;
        }
    }

    console.log(`✅ [Migration 003] Completed. Created ${createdCount} new inventory records, synced ${syncedCount} existing records.`);
    return { success: true, createdCount, syncedCount };
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
