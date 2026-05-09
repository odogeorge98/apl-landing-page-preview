/**
 * Firebase Cloud Messaging service worker.
 *
 * Handles background push notifications when the admin tab is not in focus.
 *
 * ⚠️  Service workers cannot access process.env.  The Firebase config is
 * injected at runtime via postMessage from lib/firebase/messaging.ts — see
 * registerMessagingServiceWorker() for the sender side.
 */

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

// Config is received from the main thread and held in module scope.
let messaging = null;

self.addEventListener("message", (event) => {
  if (!event.data || event.data.type !== "FIREBASE_CONFIG") return;

  // Guard against re-initialisation if the SW is reused across hot-reloads.
  if (firebase.apps.length === 0) {
    firebase.initializeApp(event.data.config);
  }

  messaging = firebase.messaging();

  // Handle messages received while the app is in the background or closed.
  messaging.onBackgroundMessage((payload) => {
    const title = payload.notification?.title ?? "PEPPCruise Admin";
    const body = payload.notification?.body ?? "";
    const icon = payload.notification?.icon ?? "/assets/peppcruise_logo.png";

    self.registration.showNotification(title, {
      body,
      icon,
      badge: "/assets/peppcruise_logo.png",
      data: payload.data ?? {},
    });
  });
});

// Allow the new SW to activate immediately without waiting for existing tabs
// to close — important in an admin SPA where the tab may be open for hours.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(self.clients.claim())
);