const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true,
        },
        title: { type: String, required: true, trim: true },
        message: { type: String, required: true, trim: true },
        type: {
            type: String,
            enum: ["leave", "payroll", "attendance", "general"],
            default: "general",
        },
        link: { type: String, trim: true },
        metadata: { type: mongoose.Schema.Types.Mixed },
        isRead: { type: Boolean, default: false, index: true },
        readAt: { type: Date },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
