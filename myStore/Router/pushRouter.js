const express = require("express");
const router = express.Router();
const PushSubscription = require("../Models/PushSubscription");
const authenticateToken = require("../middlewares/auth");
const isAdmin = require("../middlewares/isAdmin");
const { getVapidPublicKey, sendPushToAdmins, sendPushToUser } = require("../utils/pushService");

/**
 * GET /api/push/vapid-key
 * Returns the public VAPID key so frontend browsers can subscribe to push notifications
 */
router.get("/vapid-key", (req, res) => {
    const vapidPublicKey = getVapidPublicKey();
    res.json({
        success: true,
        vapidPublicKey,
    });
});

/**
 * POST /api/push/subscribe
 * Authenticated user or admin registers/updates their browser push subscription
 */
router.post("/subscribe", authenticateToken, async (req, res) => {
    try {
        const { subscription, userAgent } = req.body;

        if (!subscription || !subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
            return res.status(400).json({
                success: false,
                message: "Invalid push subscription object structure.",
            });
        }

        const userId = req.user.id;
        const role = req.user.role || "user";

        // Upsert push subscription based on endpoint
        const updatedSubscription = await PushSubscription.findOneAndUpdate(
            { endpoint: subscription.endpoint },
            {
                userId,
                role,
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                },
                userAgent: userAgent || req.headers["user-agent"] || "",
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log(`[Push API] Saved push subscription for ${role} (User ID: ${userId})`);

        res.status(201).json({
            success: true,
            message: "Push subscription saved successfully.",
            subscriptionId: updatedSubscription._id,
        });
    } catch (error) {
        console.error("[Push API] Subscribe Error:", error);
        res.status(500).json({ success: false, message: error.message || "Server error" });
    }
});

/**
 * POST /api/push/unsubscribe
 * Removes browser subscription endpoint
 */
router.post("/unsubscribe", authenticateToken, async (req, res) => {
    try {
        const { endpoint } = req.body;
        if (!endpoint) {
            return res.status(400).json({ success: false, message: "Subscription endpoint is required." });
        }

        await PushSubscription.deleteOne({ endpoint, userId: req.user.id });
        console.log(`[Push API] Unsubscribed endpoint for User ID: ${req.user.id}`);

        res.json({
            success: true,
            message: "Push subscription removed successfully.",
        });
    } catch (error) {
        console.error("[Push API] Unsubscribe Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

/**
 * POST /api/push/test
 * Admin test route to verify push notification on their device
 */
router.post("/test", authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await sendPushToAdmins({
            title: "🔔 Admin Push Test",
            body: "If you see this, background push notifications are working perfectly on your device!",
            data: { url: "/admin/orders" },
        });

        res.json({
            success: true,
            message: "Test notification dispatched to admin subscriptions.",
            result,
        });
    } catch (error) {
        console.error("[Push API] Test Push Error:", error);
        res.status(500).json({ success: false, message: error.message || "Server error" });
    }
});

module.exports = router;
