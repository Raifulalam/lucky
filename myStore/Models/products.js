const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    id: String,
    image: String,
    name: String,
    link: String,
    details: String,
    rating: {
        stars: Number,
        count: Number
    },
    mrp: Number,
    price: Number,
    keywords: [String]
});
const Product = mongoose.model('Product', productSchema);
module.exports = Product;