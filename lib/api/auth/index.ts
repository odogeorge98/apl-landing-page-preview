import { http } from "@/lib/utils/http";
import { HttpError } from "@/lib/utils/http";
import {
  LoginData,
  LoginResponse,
  ForgetPasswordData,
  ForgetPasswordResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  OnboardingData,
  OnboardingResponse,
  AdminOnboardingData,
  AdminOnboardingResponse,
  VerifyOtpData,
  VerifyOtpResponse,
} from "@/lib/interfaces/auth";

/**
 * POST /admin/auth/login
 *
 * Accepts a pre-resolved FCM device token so the caller (useLogin hook) owns
 * the async token retrieval. The token is forwarded as x-client-device-token
 * so the backend can decide whether this is a known device or OTP is needed.
 */
export async function loginUser(
  data: LoginData,
  deviceToken: string,
): Promise<LoginResponse> {
  try {
    // console.log('Token in api.ts: ', deviceToken);
    const response = await http.deviceRequest<any>(
      "POST",
      "/auth/login",
      deviceToken,
      {
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      },
    );

    const result = response.data;

    if (result.status === "error") {
      throw new Error(result.message || "An error occurred");
    }

    return {
      success: true,
      message: result.message || "Login successful!",
      user: result.data?.user ?? result.user,
      token: result.data?.token ?? result.token,
    };
  } catch (error) {
    // ── OTP required ────────────────────────────────────────────────────────
    // Backend throws UnauthorizedException("OTP_REQUIRED") → 401.
    // The interceptor preserves the message and no longer redirects when
    // there is no existing auth token, so we can catch it here cleanly.
    if (error instanceof HttpError && error.status === 401) {
      const msg: string =
        (error.response as any)?.message ?? error.message ?? "";

      if (msg === "OTP_REQUIRED" || msg.toLowerCase().includes("otp")) {
        // console.log('Otp required');
        return {
          success: false,
          requiresOtp: true,
          message: "OTP verification required",
        };
      }
    }

    if (error instanceof Error) throw error;
    throw new Error("Login failed. Please try again.");
  }
}

/**
 * POST /admin/auth/login-otp
 *
 * No device-token header needed here — the FCM token travels in the request
 * body via deviceInfo.deviceFCMToken so the backend can register the device.
 */
export async function verifyOtp(data: VerifyOtpData): Promise<VerifyOtpResponse> {
  try {
    const response = await http.publicRequest<any>("POST", "/auth/login-otp", {
      email: data.email,
      password: data.password,
      otp: data.otp,
      rememberMe: data.rememberMe,
      deviceInfo: {
        deviceFCMToken: data.deviceInfo.deviceFCMToken,
        name: data.deviceInfo.name,
      },
    });

    const result = response.data;

    if (result.status === "error") {
      throw new Error(result.message || "An error occurred");
    }

    return {
      success: true,
      message: result.message || "Login successful!",
      user: result.data?.user ?? result.user,
      token: result.data?.token ?? result.token,
    };
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("OTP verification failed. Please try again.");
  }
}

export async function forgetPassword(
  data: ForgetPasswordData,
): Promise<ForgetPasswordResponse> {
  try {
    const response = await http.publicRequest<any>(
      "POST",
      "/auth/forget-password",
      { email: data.email },
    );
    const result = response.data;
    if (result.status === "error") throw new Error(result.message || "An error occurred");
    return { success: true, message: result.message || "Password reset email sent successfully!" };
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Failed to send password reset email. Please try again.");
  }
}

export async function resetPassword(
  data: ResetPasswordData,
): Promise<ResetPasswordResponse> {
  try {
    const response = await http.publicRequest<any>("PATCH", "/auth/reset-password", {
      token: data.token,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
    const result = response.data;
    if (result.status === "error") throw new Error(result.message || "An error occurred");
    return { success: true, message: result.message || "Password reset successfully!" };
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Failed to reset password. Please try again.");
  }
}

export async function onboardUser(data: OnboardingData): Promise<OnboardingResponse> {
  try {
    const response = await http.publicRequest<any>("POST", "/organization/onboard", {
      token: data.token,
      businessName: data.businessName,
      businessType: data.businessType,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
    const result = response.data;
    if (result.status === "error") throw new Error(result.message || "An error occurred");
    return {
      success: true,
      message: result.message || "Onboarding successful!",
      user: result.user,
      token: result.token,
    };
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Onboarding failed. Please try again.");
  }
}

export async function onboardAdmin(data: AdminOnboardingData): Promise<AdminOnboardingResponse> {
  try {
    const response = await http.publicRequest<any>("POST", "/auth/onboard", {
      token: data.token,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });
    const result = response.data;
    if (result.status === "error") throw new Error(result.message || "An error occurred");
    const responseData = result.data || {};
    return {
      success: true,
      message: result.message || "Onboarding successful!",
      user: responseData.user,
      token: responseData.token,
    };
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("Admin onboarding failed. Please try again.");
  }
}