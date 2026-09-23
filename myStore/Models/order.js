const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderItemSchema = new Schema(
    {
        // Canonical reference to Product
        productId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product' 
        },
        // Kept for backward compatibility with existing frontends and records
        itemId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Product' 
        },
        warehouseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Warehouse'
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String },
    },
    { _id: true }
);

// Define the order schema
const Orderschema = new Schema(
    {
        items: [orderItemSchema],
        user: {
            name: { type: String, required: true },
            email: { type: String, required: true },
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }  // FIXED: was 'users'
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
        status: { 
            type: String, 
            enum: ['pending', 'confirmed', 'processing', 'completed', 'delivered', 'cancelled'],
            default: 'pending' 
        },
    },
    { timestamps: true }
);

// Pre-validate hook to sync productId and itemId
Orderschema.pre('validate', function(next) {
    if (this.items && Array.isArray(this.items)) {
        for (const item of this.items) {
            if (!item.productId && item.itemId) {
                item.productId = item.itemId;
            } else if (!item.itemId && item.productId) {
                item.itemId = item.productId;
            }
        }
    }
    next();
});

// Indexes for fast querying & sorting
Orderschema.index({ "user.userId": 1, createdAt: -1 });
Orderschema.index({ createdAt: -1 });
Orderschema.index({ status: 1 });

// Create the Order model
const Order = mongoose.model('Order', Orderschema);

module.exports = Order;

