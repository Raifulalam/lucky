import React, { useState, useEffect } from "react";
import { Bell, Sparkles, X } from "lucide-react";
import {
  isPushNotificationSupported,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  triggerTestPushNotification,
} from "../utils/pushNotification";
import "./PushNotificationBanner.css";

export default function PushNotificationBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (isPushNotificationSupported()) {
      const currentPerm = getNotificationPermissionStatus();
      if (currentPerm === "granted") {
        setStatusMessage("Notifications are enabled! Tap 'Test Notification' below.");
      } else if (currentPerm === "denied") {
        setStatusMessage("Notifications are blocked in your browser settings.");
      }
    } else {
      setStatusMessage("Push Notifications not supported in this browser.");
    }
  }, []);

  const handleEnableNotifications = async () => {
    setIsSubmitting(true);
    setStatusMessage("");
    try {
      const result = await requestNotificationPermission();
      if (result === "granted") {
        setStatusMessage("Permission granted! Sending test push...");
        await triggerTestPushNotification("Lucky Impex Alert 🔔", {
          body: "Background notifications are now active! You will receive updates even when the app is closed.",
        });
      } else if (result === "denied") {
        setStatusMessage("Notifications blocked in browser settings.");
      }
    } catch (err) {
      console.error("Error enabling notifications:", err);
      setStatusMessage(err.message || "Failed to request permission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestPush = async () => {
    setIsSubmitting(true);
    try {
      await triggerTestPushNotification("Lucky Impex Test Push 🔔", {
        body: "Success! Push notification working while app is closed/in background.",
      });
      setStatusMessage("Test push notification sent!");
    } catch (err) {
      setStatusMessage(err.message || "Error triggering push notification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("lucky_push_banner_dismissed", "true");
  };

  if (!isVisible) return null;

  const currentPerm = getNotificationPermissionStatus();

  return (
    <div className="push-banner-container" role="alert">
      <div className="push-banner-content">
        <div className="push-banner-icon-wrapper">
          <Bell className="push-banner-bell-icon" size={24} />
        </div>
        <div className="push-banner-text">
          <div className="push-banner-title">
            Push Notifications <Sparkles className="sparkle-icon" size={16} />
          </div>
          <div className="push-banner-desc">
            Get order updates, price drops, and EMI alerts even when your app/browser is closed.
          </div>
          {statusMessage && <div className="push-banner-status">{statusMessage}</div>}
        </div>
        <div className="push-banner-actions">
          {currentPerm === "granted" ? (
            <button
              className="push-banner-btn-enable"
              onClick={handleTestPush}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Test Notification"}
            </button>
          ) : (
            <button
              className="push-banner-btn-enable"
              onClick={handleEnableNotifications}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enabling..." : "Enable Notifications"}
            </button>
          )}
          <button
            className="push-banner-btn-close"
            onClick={handleDismiss}
            aria-label="Dismiss banner"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
