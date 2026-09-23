const mongoose = require("mongoose");
const { Schema } = mongoose;

const stockTransferSchema = new Schema(
    {
        transferNumber: {
            type: String,
            unique: true,
            required: true,
            index: true
        },
        fromLocationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
            required: true
        },
        toLocationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
            required: true
        },
        status: {
            type: String,
            enum: ["DRAFT", "REQUESTED", "APPROVED", "IN_TRANSIT", "RECEIVED", "CANCELLED"],
            default: "DRAFT",
            index: true
        },
        items: [{
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
            serialNumbers: [{
                type: String,
                trim: true
            }]
        }],
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"   // FIXED: was "users"
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"   // FIXED: was "users"
        },
        dispatchedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"   // FIXED: was "users"
        },
        receivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"   // FIXED: was "users"
        },
        requestedAt: {
            type: Date
        },
        approvedAt: {
            type: Date
        },
        dispatchedAt: {
            type: Date
        },
        receivedAt: {
            type: Date
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
stockTransferSchema.index({ transferNumber: 1 }, { unique: true });
stockTransferSchema.index({ status: 1 });
stockTransferSchema.index({ fromLocationId: 1 });
stockTransferSchema.index({ toLocationId: 1 });
stockTransferSchema.index({ createdAt: -1 });

module.exports = mongoose.model("StockTransfer", stockTransferSchema);
