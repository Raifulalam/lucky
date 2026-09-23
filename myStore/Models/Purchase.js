const mongoose = require("mongoose");
const { Schema } = mongoose;

const purchaseItemSchema = new Schema(
    {
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
        unitCost: {
            type: Number,
            required: true,
            min: 0
        },
        totalCost: {
            type: Number,
            min: 0,
            default: 0
        },
        // Serial numbers received with this purchase item (optional)
        serialNumbers: [
            {
                type: String,
                trim: true
            }
        ]
    },
    { _id: true }
);

const purchaseSchema = new Schema(
    {
        purchaseNumber: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            index: true
        },

        // Supplier who provided the goods
        supplierId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Supplier",
            required: true,
            index: true
        },

        // Warehouse receiving the goods
        warehouseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Warehouse",
            required: true,
            index: true
        },

        items: {
            type: [purchaseItemSchema],
            required: true,
            validate: {
                validator: (v) => Array.isArray(v) && v.length > 0,
                message: "Purchase must have at least one item"
            }
        },

        totalCost: {
            type: Number,
            min: 0,
            default: 0
        },

        status: {
            type: String,
            enum: [
                "DRAFT",
                "ORDERED",
                "PARTIALLY_RECEIVED",
                "RECEIVED",
                "CANCELLED"
            ],
            default: "DRAFT",
            index: true
        },

        // The admin/employee who created this purchase order
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        // Who physically received the goods
        receivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        expectedDate: {
            type: Date
        },

        receivedAt: {
            type: Date
        },

        invoiceNumber: {
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

// Auto-calculate totalCost from items before save
purchaseSchema.pre("save", function (next) {
    if (this.items && this.items.length > 0) {
        this.totalCost = this.items.reduce((sum, item) => {
            item.totalCost = item.quantity * item.unitCost;
            return sum + item.totalCost;
        }, 0);
    }
    next();
});

purchaseSchema.index({ supplierId: 1 });
purchaseSchema.index({ warehouseId: 1 });
purchaseSchema.index({ status: 1 });
purchaseSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Purchase", purchaseSchema);
