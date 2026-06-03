const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema(
    {
        name: String,
        address: String,
        phone: String,
        province: String,
        district: String,
        product: String,
        model: String,
        warranty: String,
        issue: String,
        image: String,
        status: {
            type: String,
            enum: ["pending", "in-progress", "resolved"],
            default: "pending",
            index: true,
        },
    },
    { timestamps: true }
);

ComplaintSchema.index({ createdAt: -1 });
ComplaintSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Complaint", ComplaintSchema);
