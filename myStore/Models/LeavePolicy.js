const mongoose = require("mongoose");

const leavePolicySchema = new mongoose.Schema(
    {
        leaveType: {
            type: String,
            enum: ["annual", "sick", "casual", "unpaid"],
            required: true,
            unique: true,
        },
        annualAllocation: { type: Number, default: 0, min: 0 },
        maxConsecutiveDays: { type: Number, default: 30, min: 1 },
        carryForward: { type: Boolean, default: false },
        requiresApproval: { type: Boolean, default: true },
        description: { type: String, trim: true },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.models.LeavePolicy || mongoose.model("LeavePolicy", leavePolicySchema);
