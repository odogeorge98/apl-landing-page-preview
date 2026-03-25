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
} from "@/lib/interfaces/auth";

export async function loginUser(data: LoginData): Promise<LoginResponse> {
  try {
    const response = await http.publicRequest<any>("POST", "/auth/login", {
      email: data.email,
      password: data.password,
    });

    const result = response.data;

    if (result.status === "error") {
      const errorMessage = result.message || "An error occurred";
      throw new Error(errorMessage);
    }

    // Handle both possible response structures
    const user = result.data?.user || result.user;
    const token = result.data?.token || result.token;

    if (result.status === "success") {
      return {
        success: true,
        message: result.message || "Login successful!",
        user: user,
        token: token,
      };
    }

    return {
      success: true,
      message: result.message || "Login successful!",
      user: user,
      token: token,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Login failed. Please try again.");
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
