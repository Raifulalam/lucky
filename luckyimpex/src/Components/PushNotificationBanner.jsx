import React, { useState, useEffect } from "react";
import { Bell, Sparkles, X } from "lucide-react";
import {
  isPushNotificationSupported,
  getNotificationPermissionStatus,
  requestNotificationPermission,
  displayPushNotification,
} from "../utils/pushNotification";
import "./PushNotificationBanner.css";

export default function PushNotificationBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isPushNotificationSupported()) {
      const currentPerm = getNotificationPermissionStatus();
      const dismissed = localStorage.getItem("lucky_push_banner_dismissed");
      if (currentPerm === "granted" || currentPerm === "denied" || dismissed === "true") {
        setIsVisible(false);
      }
    } else {
      setIsVisible(false);
    }
  }, []);

  const handleEnableNotifications = async () => {
    setIsSubmitting(true);
    try {
      const result = await requestNotificationPermission();
      if (result === "granted") {
        await displayPushNotification("Notifications Active 🔔", {
          body: "You will now receive instant order updates and special offers even when the app is closed.",
        });
        setIsVisible(false);
      } else if (result === "denied") {
        setIsVisible(false);
      }
    } catch (err) {
      console.error("Error enabling notifications:", err);
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
            Enable Push Notifications <Sparkles className="sparkle-icon" size={16} />
          </div>
          <div className="push-banner-desc">
            Get instant order status updates, price drops, and EMI alerts even when your browser is closed.
          </div>
        </div>
        <div className="push-banner-actions">
          <button
            className="push-banner-btn-enable"
            onClick={handleEnableNotifications}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enabling..." : "Enable"}
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
