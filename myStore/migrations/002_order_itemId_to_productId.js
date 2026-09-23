/**
 * Migration 002: Ensure Order Items Have Both itemId and productId
 * Idempotent: Can be run multiple times safely.
 *
 * Scans all Orders in the database and ensures every item subdocument
 * has both productId and itemId set to the valid Product reference.
 */

require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const Order = require("../Models/order");

async function runMigration() {
    console.log("🚀 [Migration 002] Starting order itemId -> productId normalization...");

    // Find orders that have items missing either productId or itemId
    const cursor = Order.find({
        $or: [
            { "items.productId": { $exists: false } },
            { "items.productId": null },
            { "items.itemId": { $exists: false } },
            { "items.itemId": null }
        ]
    }).cursor();

    let updatedOrdersCount = 0;
    let updatedItemsCount = 0;

    for await (const order of cursor) {
        let modified = false;

        if (Array.isArray(order.items)) {
            for (const item of order.items) {
                if (!item.productId && item.itemId) {
                    item.productId = item.itemId;
                    modified = true;
                    updatedItemsCount++;
                } else if (!item.itemId && item.productId) {
                    item.itemId = item.productId;
                    modified = true;
                    updatedItemsCount++;
                }
            }
        }

        if (modified) {
            await Order.updateOne(
                { _id: order._id },
                { $set: { items: order.items } }
            );
            updatedOrdersCount++;
        }
    }

    console.log(`✅ [Migration 002] Completed. Normalized ${updatedItemsCount} items across ${updatedOrdersCount} orders.`);
    return { success: true, updatedOrdersCount, updatedItemsCount };
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
