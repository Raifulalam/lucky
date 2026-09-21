const mongoose = require("mongoose");
const { Schema } = mongoose;

const serialNumberSchema = new Schema(
    {
        serialNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true
        },
        model: {
            type: String,
            trim: true
        },
        purchaseReference: {
            type: String,
            trim: true
        },
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier"
        },
        purchaseDate: {
            type: Date
        },
        saleReference: {
            type: String,
            trim: true
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users"
        },
        saleDate: {
            type: Date
        },
        warrantyStartDate: {
            type: Date
        },
        warrantyExpiryDate: {
            type: Date
        },
        currentLocationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
            index: true
        },
        status: {
            type: String,
            enum: ["IN_STOCK", "RESERVED", "SOLD", "RETURNED", "DAMAGED", "WARRANTY", "TRANSFERRED"],
            default: "IN_STOCK",
            index: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Indexes
serialNumberSchema.index({ serialNumber: 1 }, { unique: true });
serialNumberSchema.index({ productId: 1 });
serialNumberSchema.index({ status: 1 });
serialNumberSchema.index({ currentLocationId: 1 });
serialNumberSchema.index({ warrantyExpiryDate: 1 });

module.exports = mongoose.model("SerialNumber", serialNumberSchema);
