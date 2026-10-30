const mongoose = require("mongoose");

const emiApplicationSchema = new mongoose.Schema(
    {
        applicationNo: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },
        applicant: {
            name: { type: String, required: true, trim: true },
            phone: { type: String, required: true, trim: true },
            email: { type: String, trim: true },
            currentAddress: { type: String, required: true, trim: true },
            permanentAddress: { type: String, trim: true },
            occupation: { type: String, trim: true },
            monthlyIncome: { type: String, trim: true },
        },
        guarantor: {
            name: { type: String, required: true, trim: true },
            phone: { type: String, required: true, trim: true },
            relationship: { type: String, required: true, trim: true },
            address: { type: String, trim: true },
            occupation: { type: String, trim: true },
        },
        productDetails: {
            productId: { type: String },
            name: { type: String, default: "Custom Loan / Appliance" },
            brand: { type: String },
            model: { type: String },
            price: { type: Number, default: 0 },
            downPayment: { type: Number, default: 0 },
            loanAmount: { type: Number, default: 0 },
            tenureMonths: { type: Number, default: 12 },
            interestRate: { type: Number, default: 12 },
            estimatedMonthlyEmi: { type: Number, default: 0 },
            partnerBank: { type: String, default: "Lucky Impex Direct EMI" },
        },
        documents: {
            applicantPhoto: { type: String },
            applicantCitizenshipFront: { type: String },
            applicantCitizenshipBack: { type: String },
            applicantIncomeProof: { type: String },
            guarantorPhoto: { type: String },
            guarantorCitizenshipFront: { type: String },
            guarantorCitizenshipBack: { type: String },
        },
        status: {
            type: String,
            enum: ["pending", "contacted", "in_review", "approved", "rejected", "completed"],
            default: "pending",
            index: true,
        },
        adminNotes: { type: String },
    },
    { timestamps: true }
);

module.exports = mongoose.model("EmiApplication", emiApplicationSchema);
