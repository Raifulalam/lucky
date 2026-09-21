const mongoose = require("mongoose");
const { Schema } = mongoose;

const supplierReturnSchema = new Schema(
    {
        returnNumber: {
            type: String,
            unique: true,
            required: true,
            index: true
        },
        purchaseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Purchase",
            required: true
        },
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            required: true
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
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
            enum: ["CREATED", "CONFIRMED", "SENT", "COMPLETED", "CANCELLED"],
            default: "CREATED",
            index: true
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
supplierReturnSchema.index({ returnNumber: 1 }, { unique: true });
supplierReturnSchema.index({ purchaseId: 1 });
supplierReturnSchema.index({ supplierId: 1 });
supplierReturnSchema.index({ status: 1 });
supplierReturnSchema.index({ createdAt: -1 });

module.exports = mongoose.model("SupplierReturn", supplierReturnSchema);
