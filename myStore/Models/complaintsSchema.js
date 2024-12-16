const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    phone: { type: String, required: true },
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
    }
});

module.exports = mongoose.model('Complaint', complaintSchema);
