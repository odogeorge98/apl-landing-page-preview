/**
 * Typed, TTL-capped sessionStorage bridge between the login page and the
 * verify-OTP page.
 *
 * Why sessionStorage?
 *  - Scoped to the tab — not shared across windows like localStorage.
 *  - Automatically cleared when the tab closes.
 *  - We add an explicit TTL on top so credentials don't linger if the user
 *    walks away mid-flow.
 *
 * Security note: storing a password (even briefly) in sessionStorage is an
 * accepted trade-off here because the /login-otp endpoint requires it to
 * re-verify credentials alongside the OTP. Clear it the moment it's used.
 */

const SESSION_KEY = "peppcruise_pending_otp";

/** OTP codes expire server-side; 5 min gives comfortable buffer. */
const TTL_MS = 5 * 60 * 1000;

interface PendingOtpState {
  email: string;
  password: string;
  rememberMe: boolean;
  expiresAt: number;
}

function write(state: PendingOtpState): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage blocked — the OTP page will redirect to login gracefully.
  }
}

function read(): PendingOtpState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;

    const state = JSON.parse(raw) as PendingOtpState;

    if (Date.now() > state.expiresAt) {
      clear();
      return null;
    }

    return state;
  } catch {
    return null;
  }
}

function clear(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // nothing to do
  }
}

export const otpSession = { write, read, clear };

export function saveOtpSession(
  email: string,
  password: string,
  rememberMe: boolean,
): void {
  otpSession.write({ email, password, rememberMe, expiresAt: Date.now() + TTL_MS });
}