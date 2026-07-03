import Cookies from "js-cookie";
import { api } from "@/lib/axios";
import type { LoginRequest, LoginResponse } from "@/types";

const COOKIE_OPTIONS = { expires: 7, secure: true, sameSite: "strict" } as const;

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", credentials);
    Cookies.set("a_token", data.access_token, COOKIE_OPTIONS);
    Cookies.set("r_token", data.refresh_token, COOKIE_OPTIONS);
    Cookies.set("role", data.role, COOKIE_OPTIONS);
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

  getRole(): string | undefined {
    return Cookies.get("role");
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

export const authService = new AuthService();
