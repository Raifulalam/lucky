/**
 * Lucky Impex - Web Push Server Trigger Example (Node.js)
 * 
 * To run this script and test sending real push notifications to closed browsers:
 * 1. Install web-push package: npm install web-push
 * 2. Generate VAPID keys: npx web-push generate-vapid-keys
 * 3. Replace VAPID keys and user subscription below
 * 4. Run: node scripts/push-server-example.js
 */

const webpush = require("web-push");

// 1. Configure VAPID keys (Generate once using `npx web-push generate-vapid-keys`)
const publicVapidKey = "YOUR_PUBLIC_VAPID_KEY_HERE";
const privateVapidKey = "YOUR_PRIVATE_VAPID_KEY_HERE";

webpush.setVapidDetails(
  "mailto:support@luckyimpex.com",
  publicVapidKey,
  privateVapidKey
);

// 2. Sample User Push Subscription (Saved in database when user enables notifications)
const sampleSubscription = {
  endpoint: "https://fcm.googleapis.com/fcm/send/SAMPLE_ENDPOINT_TOKEN",
  keys: {
    p256dh: "SAMPLE_P256DH_KEY",
    auth: "SAMPLE_AUTH_KEY"
  }
};

// 3. Notification Payload to send to closed browser/app
const notificationPayload = JSON.stringify({
  title: "Lucky Impex Exclusive Offer! 🔥",
  body: "Get up to 30% OFF on Samsung & LG Smart TVs today. Tap to view deals!",
  icon: "/lucky-logo.png",
  badge: "/lucky-logo.png",
  data: {
    url: "https://luckyimpex.com/products"
  }
});

// 4. Send Notification
webpush
  .sendNotification(sampleSubscription, notificationPayload)
  .then((response) => console.log("Push Notification sent successfully!", response.statusCode))
  .catch((err) => console.error("Error sending push notification:", err));
