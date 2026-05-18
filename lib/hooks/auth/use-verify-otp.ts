import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { verifyOtp } from "@/lib/api/auth";
import { VerifyOtpResponse } from "@/lib/interfaces/auth";
import { otpSession } from "@/lib/utils/auth/otp-session";
import {
  getOrCreateDeviceToken,
  buildDeviceName,
} from "@/lib/utils/auth/device-token";
import useAuthStore from "@/lib/store/auth";
import { showSuccess } from "@/lib/utils/error-handler";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return (
    `${local[0]}${"*".repeat(Math.min(local.length - 2, 5))}` +
    `${local[local.length - 1]}@${domain}`
  );
}

export type SessionStatus = "checking" | "valid" | "invalid";

// ─── Options ──────────────────────────────────────────────────────────────────

interface UseVerifyOtpOptions {
  onSuccess?: (data: VerifyOtpResponse) => void;
  onError?: (error: Error) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useVerifyOtp = (options?: UseVerifyOtpOptions) => {
  const router = useRouter();
  const { login, setRequestLoading } = useAuthStore();

  const [maskedEmail, setMaskedEmail] = useState("");
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("checking");

  // ── Session guard ─────────────────────────────────────────────────────────
  // Runs once on mount. If there is no valid OTP session the user navigated
  // here directly (or the 5-min TTL elapsed), so we send them back to login.
  useEffect(() => {
    const session = otpSession.read();

    if (!session) {
      setSessionStatus("invalid");
      router.replace("/login");
      return;
    }

    setMaskedEmail(maskEmail(session.email));
    setSessionStatus("valid");
  }, [router]);

  // ── Mutation ──────────────────────────────────────────────────────────────
  const mutation = useMutation<VerifyOtpResponse, Error, string>({
    mutationFn: async (otp: string) => {
      // Re-read at submit time — session may have expired while the user sat
      // on the page between the mount check and the submit.
      const session = otpSession.read();
      if (!session) {
        throw new Error("Session expired. Please log in again.");
      }

      // FCM token is async — resolved here so the component stays synchronous.
      const fcmToken = await getOrCreateDeviceToken();

      return verifyOtp({
        email: session.email,
        password: session.password,
        otp,
        rememberMe: session.rememberMe,
        deviceInfo: {
          deviceFCMToken: fcmToken,
          name: buildDeviceName(),
        },
      });
    },

    onSuccess: (data) => {
      // Clear sensitive credentials immediately after a single successful use.
      otpSession.clear();

      if (data.user && data.token) {
        // console.log("LOGIN USER:", data.user);
        login(data.user, data.token);
      }

      showSuccess(data.message || "Login successful!");
      options?.onSuccess?.(data);
      router.replace("/dashboard/overview");
    },

    onError: (error) => {
      // Error is surfaced inline in the form — no toast here to avoid double
      // feedback on a focused security screen.
      options?.onError?.(error);
    },

    onMutate: () => setRequestLoading(true),
    onSettled: () => setRequestLoading(false),
  });

  return {
    ...mutation,
    maskedEmail,
    sessionStatus,
  };
};