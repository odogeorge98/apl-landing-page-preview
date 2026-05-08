import { http } from "@/lib/utils/http";
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
import { getOrCreateDeviceToken } from "@/lib/utils/auth/device-token";

// ─── Auth API functions ───────────────────────────────────────────────────────

// ─── Note on URL construction ─────────────────────────────────────────────────
// makeRequest prepends `${config.api.baseUrl}/admin` to every non-internal
// endpoint. So pass paths *without* the leading /admin segment:
//   "/auth/login"       →  .../admin/auth/login        (login)
//   "/auth/login-otp"   →  .../admin/auth/login-otp    (verify OTP)
//
// Verify these match your backend routes if they ever diverge from the
// /admin/* convention.
// ─────────────────────────────────────────────────────────────────────────────

export async function loginUser(data: LoginData): Promise<LoginResponse> {
  try {
    const deviceToken = getOrCreateDeviceToken();

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

    // Handle explicit OTP-required flag from the backend
    if (result.requiresOtp === true || result.data?.requiresOtp === true) {
      return {
        success: false,
        requiresOtp: true,
        message: result.message || "OTP verification required",
      };
    }

    if (result.status === "error") {
      throw new Error(result.message || "An error occurred");
    }

    const token = result.data?.token ?? result.token;
    const user = result.data ?? result.user;

    return {
      success: true,
      message: result.message || "Login successful!",
      user,
      token,
    };
  } catch (error) {
    if (error instanceof Error) {
      // Backend may signal an unrecognised device via an error message
      // rather than a structured flag — catch that case here.
      const lower = error.message.toLowerCase();
      if (
        lower.includes("otp") ||
        lower.includes("device") ||
        lower.includes("otp_required")
      ) {
        return {
          success: false,
          requiresOtp: true,
          message: error.message,
        };
      }
      throw error;
    }
    throw new Error("Login failed. Please try again.");
  }
}

export async function verifyOtp(data: VerifyOtpData): Promise<VerifyOtpResponse> {
  try {
    const deviceToken = getOrCreateDeviceToken();

    const response = await http.deviceRequest<any>(
      "POST",
      "/auth/login-otp",
      deviceToken,
      {
        email: data.email,
        password: data.password,
        otp: data.otp,
        rememberMe: data.rememberMe,
        deviceInfo: {
          deviceFCMToken: data.deviceInfo.deviceFCMToken,
          name: data.deviceInfo.name,
        },
      },
    );

    const result = response.data;

    if (result.status === "error") {
      throw new Error(result.message || "An error occurred");
    }

    const token = result.data?.token ?? result.token;
    const user = result.data ?? result.user;

    return {
      success: true,
      message: result.message || "Login successful!",
      user,
      token,
    };
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error("OTP verification failed. Please try again.");
  }
}

export async function forgetPassword(
  data: ForgetPasswordData
): Promise<ForgetPasswordResponse> {
  try {
    const response = await http.publicRequest<any>(
      "POST",
      "/auth/forget-password",
      {
        email: data.email,
      }
    );

    const result = response.data;

    if (result.status === "error") {
      const errorMessage = result.message || "An error occurred";
      throw new Error(errorMessage);
    }

    if (result.status === "success") {
      return {
        success: true,
        message: result.message || "Password reset email sent successfully!",
      };
    }

    return {
      success: true,
      message: result.message || "Password reset email sent successfully!",
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to send password reset email. Please try again.");
  }
}

export async function resetPassword(
  data: ResetPasswordData
): Promise<ResetPasswordResponse> {
  try {
    const response = await http.publicRequest<any>(
      "PATCH",
      "/auth/reset-password",
      {
        token: data.token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }
    );

    const result = response.data;

    if (result.status === "error") {
      const errorMessage = result.message || "An error occurred";
      throw new Error(errorMessage);
    }

    if (result.status === "success") {
      return {
        success: true,
        message: result.message || "Password reset successfully!",
      };
    }

    return {
      success: true,
      message: result.message || "Password reset successfully!",
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to reset password. Please try again.");
  }
}

export async function onboardUser(
  data: OnboardingData
): Promise<OnboardingResponse> {
  try {
    const response = await http.publicRequest<any>(
      "POST",
      "/organization/onboard",
      {
        token: data.token,
        businessName: data.businessName,
        businessType: data.businessType,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }
    );

    const result = response.data;

    if (result.status === "error") {
      const errorMessage = result.message || "An error occurred";
      throw new Error(errorMessage);
    }

    if (result.status === "success") {
      return {
        ...result,
        success: true,
        message: result.message || "Onboarding successful!",
        user: result.user,
        token: result.token,
      };
    }

    return {
      success: true,
      message: result.message || "Onboarding successful!",
      user: result.user,
      token: result.token,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Onboarding failed. Please try again.");
  }
}

export async function onboardAdmin(
  data: AdminOnboardingData
): Promise<AdminOnboardingResponse> {
  try {
    const response = await http.publicRequest<any>(
      "POST",
      "/auth/onboard",
      {
        token: data.token,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }
    );

    const result = response.data;

    if (result.status === "error") {
      const errorMessage = result.message || "An error occurred";
      throw new Error(errorMessage);
    }

    if (result.status === "success") {
      // Extract user and token from result.data
      const responseData = result.data || {};
      return {
        success: true,
        message: result.message || "Onboarding successful!",
        user: responseData.user,
        token: responseData.token,
      };
    }

    // Fallback for different response structure
    const responseData = result.data || result;
    return {
      success: true,
      message: result.message || "Onboarding successful!",
      user: responseData.user,
      token: responseData.token,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Admin onboarding failed. Please try again.");
  }
}
