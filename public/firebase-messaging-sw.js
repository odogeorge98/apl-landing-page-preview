/* eslint-disable no-undef */

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"
);

importScripts(
  "https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyC3OeYId1y5i-K9U5A-IwFb2o7ZYC56NVE",
  authDomain: "pepp-571f1.firebaseapp.com",
  projectId: "pepp-571f1",
  storageBucket: "pepp-571f1.firebasestorage.app",
  messagingSenderId: "262571770782",
  appId: "1:262571770782:web:e415ce56473a4866f38c8f",
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