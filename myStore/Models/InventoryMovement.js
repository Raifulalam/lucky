const mongoose = require("mongoose");
const { Schema } = mongoose;

const inventoryMovementSchema = new Schema(
    {
        movementId: {
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

        sku: {
            type: String,
            trim: true
        },

        // warehouseId is the canonical field going forward.
        // locationId is kept as a deprecated alias for backward compat with old records.
        warehouseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
            index: true
        },

        // @deprecated — use warehouseId
        locationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
            index: true
        },

        movementType: {
            type: String,
            enum: [
                "PURCHASE",          // Stock received from a purchase
                "SALE",              // Stock deducted for a completed sale
                "RESERVE",           // Stock reserved for a pending order
                "RELEASE",           // Reserved stock released (order cancelled)
                "SALE_RETURN",       // Alias for CUSTOMER_RETURN (legacy)
                "CUSTOMER_RETURN",   // Stock returned by customer
                "PURCHASE_RETURN",   // Alias for SUPPLIER_RETURN (legacy)
                "SUPPLIER_RETURN",   // Stock returned to supplier
                "TRANSFER_OUT",      // Stock moved out of warehouse
                "TRANSFER_IN",       // Stock moved into warehouse
                "ADJUSTMENT_IN",     // Stock increased via adjustment
                "ADJUSTMENT_OUT",    // Stock decreased via adjustment
                "DAMAGE",            // Stock written off as damaged
                "LOSS",              // Stock written off as lost
                "OPENING_STOCK"      // Initial stock entry
            ],
            required: true,
            index: true
        },

        quantity: {
            type: Number,
            required: true
        },

        previousStock: {
            type: Number,
            required: true
        },

        newStock: {
            type: Number,
            required: true
        },

        // Polymorphic reference — referenceId points to a document whose
        // collection is identified by referenceModel.
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            index: true,
            default: null
        },

        referenceModel: {
            type: String,
            enum: [
                "Order",
                "Purchase",
                "StockTransfer",
                "StockAdjustment",
                "CustomerReturn",
                "SupplierReturn",
                null
            ],
            default: null
        },

        // @deprecated — use referenceModel. Kept for backward compat.
        referenceType: {
            type: String,
            enum: ["PURCHASE", "SALE", "TRANSFER", "ADJUSTMENT", "RETURN", "MANUAL"],
            default: "MANUAL"
        },

        // FIXED: was ref: "users" — registered model name is "User"
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
            default: null
        },

        reason: {
            type: String,
            trim: true
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

// ==================== INDEXES ====================
inventoryMovementSchema.index({ movementId: 1 }, { unique: true });
inventoryMovementSchema.index({ productId: 1, createdAt: -1 });
inventoryMovementSchema.index({ warehouseId: 1, createdAt: -1 });
inventoryMovementSchema.index({ referenceModel: 1, referenceId: 1 });
inventoryMovementSchema.index({ createdAt: -1 });
inventoryMovementSchema.index({ movementType: 1, createdAt: -1 });
inventoryMovementSchema.index({ userId: 1 });

// ==================== PRE-VALIDATE: NORMALIZE ====================
// Prevent empty strings from reaching ObjectId fields.
inventoryMovementSchema.pre("validate", function (next) {
    if (this.referenceId === "" || this.referenceId === undefined) {
        this.referenceId = null;
    }
    // Keep locationId in sync with warehouseId for backward-compat reads
    if (this.warehouseId && !this.locationId) {
        this.locationId = this.warehouseId;
    }
    next();
});

// ==================== PRE-SAVE: IMMUTABILITY ====================
// InventoryMovement is an audit ledger — records must never be changed.
inventoryMovementSchema.pre("save", function (next) {
    if (this.isModified() && !this.isNew) {
        return next(new Error("InventoryMovement records are immutable and cannot be modified"));
    }
    next();
});

module.exports = mongoose.model("InventoryMovement", inventoryMovementSchema);
