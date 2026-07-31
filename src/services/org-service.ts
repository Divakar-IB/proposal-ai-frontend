import { api } from "@/lib/axios";
import { UserRole } from "@/types";
import type { OrgProfile, UpdateOrgProfileRequest, TeamMembersResponse, InviteTeamMemberRequest } from "@/types";

class OrgService {
  async getProfile(): Promise<OrgProfile> {
    const { data } = await api.get<OrgProfile>("/organization-settings");
    return data;
  }

  async updateProfile(payload: UpdateOrgProfileRequest): Promise<OrgProfile> {
    const { data } = await api.put<OrgProfile>("/organization-settings", payload);
    return data;
  }

  async deleteLogo(): Promise<OrgProfile> {
    const { data } = await api.delete<OrgProfile>("/organization-settings/logo");
    return data;
  }

  async uploadLogo(file: File): Promise<OrgProfile> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post<OrgProfile>("/organization-settings/logo", form, {
      headers: { "Content-Type": undefined },
    });
    return data;
  }

  async getTeamMembers(page = 1, limit = 50): Promise<TeamMembersResponse> {
    const { data } = await api.get<TeamMembersResponse>("/team/members", {
      params: { page, limit },
    });
    return data;
  }

  async inviteMember(payload: InviteTeamMemberRequest): Promise<void> {
    await api.post("/team/invite", payload);
  }

  async updateMemberRole(memberId: number, role: UserRole): Promise<void> {
    await api.patch(`/team/members/${memberId}/role`, { role });
  }

  async removeMember(memberId: number): Promise<void> {
    await api.delete(`/team/members/${memberId}`);
  }
}

export const orgService = new OrgService();
