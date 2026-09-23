/**
 * Runner to execute all migrations in sequence.
 * Usage: node migrations/run_all.js
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const migration001 = require("./001_inventory_add_warehouse");
const migration002 = require("./002_order_itemId_to_productId");
const migration003 = require("./003_product_stock_to_inventory");

async function runAll() {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lucky";
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected.");

    try {
        console.log("\n==========================================");
        console.log("STEP 1: Inventory Warehouse Assignment");
        console.log("==========================================");
        await migration001();

        console.log("\n==========================================");
        console.log("STEP 2: Order Item Normalization");
        console.log("==========================================");
        await migration002();

        console.log("\n==========================================");
        console.log("STEP 3: Product Stock Sync to Inventory");
        console.log("==========================================");
        await migration003();

        console.log("\n🎉 All migrations completed successfully!");
    } catch (err) {
        console.error("❌ Migration runner failed:", err);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB.");
    }
}

if (require.main === module) {
    runAll();
}

module.exports = runAll;
