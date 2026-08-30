
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            maxlength: 150,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        review: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 1000,
        },

        isApproved: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

reviewSchema.index({
    isApproved: 1,
    createdAt: -1,
});

module.exports = mongoose.model("Review", reviewSchema);
