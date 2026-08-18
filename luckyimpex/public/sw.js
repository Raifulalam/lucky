/* Lucky Impex Standalone & Push Service Worker */
const CACHE_NAME = "lucky-impex-sw-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Handle incoming background push notifications sent from server/FCM
self.addEventListener("push", (event) => {
  let notificationData = {
    title: "Lucky Impex Alert",
    body: "You have a new background notification!",
    icon: "/lucky-logo.png",
    badge: "/lucky-logo.png",
    data: { url: "/" },
  };

  if (event.data) {
    try {
      const parsedData = event.data.json();
      notificationData = { ...notificationData, ...parsedData };
      if (parsedData.notification) {
        notificationData.title = parsedData.notification.title || notificationData.title;
        notificationData.body = parsedData.notification.body || notificationData.body;
        notificationData.icon = parsedData.notification.icon || notificationData.icon;
      }
    } catch (err) {
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  const title = notificationData.title;
  const options = {
    body: notificationData.body,
    icon: notificationData.icon || "/lucky-logo.png",
    badge: notificationData.badge || "/lucky-logo.png",
    image: notificationData.image || null,
    vibrate: [100, 50, 100],
    data: notificationData.data || { url: "/" },
    actions: notificationData.actions || [
      { action: "open", title: "View Details" },
      { action: "close", title: "Dismiss" }
    ],
    tag: notificationData.tag || "luckyimpex-notification",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle user click on background notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
