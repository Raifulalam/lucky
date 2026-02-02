const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Models/user.model");
const auth = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");

/* ===================== VALIDATION HANDLER ===================== */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    next();
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
router.put("/me", auth, async (req, res) => {
    try {
        const allowed = (({ name, phone, address, avatar }) => ({
            name,
            phone,
            address,
            avatar,
        }))(req.body);

        const user = await User.findByIdAndUpdate(
            req.user.id,
            allowed,
            { new: true }
        ).select("-password");

        res.json(user);
    } catch {
        res.status(500).json({ message: "Update failed" });
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
