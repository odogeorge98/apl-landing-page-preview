import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { firebaseApp } from "./config/config";

// ─── Constants ────────────────────────────────────────────────────────────────

const FCM_TOKEN_KEY = "peppcruise_fcm_token";

/**
 * Your VAPID public key from the Firebase Console.
 * Project Settings → Cloud Messaging → Web configuration → Key pair.
 */
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY!;

// ─── localStorage helpers ─────────────────────────────────────────────────────
// Isolated so every access is guarded against private-mode / iframe sandboxes.

function storageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Silently ignore — token won't persist but auth still works.
  }
}

function storageClear(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {}
}

// ─── Service worker registration ─────────────────────────────────────────────

/**
 * Registers the FCM service worker and injects the Firebase config at runtime
 * via postMessage so the SW file itself stays env-variable-free and can be
 * served as a plain static file.
 */
async function registerMessagingServiceWorker(): Promise<ServiceWorkerRegistration> {
  // If a registration already exists (e.g. after hot-reload) reuse it.
  const existing = await navigator.serviceWorker
    .getRegistration("/firebase-cloud-messaging-push-scope")
    .catch(() => undefined);

  const registration =
    existing ??
    (await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/firebase-cloud-messaging-push-scope",
    }));

  // Wait until the SW is active before posting the config.
  await navigator.serviceWorker.ready;

  // Inject Firebase config so the SW can initialise its own Firebase instance
  // without hard-coding values in the static file.
  registration.active?.postMessage({
    type: "FIREBASE_CONFIG",
    config: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    },
  });

  return registration;
}

// ─── Permission ───────────────────────────────────────────────────────────────

async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const result = await Notification.requestPermission();
  return result === "granted";
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the FCM registration token for this browser instance.
 *
 * Behaviour:
 * 1. If a valid token is already in localStorage, returns it immediately.
 * 2. Otherwise requests notification permission, registers the service worker,
 *    fetches a fresh token from Firebase, persists it, and returns it.
 * 3. On any failure (unsupported browser, permission denied, network error)
 *    returns an empty string — callers must handle this gracefully.
 *
 * The token is stored in localStorage so subsequent calls are instant and the
 * backend can use it across sessions to identify trusted devices.
 */
export async function getOrCreateFcmToken(): Promise<string> {
  if (typeof window === "undefined") return "";

  // ── Fast path: cached token ────────────────────────────────────────────────
  const cached = storageGet(FCM_TOKEN_KEY);
  if (cached) return cached;

  // ── Browser support check ─────────────────────────────────────────────────
  const supported = await isSupported().catch(() => false);
  if (!supported) {
    console.warn("[FCM] Web push messaging is not supported in this browser.");
    return "";
  }

  // ── Permission ─────────────────────────────────────────────────────────────
  const permitted = await requestNotificationPermission();
  if (!permitted) {
    console.warn("[FCM] Notification permission was not granted.");
    return "";
  }

  // ── Token retrieval ────────────────────────────────────────────────────────
  try {
    const messaging = getMessaging(firebaseApp);
    const registration = await registerMessagingServiceWorker();

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.warn("[FCM] getToken returned an empty value.");
      return "";
    }

    storageSet(FCM_TOKEN_KEY, token);
    return token;
  } catch (error) {
    console.error("[FCM] Failed to retrieve token:", error);
    return "";
  }
}

/**
 * Forces a token refresh by deleting the cached value and requesting a new
 * token from Firebase. Call this if the backend reports the stored token is
 * stale or has been revoked.
 */
export async function refreshFcmToken(): Promise<string> {
  storageClear(FCM_TOKEN_KEY);
  return getOrCreateFcmToken();
}

/**
 * Clears the stored FCM token from localStorage.
 * Call this on logout so the next login gets a fresh registration.
 */
export function clearFcmToken(): void {
  storageClear(FCM_TOKEN_KEY);
}