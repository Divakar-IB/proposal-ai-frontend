export enum UserRole {
  OrgAdmin = "org_admin",
  Member = "member",
}

export interface ResetPasswordRequest {
  current_password: string;
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
