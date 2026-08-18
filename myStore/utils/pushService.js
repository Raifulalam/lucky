let webpush = null;
try {
    webpush = require("web-push");
} catch (err) {
    console.warn("⚠️ [Push Service] 'web-push' package is not installed yet. Please run 'npm install' in myStore folder.");
}

const PushSubscription = require("../Models/PushSubscription");

// Standard VAPID Key configuration
let publicVapidKey = process.env.VAPID_PUBLIC_KEY;
let privateVapidKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@luckyimpex.com";

// If keys are not set in environment and webpush is available, generate persistent keys
if (webpush && (!publicVapidKey || !privateVapidKey)) {
    try {
        const vapidKeys = webpush.generateVAPIDKeys();
        publicVapidKey = vapidKeys.publicKey;
        privateVapidKey = vapidKeys.privateKey;
        console.log("🔑 [Push Service] Auto-generated VAPID Keys:");
        console.log("   VAPID_PUBLIC_KEY =", publicVapidKey);
    } catch (err) {
        console.warn("⚠️ [Push Service] Failed to generate VAPID keys automatically:", err.message);
    }
}

if (webpush && publicVapidKey && privateVapidKey) {
    try {
        webpush.setVapidDetails(vapidSubject, publicVapidKey, privateVapidKey);
    } catch (err) {
        console.warn("⚠️ [Push Service] Error configuring VAPID details:", err.message);
    }
}

/**
 * Get current public VAPID key
 */
function getVapidPublicKey() {
    return publicVapidKey || "";
}

/**
 * Send push notification to all admins
 * @param {Object} payloadData - Notification details { title, body, icon, data, actions }
 */
async function sendPushToAdmins(payloadData) {
    if (!webpush) {
        console.warn("⚠️ [Push Service] Cannot send push notification: 'web-push' package not loaded.");
        return { error: "web-push module missing" };
    }

    try {
        const adminSubscriptions = await PushSubscription.find({ role: "admin" }).lean();
        if (!adminSubscriptions || adminSubscriptions.length === 0) {
            console.log("ℹ️ [Push Service] No admin push subscriptions found in database.");
            return { sent: 0, failed: 0 };
        }

        const payloadString = JSON.stringify({
            title: payloadData.title || "🛒 New Order Received!",
            body: payloadData.body || "A new order has been placed on Lucky Impex.",
            icon: payloadData.icon || "/lucky-logo.png",
            badge: payloadData.badge || "/lucky-logo.png",
            data: payloadData.data || { url: "/admin/orders" },
            tag: payloadData.tag || `order-${Date.now()}`,
            actions: payloadData.actions || [
                { action: "open", title: "View Order" },
                { action: "close", title: "Dismiss" },
            ],
        });

        let sentCount = 0;
        let failedCount = 0;

        const promises = adminSubscriptions.map(async (sub) => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: sub.keys,
            };

            try {
                await webpush.sendNotification(pushSubscription, payloadString);
                sentCount++;
            } catch (err) {
                failedCount++;
                console.warn(`[Push Service] Push delivery status for ${sub.endpoint ? sub.endpoint.slice(0, 30) : "endpoint"}...: ${err.statusCode || err.message}`);
                
                // If subscription expired or invalid (404 Not Found, 410 Gone)
                if (err.statusCode === 404 || err.statusCode === 410) {
                    console.log(`[Push Service] Removing expired subscription: ${sub._id}`);
                    await PushSubscription.deleteOne({ _id: sub._id });
                }
            }
        });

        await Promise.allSettled(promises);
        console.log(`✅ [Push Service] Admin push delivery summary: ${sentCount} sent, ${failedCount} failed.`);
        return { sent: sentCount, failed: failedCount };
    } catch (err) {
        console.error("❌ [Push Service] Error in sendPushToAdmins:", err);
        return { error: err.message };
    }
}

/**
 * Send push notification to a specific user by ID
 */
async function sendPushToUser(userId, payloadData) {
    if (!webpush) return { error: "web-push module missing" };

    try {
        const userSubscriptions = await PushSubscription.find({ userId }).lean();
        if (!userSubscriptions || userSubscriptions.length === 0) return { sent: 0 };

        const payloadString = JSON.stringify(payloadData);
        let sentCount = 0;

        const promises = userSubscriptions.map(async (sub) => {
            try {
                await webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payloadString);
                sentCount++;
            } catch (err) {
                if (err.statusCode === 404 || err.statusCode === 410) {
                    await PushSubscription.deleteOne({ _id: sub._id });
                }
            }
        });

        await Promise.allSettled(promises);
        return { sent: sentCount };
    } catch (err) {
        console.error("❌ [Push Service] Error in sendPushToUser:", err);
        return { error: err.message };
    }
}

module.exports = {
    getVapidPublicKey,
    sendPushToAdmins,
    sendPushToUser,
};
