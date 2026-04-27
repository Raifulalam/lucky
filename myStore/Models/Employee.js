const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema(
    {
        line1: { type: String, trim: true },
        line2: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true },
        country: { type: String, trim: true },
        postalCode: { type: String, trim: true },
    },
    { _id: false }
);

const emergencyContactSchema = new mongoose.Schema(
    {
        name: { type: String, trim: true },
        relationship: { type: String, trim: true },
        phone: { type: String, trim: true },
    },
    { _id: false }
);

const shiftSchema = new mongoose.Schema(
    {
        startTime: { type: String, default: "09:30" },
        endTime: { type: String, default: "18:30" },
    },
    { _id: false }
);

const salaryStructureSchema = new mongoose.Schema(
    {
        basic: { type: Number, default: 0 },
        hra: { type: Number, default: 0 },
        allowances: { type: Number, default: 0 },
        bonusEligibility: { type: Number, default: 0 },
        bankName: { type: String, trim: true },
        bankAccountNumber: { type: String, trim: true },
        taxId: { type: String, trim: true },
        providentFundNumber: { type: String, trim: true },
        monthlyGross: { type: Number, default: 0 },
    },
    { _id: false }
);

const leaveBalanceSchema = new mongoose.Schema(
    {
        annual: { type: Number, default: 18 },
        sick: { type: Number, default: 10 },
        casual: { type: Number, default: 7 },
        unpaid: { type: Number, default: 0 },
    },
    { _id: false }
);

const employeeSchema = new mongoose.Schema(
    {
        employeeCode: {
            type: String,
            unique: true,
            index: true,
            uppercase: true,
            trim: true,
        },
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: { type: String, required: true, minlength: 8 },
        phone: { type: String, trim: true },
        alternatePhone: { type: String, trim: true },
        role: {
            type: String,
            enum: ["employee", "manager", "admin"],
            default: "employee",
            index: true,
        },
        department: { type: String, trim: true, index: true },
        designation: { type: String, trim: true },
        salary: { type: Number, default: 0 },
        salaryStructure: { type: salaryStructureSchema, default: () => ({}) },
        joinDate: { type: Date, default: Date.now, index: true },
        dateOfBirth: { type: Date },
        gender: {
            type: String,
            enum: ["male", "female", "non_binary", "prefer_not_to_say"],
        },
        status: {
            type: String,
            enum: ["active", "inactive", "on_leave"],
            default: "active",
            index: true,
        },
        employmentType: {
            type: String,
            enum: ["full_time", "part_time", "contract", "intern"],
            default: "full_time",
        },
        workLocation: { type: String, trim: true, default: "Head Office" },
        manager: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
        shift: { type: shiftSchema, default: () => ({}) },
        address: { type: addressSchema, default: () => ({}) },
        emergencyContact: { type: emergencyContactSchema, default: () => ({}) },
        leaveBalance: { type: leaveBalanceSchema, default: () => ({}) },
        avatar: { type: String, trim: true },
        notes: { type: String, trim: true },
        lastLoginAt: { type: Date },
    },
    { timestamps: true }
);

employeeSchema.pre("validate", function preValidate(next) {
    if (!this.employeeCode) {
        const suffix = `${Date.now()}`.slice(-6);
        const random = Math.floor(Math.random() * 90 + 10);
        this.employeeCode = `EMP-${suffix}${random}`;
    }
    next();
});

employeeSchema.pre("save", async function preSave(next) {
    if (!this.isModified("password")) {
        return next();
    }

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

employeeSchema.methods.comparePassword = async function comparePassword(enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

employeeSchema.methods.toSafeObject = function toSafeObject() {
    const employee = this.toObject();
    delete employee.password;
    return employee;
};

module.exports = mongoose.models.Employee || mongoose.model("Employee", employeeSchema);
