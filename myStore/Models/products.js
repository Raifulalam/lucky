const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
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
    keywords: [String],
    category: String // You can optionally link categories here too
});

module.exports = mongoose.model('Product', productSchema);
