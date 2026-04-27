const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true,
        },
        policyId: { type: mongoose.Schema.Types.ObjectId, ref: "LeavePolicy" },
        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        leaveType: {
            type: String,
            enum: ["annual", "sick", "casual", "unpaid"],
            required: true,
            index: true,
        },
        totalDays: { type: Number, required: true },
        reason: { type: String, trim: true },
        handoverNotes: { type: String, trim: true },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected", "cancelled"],
            default: "pending",
            index: true,
        },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
        reviewedAt: { type: Date },
        reviewedComment: { type: String, trim: true },
    },
    { timestamps: true }
);

module.exports = mongoose.models.Leave || mongoose.model("Leave", leaveSchema);
