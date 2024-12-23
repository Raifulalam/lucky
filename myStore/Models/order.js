const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the order schema
const Orderschema = new Schema(
    {
        items: [
            {
                itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
                image: { type: String },
            },
        ],

        totalPrice: { type: Number, required: true },
        tax: { type: Number, required: true },
        deliveryDate: { type: String, required: true },
        name: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
        postalCode: { type: String, required: true },  // Added postal code
        country: { type: String, required: true },     // Added country
        deliveryInstructions: { type: String },       // Optional delivery instructions
        additionalPhone: { type: String },             // Optional additional phone number
        status: { type: String, default: 'pending' },

    },
    { timestamps: true }
);

// Create the Order model
const Order = mongoose.model('Order', Orderschema);

module.exports = Order;
