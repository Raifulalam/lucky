const mongoose = require("mongoose");
const { Schema } = mongoose;

const customerReturnSchema = new Schema(
    {
        returnNumber: {
            type: String,
            unique: true,
            required: true,
            index: true
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        serialNumber: {
            type: String,
            trim: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        reason: {
            type: String,
            required: true,
            trim: true
        },
        status: {
            type: String,
            enum: ["REQUESTED", "INSPECTING", "APPROVED", "REJECTED", "COMPLETED"],
            default: "REQUESTED",
            index: true
        },
        inspectionResult: {
            type: String,
            trim: true
        },
        action: {
            type: String,
            enum: ["RESTOCK", "DAMAGED", "REFUND", "REPLACEMENT"]
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Indexes
customerReturnSchema.index({ returnNumber: 1 }, { unique: true });
customerReturnSchema.index({ orderId: 1 });
customerReturnSchema.index({ customerId: 1 });
customerReturnSchema.index({ status: 1 });
customerReturnSchema.index({ createdAt: -1 });

module.exports = mongoose.model("CustomerReturn", customerReturnSchema);
