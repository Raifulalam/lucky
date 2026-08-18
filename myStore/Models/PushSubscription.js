const mongoose = require("mongoose");

const pushSubscriptionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        role: {
            type: String,
            enum: ["admin", "user", "employee"],
            default: "user",
            index: true,
        },
        endpoint: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
        },
        keys: {
            p256dh: { type: String, required: true, trim: true },
            auth: { type: String, required: true, trim: true },
        },
        userAgent: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
);

pushSubscriptionSchema.index({ role: 1, createdAt: -1 });

module.exports =
    mongoose.models.PushSubscription ||
    mongoose.model("PushSubscription", pushSubscriptionSchema);
