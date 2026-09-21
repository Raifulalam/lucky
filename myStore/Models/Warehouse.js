const mongoose = require("mongoose");
const { Schema } = mongoose;

const warehouseSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        address: {
            type: String,
            trim: true
        },
        manager: {
            type: String,
            trim: true
        },
        phone: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Indexes
warehouseSchema.index({ code: 1 }, { unique: true });
warehouseSchema.index({ name: 1 });
warehouseSchema.index({ isActive: 1 });

module.exports = mongoose.model("Warehouse", warehouseSchema);
