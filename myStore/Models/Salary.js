const mongoose = require("mongoose");

const lineItemSchema = new mongoose.Schema(
    {
        label: { type: String, required: true, trim: true },
        amount: { type: Number, required: true, min: 0 },
    },
    { _id: false }
);

const salarySchema = new mongoose.Schema(
    {
        employeeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
            index: true,
        },
        month: { type: Number, required: true, min: 1, max: 12, index: true },
        year: { type: Number, required: true, min: 2000, index: true },
        basicSalary: { type: Number, required: true, min: 0 },
        hra: { type: Number, default: 0, min: 0 },
        allowances: { type: [lineItemSchema], default: [] },
        bonuses: { type: [lineItemSchema], default: [] },
        deductions: { type: [lineItemSchema], default: [] },
        overtimePay: { type: Number, default: 0, min: 0 },
        grossSalary: { type: Number, required: true, min: 0 },
        totalDeductions: { type: Number, required: true, min: 0 },
        netSalary: { type: Number, required: true, min: 0 },
        status: {
            type: String,
            enum: ["draft", "processed", "paid"],
            default: "processed",
            index: true,
        },
        paidDate: { type: Date },
        paidVia: { type: String, trim: true },
        transactionReference: { type: String, trim: true },
        notes: { type: String, trim: true },
        payslipNumber: { type: String, unique: true, sparse: true },
        generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    },
    { timestamps: true }
);

salarySchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

salarySchema.pre("validate", function preValidate(next) {
    if (!this.payslipNumber) {
        this.payslipNumber = `PAY-${this.year}-${String(this.month).padStart(2, "0")}-${String(this.employeeId).slice(-5).toUpperCase()}`;
    }
    next();
});

module.exports = mongoose.models.Salary || mongoose.model("Salary", salarySchema);
