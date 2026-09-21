const mongoose = require("mongoose");
const { Schema } = mongoose;

const inventorySchema = new Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            unique: true,
            index: true
        },
        sku: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
            index: true
        },
        barcode: {
            type: String,
            trim: true,
            index: true
        },
        purchasePrice: {
            type: Number,
            min: 0,
            default: 0
        },
        sellingPrice: {
            type: Number,
            min: 0
        },
        vat: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },
        minStockLevel: {
            type: Number,
            min: 0,
            default: 5
        },
        reorderLevel: {
            type: Number,
            min: 0,
            default: 10
        },
        maxStockLevel: {
            type: Number,
            min: 0
        },
        currentStock: {
            type: Number,
            min: 0,
            default: 0
        },
        reservedStock: {
            type: Number,
            min: 0,
            default: 0
        },
        damagedStock: {
            type: Number,
            min: 0,
            default: 0
        },
        availableStock: {
            type: Number,
            min: 0,
            default: 0
        },
        locations: [{
            locationId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Warehouse"
            },
            quantity: {
                type: Number,
                min: 0,
                default: 0
            },
            reserved: {
                type: Number,
                min: 0,
                default: 0
            },
            damaged: {
                type: Number,
                min: 0,
                default: 0
            }
        }],
        trackSerialNumber: {
            type: Boolean,
            default: false
        },
        warrantyPeriod: {
            type: Number, // in months
            default: 12
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "DISCONTINUED"],
            default: "ACTIVE"
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Indexes
inventorySchema.index({ sku: 1 }, { unique: true, sparse: true });
inventorySchema.index({ barcode: 1 });
inventorySchema.index({ "locations.locationId": 1 });
inventorySchema.index({ status: 1 });
inventorySchema.index({ currentStock: 1 });
inventorySchema.index({ availableStock: 1 });

// Virtual for stock status
inventorySchema.virtual("stockStatus").get(function() {
    if (this.currentStock === 0) return "OUT_OF_STOCK";
    if (this.currentStock <= this.reorderLevel) return "LOW_STOCK";
    if (this.currentStock >= this.maxStockLevel) return "OVERSTOCK";
    return "IN_STOCK";
});

// Pre-save hook to calculate available stock
inventorySchema.pre("save", function(next) {
    this.availableStock = Math.max(0, this.currentStock - this.reservedStock);
    next();
});

module.exports = mongoose.model("Inventory", inventorySchema);
