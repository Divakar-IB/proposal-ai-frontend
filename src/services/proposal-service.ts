import Cookies from "js-cookie";
import { api } from "@/lib/axios";
import { downloadBlob } from "@/lib/download";
import type {
  Proposal,
  ProposalListParams,
  ProposalSection,
  ProposalDetail,
  ProposalState,
  Template,
  CapabilityTag,
  UploadRequirementDocumentRequest,
  UploadRequirementDocumentResponse,
  TagCapabilitiesRequest,
  GenerateProposalRequest,
  RegenerateSectionRequest,
  ExportProposalRequest,
  UpdateSectionsRequest,
} from "@/types";
import type { PaginatedResponse } from "@/types";

class ProposalService {
  async uploadRequirementDocument(
    payload: UploadRequirementDocumentRequest,
  ): Promise<UploadRequirementDocumentResponse> {
    const form = new FormData();
    form.append("file", payload.file);
    form.append("proposal_name", payload.proposal_name);
    form.append("client_name", payload.client_name);
    if (payload.additional_context) {
      form.append("additional_context", payload.additional_context);
    }
    const { data } = await api.post<UploadRequirementDocumentResponse>(
      "/proposals/requirement-documents",
      form,
      { headers: { "Content-Type": undefined } },
    );
    return data;
  }

  async getAll(params?: ProposalListParams): Promise<PaginatedResponse<Proposal>> {
    const { data } = await api.get<PaginatedResponse<Proposal>>("/proposals", { params });
    return data;
  }

  async getDetail(id: string): Promise<ProposalDetail> {
    const { data } = await api.get<ProposalDetail>(`/proposals/${id}`);
    return data;
  }

  async getTemplates(): Promise<Template[]> {
    const { data } = await api.get<Template[]>("/proposals/templates");
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

  async getProposalState(proposalId: string): Promise<ProposalState> {
    const { data } = await api.get<ProposalState>("/proposal-state", { params: { proposal_id: proposalId } });
    return data;
  }

  async getProposalSections(proposalId: string): Promise<ProposalDetail> {
    const { data } = await api.get<ProposalDetail>("/proposal-sections", { params: { proposal_id: proposalId } });
    return data;
  }

  async generate(payload: GenerateProposalRequest): Promise<void> {
    await api.post(`/proposals/generate`, payload);
  }

  async generateStream(
    payload: GenerateProposalRequest,
    callbacks: {
      onSectionStart: (name: string) => void;
      onSectionChunk: (name: string, content: string) => void;
      onSectionDone: (name: string) => void;
      onDone: () => void;
      onError: (error: Error) => void;
    },
    signal?: AbortSignal,
  ): Promise<void> {
    const token = Cookies.get("a_token");
    const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "";

    const response = await fetch(`${baseURL}/proposals/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      callbacks.onError(new Error(`Generation failed: ${response.status}`));
      return;
    }

    if (!response.body) {
      callbacks.onError(new Error("No response body"));
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let currentSection = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          let eventType = "";
          let data = "";

          for (const line of part.split("\n")) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim();
            if (line.startsWith("data: ")) data = line.slice(6).trim();
          }

          if (!eventType || !data) continue;

          try {
            const parsed = JSON.parse(data);
            if (eventType === "section_start") {
              currentSection = parsed.name;
              callbacks.onSectionStart(parsed.name);
            }
            if (eventType === "section_chunk") callbacks.onSectionChunk(currentSection, parsed.content);
            if (eventType === "section_done") callbacks.onSectionDone(currentSection);
            if (eventType === "done") callbacks.onDone();
          } catch {
            // malformed event — skip
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        callbacks.onError(err as Error);
      }
    }
  }

  async regenerateSection(payload: RegenerateSectionRequest): Promise<ProposalSection> {
    const { data } = await api.post<ProposalSection>(
      `/proposals/sections/${payload.section_id}/regenerate`,
      payload
    );
    return data;
  }

  async updateProposalSections(payload: UpdateSectionsRequest): Promise<void> {
    const { proposal_id, ...body } = payload;
    await api.patch("/proposal-sections", body, { params: { proposal_id } });
  }

  async exportProposal(payload: ExportProposalRequest): Promise<void> {
    const { proposal_id, ...body } = payload;
    const response = await api.post(`/proposals/${proposal_id}/export`, body, {
      responseType: "blob",
    });
    downloadBlob(response.data, `proposal_${proposal_id}.${payload.format}`, payload.format);
  }
}

export const proposalService = new ProposalService();
