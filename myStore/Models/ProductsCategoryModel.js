const mongoose = require('mongoose');
const { Schema } = mongoose;
const ProductsCategory = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }]
});
module.exports = mongoose.model('ProductsCategory', ProductsCategory);

