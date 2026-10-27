const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/user.model");
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const uploadUserAvatar = require("../middlewares/uploadUserAvatar");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit");
const { sendWhatsAppMessage } = require("../utils/whatsappService");

const getSessionCookieOptions = () => ({
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
});

/* ===================== VALIDATION HANDLER ===================== */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
};

const deleteCloudinaryImage = async (publicId) => {
    if (!publicId) return;
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary cleanup failed:", error);
    }
};

/* ===========================================================
   REGISTER USER
   =========================================================== */
router.post(
    "/register",
    [
        body("name").isLength({ min: 3 }),
        body("email").isEmail(),
        body("password")
            .isLength({ min: 8 })
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
    ],
    validate,
    async (req, res) => {
        try {
            const { name, email, password } = req.body;

            const exists = await User.findOne({ email });
            if (exists) {
                return res.status(400).json({ message: "Email already registered" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                role: "user",
            });

            res.status(201).json({
                id: user._id,
                name: user.name,
                email: user.email,
            });
        } catch {
            res.status(500).json({ message: "Registration failed" });
        }
    }
);

/* ===========================================================
   LOGIN USER
   =========================================================== */
router.post(
    "/login",
    [
        body("email").isEmail(),
        body("password").exists(),
    ],
    validate,
    async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const token = jwt.sign(
                {
                    id: user._id,
                    name: user.name,   // ✅ ADD THIS
                    email: user.email,
                    role: user.role,
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );
            res.json({
                success: true,
                authToken: token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            });

        } catch {
            res.status(500).json({ message: "Login failed" });
        }
    }
);

/* ===========================================================
   FORGOT / RESET PASSWORD
   - The reply to /forgot-password is always the same, so it cannot be used to discover
     which emails have accounts.
   - The link is delivered by email (when SMTP_* is configured) and/or WhatsApp to the phone
     number saved on the account. The link is never logged or returned in the response.
   =========================================================== */
const RESET_TTL_MS = 30 * 60 * 1000;
const GENERIC_FORGOT_REPLY = {
    message: "If an account exists for that email, a password reset link has been sent. It is valid for 30 minutes.",
};

const resetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts. Please try again in 15 minutes." },
});

const hashResetToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

const frontendUrl = () =>
    (process.env.FRONTEND_URL || "https://luckyimpex4u.com").replace(/\/+$/, "");

async function sendResetEmail(to, link) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) return false;
    let nodemailer;
    try {
        nodemailer = require("nodemailer");
    } catch {
        console.warn("[password reset] SMTP is configured but the 'nodemailer' package is not installed.");
        return false;
    }
    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transport.sendMail({
        from: process.env.SMTP_FROM || `Lucky Impex <${process.env.SMTP_USER}>`,
        to,
        subject: "Reset your Lucky Impex password",
        text: `We received a request to reset your Lucky Impex password.\n\nOpen this link within 30 minutes:\n${link}\n\nIf you did not ask for this, you can ignore this message.`,
    });
    return true;
}

router.post(
    "/forgot-password",
    resetLimiter,
    [body("email").isEmail().normalizeEmail()],
    validate,
    async (req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (user) {
                const token = crypto.randomBytes(32).toString("hex");
                user.resetPasswordHash = hashResetToken(token);
                user.resetPasswordExpires = new Date(Date.now() + RESET_TTL_MS);
                await user.save();

                const link = `${frontendUrl()}/reset-password/${token}`;
                const results = await Promise.allSettled([
                    sendResetEmail(user.email, link),
                    user.phone
                        ? sendWhatsAppMessage({
                              to: user.phone,
                              message: `Lucky Impex: use this link to reset your password (valid 30 minutes): ${link}\nIf you did not ask for this, ignore this message.`,
                          })
                        : Promise.resolve(false),
                ]);
                const delivered = results.some((r) => r.status === "fulfilled" && r.value && r.value.success !== false);
                if (!delivered) {
                    console.warn("[password reset] No delivery channel worked (configure SMTP_* or save a phone number on the account).");
                }
            }
        } catch (error) {
            console.error("[password reset] forgot-password failed:", error.message);
        }
        // Same answer whether or not the account exists or delivery worked.
        res.json(GENERIC_FORGOT_REPLY);
    }
);

router.post(
    "/reset-password",
    resetLimiter,
    [
        body("token").isString().isLength({ min: 64, max: 64 }).isHexadecimal(),
        body("password")
            .isLength({ min: 8 })
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
    ],
    validate,
    async (req, res) => {
        try {
            const user = await User.findOne({
                resetPasswordHash: hashResetToken(req.body.token),
                resetPasswordExpires: { $gt: new Date() },
            }).select("+resetPasswordHash +resetPasswordExpires");

            if (!user) {
                return res.status(400).json({ message: "This reset link is invalid or has expired. Please request a new one." });
            }

            user.password = await bcrypt.hash(req.body.password, 10);
            user.resetPasswordHash = undefined; // single use
            user.resetPasswordExpires = undefined;
            await user.save();

            res.json({ message: "Your password has been updated. You can now log in." });
        } catch (error) {
            console.error("[password reset] reset-password failed:", error.message);
            res.status(500).json({ message: "Could not reset the password. Please try again." });
        }
    }
);

router.post("/session", (req, res) => {
    const { token, rememberSession } = req.body || {};

    if (!token) {
        res.clearCookie("authToken", getSessionCookieOptions());
        return res.json({ success: true, message: "Session cleared." });
    }

    if (rememberSession) {
        res.cookie("authToken", token, getSessionCookieOptions());
    } else {
        res.clearCookie("authToken", getSessionCookieOptions());
    }

    return res.json({ success: true, message: "Session updated." });
});

router.post("/logout", (req, res) => {
    res.clearCookie("authToken", getSessionCookieOptions());
    res.json({ success: true, message: "Logged out successfully." });
});

/* ===========================================================
   GET LOGGED-IN USER PROFILE
   =========================================================== */
router.get("/me", auth, async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
});

/* ===========================================================
   UPDATE LOGGED-IN USER PROFILE
   =========================================================== */
router.put("/me", auth, uploadUserAvatar.single("avatar"), async (req, res) => {
    let uploadedAvatarResult = null;

    try {
        const updateData = (({ name, phone, address }) => ({
            name,
            phone,
            address,
        }))(req.body);

        if (req.file) {
            uploadedAvatarResult = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { folder: "users/avatars" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result || null);
                    }
                );

                streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
            });

            updateData.avatar = uploadedAvatarResult.secure_url;
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true, runValidators: true }
        ).select("-password");

        res.json(user);
    } catch (error) {
        await deleteCloudinaryImage(uploadedAvatarResult?.public_id);
        res.status(500).json({ message: error.message || "Update failed" });
    }
});

/* ===========================================================
   ADMIN: GET ALL USERS
   =========================================================== */
router.get("/users", auth, isAdmin, async (req, res) => {
    const users = await User.find().select("-password");
    res.json(users);
});

/* ===========================================================
   ADMIN: DELETE USER
   =========================================================== */
router.delete("/users/:id", auth, isAdmin, async (req, res) => {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
});

/* ===========================================================
   ADMIN: UPDATE USER (ROLE SAFE)
   =========================================================== */
router.put("/users/:id", auth, isAdmin, async (req, res) => {
    const allowed = (({ name, email, role }) => ({
        name,
        email,
        role,
    }))(req.body);

    const user = await User.findByIdAndUpdate(
        req.params.id,
        allowed,
        { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
});

/* ===========================================================
   ADD USER INFO (AUTH REQUIRED)
   =========================================================== */
router.post("/userinfo", auth, async (req, res) => {
    const { phone, address } = req.body;

    if (!phone || !address) {
        return res.status(400).json({ message: "Phone & address required" });
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        {
            $push: { userinfo: { phone, address } },
        },
        { new: true }
    ).select("-password");

    res.json(user);
});

module.exports = router;
