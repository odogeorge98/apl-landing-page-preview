import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { firebaseApp } from "./config/config";

const FCM_TOKEN_KEY = "fcm_token";

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

export async function getOrCreateFcmToken(): Promise<string> {
  if (typeof window === "undefined") return "";

  const cached = storageGet(FCM_TOKEN_KEY);
  // console.log('Cached: ', cached);

  if (cached) return cached;

  const supported = await isSupported().catch(() => false);
  // console.log('Supported: ', supported);

  if (!supported) return "";

  // IMPORTANT:
  // Never trigger popup automatically
  if (Notification.permission !== "granted") {
    return "";
  }

  try {
    const messaging = getMessaging(firebaseApp);

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
    });

  //  console.log('fcm token: ', token);
    if (!token) return "";

    storageSet(FCM_TOKEN_KEY, token);

    return token;
  } catch (error) {
    console.error(
      "[FCM TOKEN ERROR]",
      error instanceof Error ? error.message : error
    );
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