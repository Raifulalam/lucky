const mongoose = require('mongoose');
const { Schema } = mongoose;

const MobileSchema = new Schema({
    name: String,
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

// 🔍 Text search
MobileSchema.index({
    name: "text",
    brand: "text",
    model: "text",
    description: "text"
});

module.exports = mongoose.model('Mobile', MobileSchema);