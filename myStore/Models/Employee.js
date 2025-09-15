const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const EmployeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },   // 🔑 password
    phone: { type: String },
    role: { type: String, enum: ["employee", "manager", "admin"], default: "employee" }, // ✅ fixed role
    department: { type: String },
    designation: { type: String },
    salary: { type: Number, default: 0 },
    joinDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
}, { timestamps: true });

// 🔐 Hash password before save
EmployeeSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password during login
EmployeeSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Employee", EmployeeSchema);
