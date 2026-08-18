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
      // Hide banner if permission is already granted or dismissed
      const dismissed = localStorage.getItem("lucky_push_banner_dismissed");
      if (currentPerm === "granted" || dismissed === "true") {
        setIsVisible(false);
      }
    } else {
      setIsVisible(false);
    }
  }, []);

  const handleEnableNotifications = async () => {
    setIsSubmitting(true);
    setStatusMessage("");
    try {
      const result = await requestNotificationPermission();
      if (result === "granted") {
        setStatusMessage("Notifications enabled! Sending test notification...");
        await triggerTestPushNotification("Welcome to Lucky Impex Notifications! 🔔", {
          body: "You will now receive order updates, EMI alerts & special deals even when the app is closed.",
        });
        setTimeout(() => setIsVisible(false), 3000);
      } else if (result === "denied") {
        setStatusMessage("Notifications blocked. You can enable them in browser settings.");
      }
    } catch (err) {
      console.error("Error enabling notifications:", err);
      setStatusMessage("Failed to request permission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("lucky_push_banner_dismissed", "true");
  };

  if (!isVisible) return null;

  return (
    <div className="push-banner-container" role="alert">
      <div className="push-banner-content">
        <div className="push-banner-icon-wrapper">
          <Bell className="push-banner-bell-icon" size={24} />
        </div>
        <div className="push-banner-text">
          <div className="push-banner-title">
            Enable Background Notifications <Sparkles className="sparkle-icon" size={16} />
          </div>
          <div className="push-banner-desc">
            Get instant alerts on order updates, exclusive price drops, and EMI payment reminders even when your browser is closed.
          </div>
          {statusMessage && <div className="push-banner-status">{statusMessage}</div>}
        </div>
        <div className="push-banner-actions">
          <button
            className="push-banner-btn-enable"
            onClick={handleEnableNotifications}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enabling..." : "Enable Notifications"}
          </button>
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
