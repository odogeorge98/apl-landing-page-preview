import { v4 as uuidv4 } from "uuid";

const DEVICE_TOKEN_KEY = "peppcruise_device_id";

/**
 * Returns a stable, browser-scoped device token.
 *
 * Generated once on first visit and persisted in localStorage so the backend
 * can identify trusted devices across sessions and skip OTP for returning logins.
 *
 * Gracefully degrades when localStorage is blocked (private mode, sandboxed
 * iframes, etc.) — in that case a session-scoped UUID is returned. The device
 * won't be "remembered" but auth will still work via OTP.
 */
export function getOrCreateDeviceToken(): string {
  if (typeof window === "undefined") {
    // SSR path — never used for real auth requests; prevents build-time crashes.
    return "ssr-placeholder";
  }

  try {
    const existing = window.localStorage.getItem(DEVICE_TOKEN_KEY);
    if (existing) return existing;

    const fresh = uuidv4();
    window.localStorage.setItem(DEVICE_TOKEN_KEY, fresh);
    return fresh;
  } catch {
    // localStorage unavailable — return a one-off UUID for this session.
    return uuidv4();
  }
}

/**
 * Returns a human-readable device name string capped at 50 chars to satisfy
 * the backend DTO's MaxLength(50) constraint.
 */
export function buildDeviceName(): string {
  if (typeof window === "undefined") return "Web Server";

  const ua = navigator.userAgent ?? "Web";

  // userAgentData is available in modern Chromium browsers.
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