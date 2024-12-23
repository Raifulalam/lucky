const mongoose = require('mongoose');
const { Schema } = mongoose;

const productSchema = new Schema({
    image: String,
    name: String,
    description: String,
    modleNumber: String,
    rating: {
        stars: Number,
        count: Number
    },
    mrp: Number,
    price: Number,
    keywords: [String],
    category: String,
    capacity: String,
    brand: String,
});

module.exports = mongoose.model('Product', productSchema);
