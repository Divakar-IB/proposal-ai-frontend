import type { UserRole } from "./auth";

export interface OrgProfile {
  id: number;
  organization_name: string;
  logo_url?: string;
  default_signee_name?: string;
  default_signee_designation?: string;
  contact_email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateOrgProfileRequest {
  organization_name: string;
  contact_email?: string;
  default_signee_name?: string;
  default_signee_designation?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  created_at: string;
}

export interface TeamMembersResponse {
  page: number;
  limit: number;
  total_pages: number;
  total: number;
  data: TeamMember[];
}

export interface InviteTeamMemberRequest {
  email: string;
  role: UserRole;
}
