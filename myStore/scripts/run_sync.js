require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const { syncAllProductsToInventory } = require("../utils/inventoryService");
const Inventory = require("../Models/Inventory");
const Product = require("../Models/products");

async function run() {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lucky";
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected.");

    const totalProductsBefore = await Product.countDocuments();
    const totalInventoryBefore = await Inventory.countDocuments();
    console.log(`📊 Before sync - Products: ${totalProductsBefore}, Inventory records: ${totalInventoryBefore}`);

    const result = await syncAllProductsToInventory();
    console.log("Sync result:", result);

    const totalInventoryAfter = await Inventory.countDocuments();
    console.log(`🎉 After sync - Products: ${totalProductsBefore}, Inventory records: ${totalInventoryAfter}`);

    // Verify sample populated inventory
    const sample = await Inventory.findOne().populate("productId").populate("warehouseId");
    console.log("\nSample synced inventory:", {
        id: sample._id,
        productName: sample.productId?.name,
        productModel: sample.productId?.model,
        warehouseName: sample.warehouseId?.name,
        currentStock: sample.currentStock,
        availableStock: sample.availableStock,
        sellingPrice: sample.sellingPrice
    });

    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
}

run().catch((err) => {
    console.error("Sync failed:", err);
    process.exit(1);
});
