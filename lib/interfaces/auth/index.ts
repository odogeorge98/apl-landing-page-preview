export interface LoginData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}
export interface User {
  id: string;
  email: string;
  role: string;
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

// export interface LoginResponse {
//   success: boolean;
//   message?: string;
//   token: string;
//   user: User;
// }

export interface LoginResponse {
  success: boolean;
  message?: string;
  /** Present when login succeeded and a token was issued. */
  user?: AuthUser;
  token?: string;
  /**
   * True when the backend recognised the credentials but doesn't know this
   * device yet — an OTP has been sent and the user must verify via /verify-otp.
   */
  requiresOtp?: boolean;
}

// ─── Verify OTP ───────────────────────────────────────────────────────────────

export interface DeviceInfo {
  /** FCM push token — send empty string if not applicable. */
  deviceFCMToken: string;
  /** Human-readable device name, max 50 chars (backend DTO constraint). */
  name: string;
}

export interface VerifyOtpData {
  email: string;
  password: string;
  otp: string;
  rememberMe: boolean;
  deviceInfo: DeviceInfo;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  user?: any;
  token: string;
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
