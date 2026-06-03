const mongoose = require("mongoose");

const ContactMessageSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, lowercase: true, trim: true, index: true },
        message: { type: String, required: true, trim: true },
        isRead: { type: Boolean, default: false },
    },
    { timestamps: true }
);

ContactMessageSchema.index({ createdAt: -1 });
ContactMessageSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model("ContactMessage", ContactMessageSchema);
