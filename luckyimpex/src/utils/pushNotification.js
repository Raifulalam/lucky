/**
 * Web Push Notification Utility for Lucky Impex PWA
 * Handles browser permission requests, service worker registration, push subscription, and server sync.
 */

import { getData, authRequest } from "../api/api";

// Helper to convert base64 VAPID Key to Uint8Array for PushManager subscribe
export function urlBase64ToUint8Array(base64String) {
  if (!base64String) return null;
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if the browser supports notifications and service workers
 */
export function isPushNotificationSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/**
 * Get current notification permission status ('granted', 'denied', or 'default')
 */
export function getNotificationPermissionStatus() {
  if (!isPushNotificationSupported()) return "unsupported";
  return Notification.permission;
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission() {
  if (!isPushNotificationSupported()) {
    throw new Error("Push notifications are not supported in this browser.");
  }
  const permission = await Notification.requestPermission();
  return permission;
}

/**
 * Register Service Worker if not already active
 */
export async function registerPushServiceWorker() {
  if (!isPushNotificationSupported()) {
    throw new Error("Service Worker is not supported in this browser.");
  }

  // Check if already registered
  let registration = await navigator.serviceWorker.getRegistration();
  if (!registration) {
    // Try registering sw.js or fallback service-worker.js
    try {
      registration = await navigator.serviceWorker.register("/sw.js");
    } catch {
      registration = await navigator.serviceWorker.register("/service-worker.js");
    }
  }

  return registration;
}

/**
 * Fetch VAPID Public Key from backend API
 */
export async function fetchVapidPublicKey() {
  try {
    const res = await getData("/push/vapid-key");
    return res?.vapidPublicKey || null;
  } catch (err) {
    console.warn("[Push Notification] Failed to fetch VAPID key from backend:", err.message);
    return null;
  }
}

/**
 * Subscribe user/admin browser to Push Notifications and register with backend server
 * @param {string} [customVapidKey] - Optional VAPID Public Key
 * @returns {Promise<PushSubscription>}
 */
export async function subscribeUserToPush(customVapidKey) {
  const permission = await requestNotificationPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission denied by user.");
  }

  const registration = await registerPushServiceWorker();
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();

  // If no subscription active or need new subscription with VAPID key
  let vapidPublicKey = customVapidKey;
  if (!vapidPublicKey) {
    vapidPublicKey = await fetchVapidPublicKey();
  }

  if (!subscription) {
    const subscribeOptions = {
      userVisibleOnly: true,
    };

    if (vapidPublicKey) {
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
      if (convertedKey) {
        subscribeOptions.applicationServerKey = convertedKey;
      }
    }

    subscription = await registration.pushManager.subscribe(subscribeOptions);
    console.log("[Push Notification] New browser push subscription created:", subscription);
  }

  // Sync subscription to backend server database
  try {
    const subscriptionJson = subscription.toJSON();
    await authRequest("/push/subscribe", {
      method: "POST",
      body: {
        subscription: subscriptionJson,
        userAgent: navigator.userAgent,
      },
    });
    console.log("[Push Notification] Push subscription successfully registered with server backend.");
  } catch (err) {
    console.warn("[Push Notification] Warning: Push subscription server registration failed:", err.message);
  }

  return subscription;
}

/**
 * Unsubscribe user from Push Notifications and remove from backend
 */
export async function unsubscribeUserFromPush() {
  if (!isPushNotificationSupported()) return false;
  const registration = await navigator.serviceWorker.getRegistration();
  if (!registration) return false;

  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();
    console.log("[Push Notification] Browser push subscription cancelled.");

    try {
      await authRequest("/push/unsubscribe", {
        method: "POST",
        body: { endpoint },
      });
      console.log("[Push Notification] Unsubscribed endpoint removed from backend database.");
    } catch (err) {
      console.warn("[Push Notification] Server unsubscribe notification warning:", err.message);
    }
    return true;
  }
  return false;
}

/**
 * Display background notification using Service Worker or fallback
 * @param {string} title
 * @param {NotificationOptions} [options]
 */
export async function displayPushNotification(title = "Lucky Impex Alert", options = {}) {
  if (!isPushNotificationSupported()) {
    return false;
  }

  if (Notification.permission !== "granted") {
    return false;
  }

  const defaultOptions = {
    body: "You have a new update from Lucky Impex.",
    icon: "/lucky-logo.png",
    badge: "/lucky-logo.png",
    vibrate: [100, 50, 100],
    data: { url: window.location.origin },
    actions: [
      { action: "open", title: "View Details" },
      { action: "close", title: "Dismiss" }
    ],
    tag: "lucky-notification-" + Date.now(),
    renotify: true,
  };

  const notificationOptions = { ...defaultOptions, ...options };

  try {
    const registration = await registerPushServiceWorker();
    if (registration && registration.showNotification) {
      await registration.showNotification(title, notificationOptions);
      return true;
    }
  } catch (err) {
    console.warn("[Push Notification] ServiceWorker showNotification error, trying fallback:", err);
  }

  if (typeof Notification !== "undefined") {
    new Notification(title, notificationOptions);
    return true;
  }

  return false;
}

// Alias for backwards compatibility
export const triggerTestPushNotification = displayPushNotification;
