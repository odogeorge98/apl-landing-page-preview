/* eslint-disable no-undef */

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title =
    payload.notification?.title || "PEPPCruise";

  self.registration.showNotification(title, {
    body: payload.notification?.body || "",
    icon: "/assets/peppcruise_logo.png",
    badge: "/assets/peppcruise_logo.png",
  });
});

// Immediately activate new worker
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Take over ALL tabs immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Remove old caches
      const keys = await caches.keys();

      await Promise.all(
        keys.map((key) => caches.delete(key))
      );

      await clients.claim();
    })()
  );
});