const mongoose = require('mongoose');
const { Schema } = mongoose;

const ProductsCategorySchema = new Schema(
    {
        name: { type: String, required: true, unique: true, trim: true, index: true },
        description: { type: String, trim: true }
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Derive products virtually from Product.categoryId — avoids dual-source sync issues
ProductsCategorySchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'categoryId'
});

ProductsCategorySchema.index({ createdAt: -1 });

module.exports = mongoose.model('ProductsCategory', ProductsCategorySchema);

