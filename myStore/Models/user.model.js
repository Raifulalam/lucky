// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    // role: differentiate between admin, employee, and customer
    role: {
        type: String,
        enum: ["user", "admin", "employee"],
        default: "user"
    },

    phone: { type: String },
    address: { type: String },

    avatar: { type: String, default: "default-avatar.png" },

    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
