import type { UserType } from "@/lib/types/users";

/**
 * Authentication and account interfaces for the Nugi Innovations portal.
 */

export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Minimal authenticated identity returned by POST /auth.
 * This is the user object persisted by the authentication store.
 */
export interface AuthUser {
  id: string;
  role: UserType;
  email: string;
}

/**
 * Backend envelope returned by the login endpoint.
 */
export interface LoginApiResponse {
  status: "success" | "error";
  statusCode: number;
  message: string;
  data?: {
    token: string;
    user: AuthUser;
  };
}

/**
 * Normalized response consumed by React Query and Zustand.
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  user?: AuthUser;
  token?: string;
}

/**
 * Keep this interface if other existing application screens
 * require the extended user/organization information.
 *
 * It is intentionally separate from AuthUser because the login
 * endpoint does not return these additional properties.
 */
export interface User {
  id: string;
  email: string;
  role: UserType;
  orgRole: string;
  isVerified: boolean;
  isActive: boolean;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  organization: {
    id: string;
    name: string;
    type: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface LoginError {
  message: string;
  field?: string;
}

export interface ForgetPasswordData {
  email: string;
}

export interface ForgetPasswordResponse {
  success: boolean;
  message?: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message?: string;
}

export interface OnboardingData {
  token: string;
  businessName: string;
  businessType: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface OnboardingResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

export interface AdminOnboardingData {
  token: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AdminOnboardingResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}
