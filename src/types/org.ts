import type { UserRole } from "./auth";

export interface OrgProfile {
  id: number;
  name: string;
  logo_url?: string;
  default_signee_name?: string;
  default_signee_designation?: string;
  contact_email?: string;
}

export interface UpdateOrgProfileRequest {
  name: string;
  default_signee_name?: string;
  default_signee_designation?: string;
  contact_email?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface InviteTeamMemberRequest {
  email: string;
  role: UserRole;
}
