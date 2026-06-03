const mongoose = require("mongoose");
const { Schema } = mongoose;

const toSlug = (value) =>
    String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

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
            index: true,
        },

        slug: {
            type: String,
            trim: true,
            index: true,
            unique: true,
            sparse: true,
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
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ name: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ brand: 1, createdAt: -1 });

productSchema.pre("validate", function preValidate(next) {
    if (!this.slug && this.name) {
        this.slug = toSlug(`${this.name}-${this.model || ""}`);
    }
    next();
});

module.exports = mongoose.model("Product", productSchema);
