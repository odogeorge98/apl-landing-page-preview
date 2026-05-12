import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { firebaseApp } from "./config/config";

const FCM_TOKEN_KEY = "peppcruise_fcm_token";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!;

function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function storageClear(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}

async function cleanupOldServiceWorkers() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registrations =
      await navigator.serviceWorker.getRegistrations();

    await Promise.all(
      registrations.map(async (registration) => {
        const scriptUrl =
          registration.active?.scriptURL || "";

        if (
          scriptUrl.includes("firebase") ||
          scriptUrl.includes("messaging")
        ) {
          await registration.unregister();
        }
      })
    );

    // Clear stale SW caches
    if ("caches" in window) {
      const cacheKeys = await caches.keys();

      await Promise.all(
        cacheKeys.map((key) => caches.delete(key))
      );
    }
  } catch (error) {
    console.error(
      "[SW CLEANUP ERROR]",
      error
    );
  }
}

async function registerMessagingServiceWorker() {
  await cleanupOldServiceWorkers();

  const existing =
    await navigator.serviceWorker.getRegistration(
      "/firebase-messaging-sw.js"
    );

  // Reuse existing worker but force update check
  if (existing) {
    await existing.update();
    return existing;
  }
  
  // VERY IMPORTANT: wait until SW is active
  await navigator.serviceWorker.ready;

  // Fresh registration
  return navigator.serviceWorker.register(
    "/firebase-messaging-sw.js",
    {
      updateViaCache: "none",
    }
  );
}

export async function getOrCreateFcmToken(): Promise<string> {
  if (typeof window === "undefined") return "";

  const cached = storageGet(FCM_TOKEN_KEY);

  if (cached) return cached;

  const supported = await isSupported().catch(() => false);

  if (!supported) return "";

  // IMPORTANT:
  // Never trigger popup automatically
  if (Notification.permission !== "granted") {
    return "";
  }

  try {
    const registration =
      await registerMessagingServiceWorker();

    const messaging = getMessaging(firebaseApp);

    // extra safety: wait again for activation
    await navigator.serviceWorker.ready;
  
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) return "";

    storageSet(FCM_TOKEN_KEY, token);

    return token;
  } catch (error) {
    console.error("[FCM TOKEN ERROR]", error);
    return "";
  }
}

export async function enablePushNotifications() {
  if (!("Notification" in window)) return false;

  const permission =
    await Notification.requestPermission();

  if (permission !== "granted") {
    return false;
  }

  const token = await getOrCreateFcmToken();

  return !!token;
}

export function clearFcmToken() {
  storageClear(FCM_TOKEN_KEY);
}