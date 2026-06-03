const mongoose = require('mongoose');
const { Schema } = mongoose;
const ProductsCategory = new Schema({
    name: { type: String, required: true, unique: true, trim: true, index: true },
    description: { type: String, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

ProductsCategory.index({ createdAt: -1 });

module.exports = mongoose.model('ProductsCategory', ProductsCategory);

