const express = require("express");
const router = express.Router();
const EmiApplication = require("../Models/EmiApplication");
const authenticateToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const { sendWhatsAppMessage } = require("../utils/whatsappService");

/**
 * Generate a unique application reference number
 * e.g. EMI-2610-8492
 */
function generateAppNumber() {
    const yearMonth = new Date().toISOString().slice(2, 7).replace("-", "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `EMI-${yearMonth}-${randomSuffix}`;
}

/**
 * POST /api/emi/apply
 * Public endpoint to submit EMI application with applicant, guarantor and document metadata
 */
router.post("/apply", async (req, res) => {
    try {
        const { applicant, guarantor, productDetails, documents } = req.body;

        if (!applicant?.name || !applicant?.phone) {
            return res.status(400).json({
                success: false,
                message: "Applicant full name and mobile number are required.",
            });
        }

        if (!guarantor?.name || !guarantor?.phone) {
            return res.status(400).json({
                success: false,
                message: "Guarantor full name and mobile number are required.",
            });
        }

        const applicationNo = generateAppNumber();

        const application = new EmiApplication({
            applicationNo,
            applicant: {
                name: applicant.name.trim(),
                phone: applicant.phone.trim(),
                email: applicant.email?.trim() || "",
                currentAddress: applicant.currentAddress?.trim() || applicant.address?.trim() || "Birgunj, Nepal",
                permanentAddress: applicant.permanentAddress?.trim() || "",
                occupation: applicant.occupation?.trim() || "Not specified",
                monthlyIncome: applicant.monthlyIncome?.trim() || "",
            },
            guarantor: {
                name: guarantor.name.trim(),
                phone: guarantor.phone.trim(),
                relationship: guarantor.relationship?.trim() || "Relative",
                address: guarantor.address?.trim() || "",
                occupation: guarantor.occupation?.trim() || "",
            },
            productDetails: {
                productId: productDetails?.productId || "",
                name: productDetails?.name || "Appliance / Electronics",
                brand: productDetails?.brand || "",
                model: productDetails?.model || "",
                price: Number(productDetails?.price) || 0,
                downPayment: Number(productDetails?.downPayment) || 0,
                loanAmount: Number(productDetails?.loanAmount) || 0,
                tenureMonths: Number(productDetails?.tenureMonths) || 12,
                interestRate: Number(productDetails?.interestRate) || 12,
                estimatedMonthlyEmi: Number(productDetails?.estimatedMonthlyEmi) || 0,
                partnerBank: productDetails?.partnerBank || "Lucky Impex Direct EMI",
            },
            documents: {
                applicantPhoto: documents?.applicantPhoto || "",
                applicantCitizenshipFront: documents?.applicantCitizenshipFront || "",
                applicantCitizenshipBack: documents?.applicantCitizenshipBack || "",
                applicantIncomeProof: documents?.applicantIncomeProof || "",
                guarantorPhoto: documents?.guarantorPhoto || "",
                guarantorCitizenshipFront: documents?.guarantorCitizenshipFront || "",
                guarantorCitizenshipBack: documents?.guarantorCitizenshipBack || "",
            },
            status: "pending",
        });

        await application.save();

        // 📱 Notify Store Admin via WhatsApp
        const adminPhone = process.env.WHATSAPP_ADMIN_PHONE || "9779802594022";
        const docsSubmitted = [];
        if (documents?.applicantPhoto) docsSubmitted.push("Applicant Photo");
        if (documents?.applicantCitizenshipFront) docsSubmitted.push("Applicant Citizenship");
        if (documents?.guarantorPhoto) docsSubmitted.push("Guarantor Photo");
        if (documents?.guarantorCitizenshipFront) docsSubmitted.push("Guarantor Citizenship");

        const waText = `📑 *NEW EMI FINANCING APPLICATION!* (#${applicationNo})
━━━━━━━━━━━━━━━━━━━━━
👤 *Applicant:* ${applicant.name}
📞 *Phone:* ${applicant.phone}
📍 *Address:* ${applicant.currentAddress || "N/A"}
💼 *Occupation:* ${applicant.occupation || "N/A"} (Income: ${applicant.monthlyIncome || "N/A"})

🤝 *Guarantor (Jamani):* ${guarantor.name} (${guarantor.relationship || "Guarantor"})
📞 *Guarantor Phone:* ${guarantor.phone}

📦 *Product:* ${productDetails?.name || "Selected Item"}
💰 *Price:* Rs. ${(productDetails?.price || 0).toLocaleString()}
💳 *Down Payment:* Rs. ${(productDetails?.downPayment || 0).toLocaleString()}
📊 *Loan Amount:* Rs. ${(productDetails?.loanAmount || 0).toLocaleString()} (${productDetails?.tenureMonths || 12} Mos @ Rs. ${(productDetails?.estimatedMonthlyEmi || 0).toLocaleString()}/mo)
🏦 *Partner:* ${productDetails?.partnerBank || "Lucky Impex Direct"}

📂 *Documents Attached:* ${docsSubmitted.length > 0 ? docsSubmitted.join(", ") : "Pending verification"}
━━━━━━━━━━━━━━━━━━━━━
_Please contact customer at ${applicant.phone} to complete verification._`;

        sendWhatsAppMessage({ to: adminPhone, message: waText }).catch((err) => {
            console.warn("WhatsApp EMI dispatch error:", err.message);
        });

        res.status(201).json({
            success: true,
            message: "EMI application submitted successfully! Our team will contact you within 24 hours.",
            applicationNo,
            data: {
                applicationNo,
                applicantName: applicant.name,
                phone: applicant.phone,
            },
        });
    } catch (err) {
        console.error("EMI Application Error:", err);
        res.status(500).json({
            success: false,
            message: "Server error processing application. Please try again or contact via WhatsApp.",
        });
    }
});

/**
 * GET /api/emi
 * Admin only: list all applications
 */
router.get("/", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const query = {};
        if (status) query.status = status;

        const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
        const [applications, total] = await Promise.all([
            EmiApplication.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit, 10)).lean(),
            EmiApplication.countDocuments(query),
        ]);

        res.json({
            success: true,
            total,
            page: parseInt(page, 10),
            pages: Math.ceil(total / parseInt(limit, 10)),
            applications,
        });
    } catch (err) {
        console.error("Fetch EMI Applications Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

/**
 * GET /api/emi/:id
 * Admin only: get application details
 */
router.get("/:id", authenticateToken, isAdmin, async (req, res) => {
    try {
        const app = await EmiApplication.findById(req.params.id).lean();
        if (!app) return res.status(404).json({ success: false, message: "Application not found" });
        res.json({ success: true, application: app });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

/**
 * PATCH /api/emi/:id/status
 * Admin only: update status & notes
 */
router.patch("/:id/status", authenticateToken, isAdmin, async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const app = await EmiApplication.findByIdAndUpdate(
            req.params.id,
            { status, ...(adminNotes ? { adminNotes } : {}) },
            { new: true }
        );
        if (!app) return res.status(404).json({ success: false, message: "Application not found" });
        res.json({ success: true, application: app });
    } catch (err) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
