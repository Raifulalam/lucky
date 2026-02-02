const mongoose = require("mongoose");
const { Schema } = mongoose;

const productSchema = new Schema(
    {
        images: {
            type: [String],
            default: [],
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        model: {
            type: String,
            required: true,
            trim: true,
        },

        brand: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        capacity: {
            type: String,
            trim: true,
        },

        mrp: {
            type: Number,
            min: 0,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        stock: {
            type: Number,
            default: 0,
            min: 0,
        },

        keywords: {
            type: [String],
            default: [],
        },
    },
    {
        timestamps: true, // 🔥 createdAt & updatedAt
        versionKey: false,
    }
);

/* ===================== INDEXES ===================== */

// 🔍 Text search (for /search API)
productSchema.index({
    name: "text",
    model: "text",
    brand: "text",
    description: "text",
    keywords: "text",
});

// ⚡ Fast filters & sorting
productSchema.index({ createdAt: -1 });
productSchema.index({ model: 1 });

module.exports = mongoose.model("Product", productSchema);
