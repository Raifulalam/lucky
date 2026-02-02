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
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Complaint", ComplaintSchema);
