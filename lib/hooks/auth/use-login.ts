import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/lib/api/auth";
import { LoginData, LoginResponse } from "@/lib/interfaces/auth";
import { showError, showSuccess } from "@/lib/utils/error-handler";
import { saveOtpSession } from "@/lib/utils/auth/otp-session";
import { getOrCreateDeviceToken } from "@/lib/utils/auth/device-token";
import useAuthStore from "@/lib/store/auth";

interface UseLoginOptions {
  onSuccess?: (data: LoginResponse) => void;
  onError?: (error: Error) => void;
}

export const useLogin = (options?: UseLoginOptions) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, setRequestLoading } = useAuthStore();

  return useMutation<LoginResponse, Error, LoginData>({
    mutationFn: async (data: LoginData) => {
      // Resolve the FCM token here so loginUser stays a pure API function.
      // getOrCreateDeviceToken returns "" gracefully if FCM isn't available
      // (permission denied, unsupported browser) — the backend will still
      // process the login, just without device recognition.
      let deviceToken = "";

      if (typeof window !== "undefined") {
        if (Notification.permission !== "granted") {
          const permission =
            await Notification.requestPermission();

          if (permission === "granted") {
            deviceToken =
              await getOrCreateDeviceToken();
          }
        } else {
          deviceToken =
            await getOrCreateDeviceToken();
        }
      }

      // console.log('Device token in hook script: ', deviceToken);
      return loginUser(data, deviceToken);
    },

    onMutate: () => {
      setRequestLoading(true);
    },

    onSuccess: (data, variables) => {
      // console.log('Loginnn data: ', data);
      // ── OTP branch ────────────────────────────────────────────────────────
      if (data.requiresOtp) {
        saveOtpSession(
          variables.email.trim(),
          variables.password,
          variables.rememberMe ?? false,
        );
        router.push("/verify-otp");
        return;
      }

      // ── Direct login branch ───────────────────────────────────────────────
      if (data.user && data.token) {
        // console.log("LOGIN USER:", data.user);
        login(data.user, data.token);
      }

      if (variables.rememberMe && typeof window !== "undefined") {
        try {
          window.localStorage.setItem("peppcruise_admin_remember", "7d");
        } catch {}
      }

      showSuccess(data.message || "Login successful!");
      options?.onSuccess?.(data);

      const redirectTo = searchParams.get("redirect") || "/dashboard/overview";
      router.push(redirectTo);
    },

    onError: (error) => {
      showError(error.message);
      options?.onError?.(error);
    },

    onSettled: () => {
      setRequestLoading(false);
    },
  });
};