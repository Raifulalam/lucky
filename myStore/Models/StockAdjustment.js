const mongoose = require("mongoose");
const { Schema } = mongoose;

const stockAdjustmentSchema = new Schema(
    {
        adjustmentNumber: {
            type: String,
            unique: true,
            required: true,
            index: true
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },
        locationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse"
        },
        adjustmentType: {
            type: String,
            enum: ["PHYSICAL_COUNT", "DAMAGED", "MISSING", "FOUND", "DATA_CORRECTION", "OTHER"],
            required: true
        },
        currentQuantity: {
            type: Number,
            required: true
        },
        adjustedQuantity: {
            type: Number,
            required: true
        },
        difference: {
            type: Number,
            required: true
        },
        reason: {
            type: String,
            trim: true
        },
        notes: {
            type: String,
            trim: true
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING"
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Indexes
stockAdjustmentSchema.index({ adjustmentNumber: 1 }, { unique: true });
stockAdjustmentSchema.index({ productId: 1 });
stockAdjustmentSchema.index({ status: 1 });
stockAdjustmentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("StockAdjustment", stockAdjustmentSchema);
