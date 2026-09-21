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
        locationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
            index: true
        },
        movementType: {
            type: String,
            enum: [
                "PURCHASE",
                "SALE",
                "SALE_RETURN",
                "PURCHASE_RETURN",
                "TRANSFER_OUT",
                "TRANSFER_IN",
                "ADJUSTMENT_IN",
                "ADJUSTMENT_OUT",
                "DAMAGE",
                "OPENING_STOCK"
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
        referenceType: {
            type: String,
            enum: ["PURCHASE", "SALE", "TRANSFER", "ADJUSTMENT", "RETURN", "MANUAL"],
            required: true
        },
      referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true,
    default: null
},

userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
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

// Indexes
inventoryMovementSchema.index({ movementId: 1 }, { unique: true });
inventoryMovementSchema.index({ productId: 1, createdAt: -1 });
inventoryMovementSchema.index({ referenceType: 1, referenceId: 1 });
inventoryMovementSchema.index({ createdAt: -1 });
inventoryMovementSchema.index({ movementType: 1, createdAt: -1 });

// Immutable - prevent updates
inventoryMovementSchema.pre("save", function(next) {
    if (this.isModified() && !this.isNew) {
        return next(new Error("Inventory movements are immutable and cannot be modified"));
    }
    next();
});

module.exports = mongoose.model("InventoryMovement", inventoryMovementSchema);
