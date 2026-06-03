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
        user: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true }
        },

        totalPrice: { type: Number, required: true },
        tax: { type: Number, required: true },
        deliveryDate: { type: String, required: true },
        name: { type: String, required: true },
        address: { type: String, required: true },
        phone: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        deliveryInstructions: { type: String },
        additionalPhone: { type: String },
        status: { type: String, default: 'pending' },

    },
    { timestamps: true }
);

// Indexes for fast querying & sorting
Orderschema.index({ "user.userId": 1, createdAt: -1 });
Orderschema.index({ createdAt: -1 });
Orderschema.index({ status: 1 });

// Create the Order model
const Order = mongoose.model('Order', Orderschema);

module.exports = Order;

