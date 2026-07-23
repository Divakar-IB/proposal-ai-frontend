import { api } from "@/lib/axios";
import { UserRole } from "@/types";
import type { OrgProfile, UpdateOrgProfileRequest, TeamMember, InviteTeamMemberRequest } from "@/types";

class OrgService {
  async getProfile(): Promise<OrgProfile> {
    const { data } = await api.get<OrgProfile>("/org/profile");
    return data;
  }

  async updateProfile(payload: UpdateOrgProfileRequest): Promise<OrgProfile> {
    const { data } = await api.put<OrgProfile>("/org/profile", payload);
    return data;
  }

  async uploadLogo(file: File): Promise<OrgProfile> {
    const form = new FormData();
    form.append("logo", file);
    const { data } = await api.post<OrgProfile>("/org/logo", form, {
      headers: { "Content-Type": undefined },
    });
    return data;
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    const { data } = await api.get<TeamMember[]>("/org/members");
    return data;
  }

  async inviteMember(payload: InviteTeamMemberRequest): Promise<void> {
    await api.post("/org/invite", payload);
  }

  async updateMemberRole(memberId: number, role: UserRole): Promise<void> {
    await api.put(`/org/members/${memberId}/role`, { role });
  }

  async removeMember(memberId: number): Promise<void> {
    await api.delete(`/org/members/${memberId}`);
  }
}

export const orgService = new OrgService();
