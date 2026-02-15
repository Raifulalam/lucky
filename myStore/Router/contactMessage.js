const express = require("express");
const router = express.Router();
const ContactMessage = require("../Models/contactMessage");
const authenticateToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const { body, validationResult } = require("express-validator");

/**
 * POST: Submit Contact Message (PUBLIC)
 */
router.post(
    "/contact",
    [
        body("name").trim().isLength({ min: 2 }).withMessage("Name is required"),
        body("email").isEmail().withMessage("Valid email required"),
        body("message")
            .trim()
            .isLength({ min: 5 })
            .withMessage("Message must be at least 5 characters"),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {
            const { name, email, message } = req.body;

            const newMessage = new ContactMessage({
                name,
                email,
                message,
            });

            await newMessage.save();

            res.status(201).json({
                success: true,
                message: "Message sent successfully",
            });
        } catch (error) {
            console.error("Contact Message Error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

/**
 * GET: All Contact Messages (ADMIN)
 */
router.get(
    "/contact",
    authenticateToken,
    isAdmin,
    async (req, res) => {
        try {
            const messages = await ContactMessage.find().sort({
                createdAt: -1,
            });

            res.json(messages);
        } catch (error) {
            console.error("Fetch Messages Error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

/**
 * DELETE: Contact Message (ADMIN)
 */
router.delete(
    "/contact/:id",
    authenticateToken,
    isAdmin,
    async (req, res) => {
        try {
            const deleted = await ContactMessage.findByIdAndDelete(req.params.id);

            if (!deleted) {
                return res.status(404).json({ message: "Message not found" });
            }

            res.json({ message: "Message deleted successfully" });
        } catch (error) {
            console.error("Delete Message Error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

module.exports = router;
