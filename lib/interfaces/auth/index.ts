export interface LoginData {
  email: string;
  password: string;
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

export interface LoginResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
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
