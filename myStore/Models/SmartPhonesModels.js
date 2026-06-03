const mongoose = require('mongoose');
const { Schema } = mongoose;

const toSlug = (value) =>
    String(value || "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const MobileSchema = new Schema({
    name: String,
    slug: { type: String, trim: true, unique: true, sparse: true, index: true },
    price: Number,
    brand: String,
    model: String,
    color: String,
    ram: Number,
    storage: Number,
    battery: String,
    camera: Number,
    processor: String,
    display: String,
    operatingSystem: String,
    releaseDate: String,
    category: String,
    description: String,
    image: String,
    charging: String,
    stock: Number,
}, {
    timestamps: true
});

// ⚡ Fast filters & sorting
MobileSchema.index({ createdAt: -1 });
MobileSchema.index({ brand: 1, createdAt: -1 });
MobileSchema.index({ price: 1 });
MobileSchema.index({ name: 1 });
MobileSchema.index({ slug: 1 });
MobileSchema.index({ category: 1 });

// 🔍 Text search
MobileSchema.index({
    name: "text",
    brand: "text",
    model: "text",
    description: "text"
});

MobileSchema.pre("validate", function preValidate(next) {
    if (!this.slug && this.name) {
        this.slug = toSlug(`${this.name}-${this.model || ""}`);
    }
    next();
});

module.exports = mongoose.model('Mobile', MobileSchema);
