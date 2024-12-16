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
        address: { type: String, required: true },

    },
    { timestamps: true }
);

// Create the Order model
const Order = mongoose.model('Order', Orderschema);

module.exports = Order;
