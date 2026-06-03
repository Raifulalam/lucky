/* eslint-disable no-restricted-globals */
import { precacheAndRoute } from "workbox-precaching";

precacheAndRoute(self.__WB_MANIFEST);

const CACHE_NAME = "lucky-impex-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/lucky-logo.png",
  "/favicon.ico"
];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Pre-caching offline assets");
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[Service Worker] Removing old cache", key);
            return caches.delete(key);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event (Stale-While-Revalidate and Cache-First strategies)
self.addEventListener("fetch", (event) => {
  // Only handle HTTP/HTTPS (ignore chrome-extension, etc.)
  if (!event.request.url.startsWith(self.location.origin) && !event.request.url.startsWith("http")) {
    return;
  }

  // Bypass POST, PUT, DELETE operations from worker caching
  if (event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);

  // Never cache API responses. React Query + IndexedDB handle data persistence.
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Cache-First strategy for static images
  if (
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webp")
  ) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => caches.match("/lucky-logo.png"));
        });
      })
    );
    return;
  }

  // Stale-While-Revalidate for other static assets (JS, CSS, HTML, Web App shell)
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(() => {
          // Fail silently on network errors
        });
        return cachedResponse || fetchPromise;
      });
    })
  );
});
