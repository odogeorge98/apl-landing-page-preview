/**
 * Device token utilities for PEPPCruise admin.
 *
 * The "device token" is a Firebase Cloud Messaging (FCM)
 * registration token used by the backend to:
 *
 * 1. Recognise trusted devices.
 * 2. Optionally support push notifications.
 *
 * Token lifecycle is managed by:
 * "@/lib/services/firebase/messaging"
 */

export {
  getOrCreateFcmToken as getOrCreateDeviceToken,
  clearFcmToken,
} from "@/lib/services/firebase/messaging";

// ─── Device name ─────────────────────────────────────────────────────────────

/**
 * Returns a human-readable device name string.
 * Limited to 50 chars to satisfy backend DTO validation.
 */
export function buildDeviceName(): string {
  if (typeof window === "undefined") {
    return "Web Server";
  }

  const ua = navigator.userAgent ?? "Web";

  const platform =
    (
      navigator as Navigator & {
        userAgentData?: {
          platform?: string;
        };
      }
    ).userAgentData?.platform ||
    navigator.platform ||
    "";

  const name =
    platform.length > 0
      ? `${platform} — ${ua}`
      : ua;

  return name.slice(0, 50);
}