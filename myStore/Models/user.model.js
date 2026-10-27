// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: { type: String, required: true },

        role: {
            type: String,
            enum: ["user", "admin", "employee"],
            default: "user",
        },

        phone: { type: String },
        address: { type: String },

        avatar: { type: String, default: "default-avatar.png" },

        // Password reset: only a SHA-256 hash of the emailed token is stored, never the token itself.
        resetPasswordHash: { type: String, select: false },
        resetPasswordExpires: { type: Date, select: false },
    },
    { timestamps: true }
);

UserSchema.index({ role: 1, createdAt: -1 });
UserSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", UserSchema);
