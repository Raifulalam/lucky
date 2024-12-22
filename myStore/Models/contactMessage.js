const mongoose = require('mongoose');
const { Schema } = mongoose;

const ContactMessage = new Schema({
    name: String,
    email: String,
    message: String,
    timestamp: { type: Date, default: Date.now } // Corrected timestamp definition
});

module.exports = mongoose.model('ContactMessage', ContactMessage);
