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

})
module.exports = mongoose.model('Mobile', MobileSchema);