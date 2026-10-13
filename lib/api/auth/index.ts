
import { http } from "@/lib/utils/http";
import {
  LoginData,
  LoginApiResponse,
  LoginResponse,
  ForgetPasswordData,
  ForgetPasswordResponse,
  ResetPasswordData,
  ResetPasswordResponse,
  OnboardingData,
  OnboardingResponse,
  AdminOnboardingData,
  AdminOnboardingResponse,
} from "@/lib/interfaces/auth";

/**
 * POST /auth
 *
 * Authenticates an administrator, tutor, or student.
 *
 * The backend returns:
 * {
 *   status: "success",
 *   statusCode: 200,
 *   message: "Login successful",
 *   data: {
 *     token: string,
 *     user: { id: string, role: string, email: string }
 *   }
 * }
 */
export async function loginUser(
  data: LoginData,
): Promise<LoginResponse> {
  try {
    const response = await http.publicRequest<LoginApiResponse>(
      "POST",
      "/auth",
      {
        email: data.email.trim(),
        password: data.password,
        rememberMe: data.rememberMe ?? false,
      },
    );

    const result = response.data;

    if (result.status !== "success") {
      throw new Error(result.message || "Unable to sign in.");
    }

    const token = result.data?.token;
    const user = result.data?.user;

    if (!token || !user?.id || !user?.email || !user?.role) {
      throw new Error(
        "The server returned an incomplete authentication response.",
      );
    }

    return {
      success: true,
      message: result.message || "Login successful!",
      user: {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      token,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Login failed. Please try again.");
  }
}

/**
 * POST /auth/forget-password
 */
export async function forgetPassword(
  data: ForgetPasswordData,
): Promise<ForgetPasswordResponse> {
  try {
    const response = await http.publicRequest<{
      status: string;
      message?: string;
    }>("POST", "/auth/forget-password", {
      email: data.email.trim(),
    });

    const result = response.data;

    if (result.status === "error") {
      throw new Error(
        result.message || "Unable to request a password reset.",
      );
    }

    return {
      success: true,
      message: result.message || "Password reset email sent successfully!",
    };
  } catch (error: unknown) {
    if (error instanceof Error) throw error;
    throw new Error("Failed to send password reset email. Please try again.");
  }
}

/**
 * PATCH /auth/reset-password
 */
export async function resetPassword(
  data: ResetPasswordData,
): Promise<ResetPasswordResponse> {
  try {
    const response = await http.publicRequest<{
      status: string;
      message?: string;
    }>("PATCH", "/auth/reset-password", {
      token: data.token,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });

    const result = response.data;

    if (result.status === "error") {
      throw new Error(result.message || "Unable to reset your password.");
    }

    return {
      success: true,
      message: result.message || "Password reset successfully!",
    };
  } catch (error: unknown) {
    if (error instanceof Error) throw error;
    throw new Error("Failed to reset password. Please try again.");
  }
}

/**
 * POST /organization/onboard
 */
export async function onboardUser(
  data: OnboardingData,
): Promise<OnboardingResponse> {
  try {
    const response = await http.publicRequest<{
      status: string;
      message?: string;
      data?: {
        token?: string;
        user?: OnboardingResponse["user"];
      };
      token?: string;
      user?: OnboardingResponse["user"];
    }>("POST", "/organization/onboard", {
      token: data.token,
      businessName: data.businessName,
      businessType: data.businessType,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });

    const result = response.data;

    if (result.status === "error") {
      throw new Error(result.message || "Onboarding failed.");
    }

    return {
      success: true,
      message: result.message || "Onboarding successful!",
      token: result.data?.token ?? result.token,
      user: result.data?.user ?? result.user,
    };
  } catch (error: unknown) {
    if (error instanceof Error) throw error;
    throw new Error("Onboarding failed. Please try again.");
  }
}

/**
 * POST /auth/onboard
 */
export async function onboardAdmin(
  data: AdminOnboardingData,
): Promise<AdminOnboardingResponse> {
  try {
    const response = await http.publicRequest<{
      status: string;
      message?: string;
      data?: {
        token?: string;
        user?: AdminOnboardingResponse["user"];
      };
      token?: string;
      user?: AdminOnboardingResponse["user"];
    }>("POST", "/auth/onboard", {
      token: data.token,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
    });

    const result = response.data;

    if (result.status === "error") {
      throw new Error(result.message || "Admin onboarding failed.");
    }

    return {
      success: true,
      message: result.message || "Onboarding successful!",
      token: result.data?.token ?? result.token,
      user: result.data?.user ?? result.user,
    };
  } catch (error: unknown) {
    if (error instanceof Error) throw error;
    throw new Error("Admin onboarding failed. Please try again.");
  }
}
