const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true,
        },
        date: { type: Date, required: true, index: true },
        checkIn: { type: Date },
        checkOut: { type: Date },
        status: {
            type: String,
            enum: ["present", "absent", "leave", "half_day", "weekend", "holiday"],
            default: "present",
            index: true,
        },
        lateMinutes: { type: Number, default: 0 },
        workMinutes: { type: Number, default: 0 },
        overtimeMinutes: { type: Number, default: 0 },
        source: {
            type: String,
            enum: ["manual", "auto", "self_service"],
            default: "self_service",
        },
        notes: { type: String, trim: true },
        markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    },
    { timestamps: true }
);

attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);
