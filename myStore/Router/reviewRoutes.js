
const express = require("express");
const router = express.Router();

const Review = require("../Models/Review");

const authenticateToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");

const {
    body,
    validationResult,
} = require("express-validator");


/**
 * =========================================================
 * PUBLIC: SUBMIT REVIEW
 * POST /reviews
 * =========================================================
 */
router.post(
    "/",

    [
        body("name")
            .trim()
            .isLength({ min: 2, max: 100 })
            .withMessage("Name must be between 2 and 100 characters."),

        body("email")
            .trim()
            .isEmail()
            .withMessage("Please provide a valid email address."),

        body("rating")
            .isInt({ min: 1, max: 5 })
            .withMessage("Rating must be between 1 and 5."),

        body("review")
            .trim()
            .isLength({ min: 5, max: 1000 })
            .withMessage(
                "Review must be between 5 and 1000 characters."
            ),
    ],

    async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                success: false,
                errors: errors.array(),
            });
        }

        try {
            const {
                name,
                email,
                rating,
                review,
            } = req.body;

            const newReview = new Review({
                name,
                email,
                rating,
                review,

                // Reviews require admin approval
                isApproved: false,
            });

            await newReview.save();

            return res.status(201).json({
                success: true,
                message:
                    "Thank you! Your review has been submitted and is awaiting approval.",
            });

        } catch (error) {
            console.error(
                "Submit Review Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Server error.",
            });
        }
    }
);


/**
 * =========================================================
 * PUBLIC: GET APPROVED REVIEWS
 * GET /reviews
 * =========================================================
 */
router.get(
    "/",
    async (req, res) => {
        try {
            const reviews = await Review.find({
                isApproved: true,
            })
                .select(
                    "name rating review createdAt"
                )
                .sort({
                    createdAt: -1,
                })
                .lean();

            return res.json({
                success: true,
                reviews,
            });

        } catch (error) {
            console.error(
                "Fetch Public Reviews Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Server error.",
            });
        }
    }
);


/**
 * =========================================================
 * ADMIN: GET ALL REVIEWS
 * GET /reviews/admin
 * =========================================================
 */
router.get(
    "/admin",

    authenticateToken,
    isAdmin,

    async (req, res) => {
        try {
            const reviews = await Review.find()
                .sort({
                    createdAt: -1,
                })
                .lean();

            return res.json({
                success: true,
                reviews,
            });

        } catch (error) {
            console.error(
                "Fetch Admin Reviews Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Server error.",
            });
        }
    }
);


/**
 * =========================================================
 * ADMIN: APPROVE REVIEW
 * PUT /reviews/:id/approve
 * =========================================================
 */
router.put(
    "/:id/approve",

    authenticateToken,
    isAdmin,

    async (req, res) => {
        try {
            const review =
                await Review.findById(
                    req.params.id
                );

            if (!review) {
                return res.status(404).json({
                    success: false,
                    message: "Review not found.",
                });
            }

            review.isApproved = true;

            await review.save();

            return res.json({
                success: true,
                message:
                    "Review approved successfully.",
                review,
            });

        } catch (error) {
            console.error(
                "Approve Review Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Server error.",
            });
        }
    }
);


/**
 * =========================================================
 * ADMIN: DELETE REVIEW
 * DELETE /reviews/:id
 * =========================================================
 */
router.delete(
    "/:id",

    authenticateToken,
    isAdmin,

    async (req, res) => {
        try {
            const deletedReview =
                await Review.findByIdAndDelete(
                    req.params.id
                );

            if (!deletedReview) {
                return res.status(404).json({
                    success: false,
                    message: "Review not found.",
                });
            }

            return res.json({
                success: true,
                message:
                    "Review deleted successfully.",
            });

        } catch (error) {
            console.error(
                "Delete Review Error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Server error.",
            });
        }
    }
);


module.exports = router;

