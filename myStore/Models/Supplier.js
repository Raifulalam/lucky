const mongoose = require("mongoose");
const { Schema } = mongoose;

const bankDetailsSchema = new Schema(
    {
        bankName: { type: String, trim: true },
        accountNumber: { type: String, trim: true },
        branch: { type: String, trim: true }
    },
    { _id: false }
);

const supplierSchema = new Schema(
    {
        supplierCode: {
            type: String,
            unique: true,
            sparse: true,
            uppercase: true,
            trim: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        contactPerson: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            index: true
        },
        phone: {
            type: String,
            trim: true
        },
        alternatePhone: {
            type: String,
            trim: true
        },
        address: {
            type: String,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        country: {
            type: String,
            trim: true,
            default: "Nepal"
        },
        taxNumber: {
            type: String,
            trim: true
        },
        bankDetails: {
            type: bankDetailsSchema,
            default: () => ({})
        },
        status: {
            type: String,
            enum: ["ACTIVE", "INACTIVE", "BLACKLISTED"],
            default: "ACTIVE",
            index: true
        },
        notes: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Auto-generate supplier code before first save
supplierSchema.pre("validate", function (next) {
    if (!this.supplierCode) {
        const suffix = `${Date.now()}`.slice(-6);
        this.supplierCode = `SUP-${suffix}`;
    }
    next();
});

supplierSchema.index({ name: 1 });
supplierSchema.index({ status: 1 });
supplierSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Supplier", supplierSchema);
