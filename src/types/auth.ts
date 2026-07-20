export enum UserRole {
  OrgAdmin = "org_admin",
  Member = "member",
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface UpdateProfileRequest {
  name: string;
}

export interface ResetPasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  message: string;
  reset_token: string;
}

export interface NewPasswordRequest {
  reset_token: string;
  new_password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  role: UserRole;
}
