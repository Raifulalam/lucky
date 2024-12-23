const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: {
        type: String,
        required: true,
        match: [/^\+?(\d{1,4})?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/, 'Please enter a valid phone number']
    },
    province: { type: String, required: true },
    district: { type: String, required: true },
    product: { type: String, required: true },
    model: { type: String, required: true },
    warranty: { type: String, required: true },
    issue: { type: String, required: true },
    image: { type: String },
    complaintdate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'resolved', 'in progress'],
        default: 'pending'
    },
    response: {
        type: String,
        default: 'No response yet.'
    }
});

module.exports = mongoose.model('Complaint', complaintSchema);
