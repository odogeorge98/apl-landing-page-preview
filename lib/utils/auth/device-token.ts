/**
 * Device token utilities for PEPPCruise admin.
 *
 * The "device token" is a Firebase Cloud Messaging (FCM) registration token —
 * a stable, browser-scoped identifier that the backend uses to:
 *  1. Recognise trusted devices and skip OTP on returning logins.
 *  2. Deliver push notifications to this browser instance.
 *
 * Token lifecycle is managed entirely by lib/firebase/messaging.ts.
 * This module re-exports the functions under the names the rest of the
 * codebase already uses so callers need no changes.
 */

export {
  getOrCreateFcmToken as getOrCreateDeviceToken,
  refreshFcmToken,
  clearFcmToken,
} from "@/lib/services/firebase/messaging";

// ─── Device name ──────────────────────────────────────────────────────────────

/**
 * Returns a human-readable device name string.
 * Capped at 50 chars to match the backend DTO's MaxLength(50) constraint.
 */
export function buildDeviceName(): string {
  if (typeof window === "undefined") return "Web Server";

  const ua = navigator.userAgent ?? "Web";

  const platform =
    (
      navigator as Navigator & {
        userAgentData?: { platform: string };
      }
    ).userAgentData?.platform ||
    navigator.platform ||
    "";

  const name = platform ? `${platform} — ${ua}` : ua;
  return name.slice(0, 50);
}