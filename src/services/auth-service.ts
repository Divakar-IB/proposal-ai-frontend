import Cookies from "js-cookie";
import { api } from "@/lib/axios";
import { UserRole } from "@/types";
import type { LoginRequest, LoginResponse, ResetPasswordRequest, ForgotPasswordRequest, VerifyOtpRequest, VerifyOtpResponse, NewPasswordRequest, UserProfile, UpdateProfileRequest } from "@/types";

const COOKIE_OPTIONS = { expires: 7, secure: true, sameSite: "strict" } as const;

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", credentials);
    Cookies.set("a_token", data.access_token, COOKIE_OPTIONS);
    Cookies.set("r_token", data.refresh_token, COOKIE_OPTIONS);
    Cookies.set("role", data.role, COOKIE_OPTIONS);
    return data;
  }

  async resetPassword(payload: ResetPasswordRequest): Promise<void> {
    await api.post("/auth/reset_password", payload);
  }

  async forgotPassword(payload: ForgotPasswordRequest): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>("/auth/forgot_password", payload);
    return data;
  }

  async verifyOtp(payload: VerifyOtpRequest): Promise<VerifyOtpResponse> {
    const { data } = await api.post<VerifyOtpResponse>("/auth/verify_otp", payload);
    return data;
  }

  async setNewPassword(payload: NewPasswordRequest): Promise<{ message: string }> {
    const { data } = await api.post<{ message: string }>("/auth/new_password", payload);
    return data;
  }

  async getProfile(): Promise<UserProfile> {
    const { data } = await api.get<UserProfile>("/auth/profile");
    return data;
  }

  async updateProfile(payload: UpdateProfileRequest): Promise<UserProfile> {
    const { data } = await api.put<UserProfile>("/auth/profile", payload);
    return data;
  }

  logout(): void {
    Cookies.remove("a_token");
    Cookies.remove("r_token");
    Cookies.remove("role");
    window.location.href = "/auth/login";
  }

  getAccessToken(): string | undefined {
    return Cookies.get("a_token");
  }

  getRole(): UserRole | undefined {
    return Cookies.get("role") as UserRole | undefined;
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
