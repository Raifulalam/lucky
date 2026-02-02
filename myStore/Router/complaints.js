const express = require("express");
const router = express.Router();
const Complaint = require("../Models/complaintsSchema");
const authenticateToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const upload = require("../middlewares/uploadComplaints");
const cloudinary = require("../utils/cloudinary");
const streamifier = require("streamifier");
const { body, validationResult } = require("express-validator");

/**
 * SUBMIT COMPLAINT (PUBLIC / USER)
 */
router.post(
    "/complaints",
    upload.single("image"),
    [
        body("name").notEmpty(),
        body("phone").notEmpty(),
        body("product").notEmpty(),
        body("issue").notEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        try {
            if (!req.file) {
                return res.status(400).json({ message: "Image is required" });
            }

            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "complaints" },
                async (error, result) => {
                    if (error) {
                        return res.status(500).json({ message: "Image upload failed" });
                    }

                    const complaint = new Complaint({
                        ...req.body,
                        image: result.secure_url,
                        status: "pending",
                    });

                    await complaint.save();

                    res.status(201).json({
                        success: true,
                        message: "Complaint submitted successfully",
                    });
                }
            );

            streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
        } catch (error) {
            console.error("Complaint Error:", error);
            res.status(500).json({ message: "Server error" });
        }
    }
);

/**
 * GET ALL COMPLAINTS (ADMIN)
 */
router.get(
    "/complaints",
    authenticateToken,
    isAdmin,
    async (req, res) => {
        try {
            const complaints = await Complaint.find().sort({ createdAt: -1 });
            res.json(complaints);
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }
);

/**
 * UPDATE COMPLAINT STATUS (ADMIN)
 */
router.put(
    "/complaints/:id",
    authenticateToken,
    isAdmin,
    async (req, res) => {
        try {
            const updated = await Complaint.findByIdAndUpdate(
                req.params.id,
                { status: req.body.status },
                { new: true }
            );

            if (!updated) {
                return res.status(404).json({ message: "Complaint not found" });
            }

            res.json(updated);
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }
);

/**
 * DELETE COMPLAINT (ADMIN)
 */
router.delete(
    "/complaints/:id",
    authenticateToken,
    isAdmin,
    async (req, res) => {
        try {
            const deleted = await Complaint.findByIdAndDelete(req.params.id);
            if (!deleted) {
                return res.status(404).json({ message: "Complaint not found" });
            }
            res.json({ message: "Complaint deleted successfully" });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }
);

module.exports = router;
