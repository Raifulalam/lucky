const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminNotificationSchema = new Schema(
    {
        type: {
            type: String,
            enum: [
                "STOCK_ADJUSTMENT_REMINDER",
                "ORDER_COMPLETED",
                "ORDER_CREATED",
                "LOW_STOCK_ALERT",
                "OUT_OF_STOCK_ALERT",
                "GENERAL"
            ],
            default: "GENERAL",
            index: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        message: {
            type: String,
            required: true,
            trim: true
        },
        orderId: {
            type: Schema.Types.ObjectId,
            ref: "Order",
            index: true
        },
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: "Product"
                },
                name: { type: String, trim: true },
                quantity: { type: Number, default: 1 },
                currentStock: { type: Number, default: 0 }
            }
        ],
        status: {
            type: String,
            enum: ["PENDING", "REVIEWED", "RESOLVED"],
            default: "PENDING",
            index: true
        },
        isRead: {
            type: Boolean,
            default: false,
            index: true
        },
        metadata: {
            type: Schema.Types.Mixed
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

adminNotificationSchema.index({ createdAt: -1 });

module.exports =
    mongoose.models.AdminNotification ||
    mongoose.model("AdminNotification", adminNotificationSchema);
