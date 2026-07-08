import { api } from "@/lib/axios";
import type {
  Proposal,
  ProposalSection,
  CapabilityTag,
  CreateProposalRequest,
  TagCapabilitiesRequest,
  GenerateProposalRequest,
  RegenerateSectionRequest,
  ExportProposalRequest,
  ExportProposalResponse,
} from "@/types";

interface UploadRfpResponse {
  file_id: string;
  file_name: string;
  file_size: number;
}

class ProposalService {
  async uploadRfp(file: File): Promise<UploadRfpResponse> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post<UploadRfpResponse>("/proposals/rfp/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  async create(payload: CreateProposalRequest): Promise<Proposal> {
    const { data } = await api.post<Proposal>("/proposals", payload);
    return data;
  }

  async getAll(): Promise<Proposal[]> {
    const { data } = await api.get<Proposal[]>("/proposals");
    return data;
  }

  async getById(id: string): Promise<Proposal> {
    const { data } = await api.get<Proposal>(`/proposals/${id}`);
    return data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/proposals/${id}`);
  }

  async getCapabilityTags(): Promise<CapabilityTag[]> {
    const { data } = await api.get<CapabilityTag[]>("/proposals/capability-tags");
    return data;
  }

  async tagCapabilities(payload: TagCapabilitiesRequest): Promise<Proposal> {
    const { data } = await api.post<Proposal>(
      `/proposals/${payload.proposal_id}/capabilities`,
      payload
    );
    return data;
  }

  async getSections(proposalId: string): Promise<ProposalSection[]> {
    const { data } = await api.get<ProposalSection[]>(`/proposals/${proposalId}/sections`);
    return data;
  }

  async generate(payload: GenerateProposalRequest): Promise<void> {
    await api.post(`/proposals/${payload.proposal_id}/generate`, payload);
  }

  async regenerateSection(payload: RegenerateSectionRequest): Promise<ProposalSection> {
    const { data } = await api.post<ProposalSection>(
      `/proposals/sections/${payload.section_id}/regenerate`,
      payload
    );
    return data;
  }

  async updateSection(id: string, content: string): Promise<ProposalSection> {
    const { data } = await api.patch<ProposalSection>(`/proposals/sections/${id}`, { content });
    return data;
  }

  async exportProposal(payload: ExportProposalRequest): Promise<ExportProposalResponse> {
    const { data } = await api.post<ExportProposalResponse>("/proposals/export", payload);
    return data;
  }
}

export const proposalService = new ProposalService();
