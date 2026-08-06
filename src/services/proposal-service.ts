import Cookies from "js-cookie";
import { api } from "@/lib/axios";
import { downloadBlob } from "@/lib/download";
import type {
  Proposal,
  ProposalListParams,
  ProposalStats,
  ProposalDetail,
  ProposalState,
  Template,
  UploadRequirementDocumentRequest,
  UploadRequirementDocumentResponse,
  GenerateProposalRequest,
  ExportProposalRequest,
  UpdateSectionsRequest,
  SendEmailRequest,
  UpdateStatusRequest,
} from "@/types";
import type { PaginatedResponse } from "@/types";

class ProposalService {
  async uploadRequirementDocument(
    payload: UploadRequirementDocumentRequest,
  ): Promise<UploadRequirementDocumentResponse> {
    const form = new FormData();
    payload.files.forEach((f) => form.append("files", f));
    form.append("proposal_name", payload.proposal_name);
    form.append("client_name", payload.client_name);
    if (payload.additional_context) {
      form.append("additional_context", payload.additional_context);
    }
    const { data } = await api.post<UploadRequirementDocumentResponse>(
      "/proposal/requirement-documents",
      form,
      { headers: { "Content-Type": undefined } },
    );
    return data;
  }

  async getAll(params?: ProposalListParams): Promise<PaginatedResponse<Proposal>> {
    const { data } = await api.get<PaginatedResponse<Proposal>>("/proposal", { params });
    return data;
  }

  async getStats(): Promise<ProposalStats> {
    const { data } = await api.get<ProposalStats>("/proposal/stats");
    return data;
  }

  async getTemplates(): Promise<Template[]> {
    const { data } = await api.get<Template[]>("/proposal/templates");
    return data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/proposal/${id}`);
  }

  async getProposalState(proposalId: string): Promise<ProposalState> {
    const { data } = await api.get<ProposalState>(`/proposal/${proposalId}/state`);
    return data;
  }

  async getProposalSections(proposalId: string): Promise<ProposalDetail> {
    const { data } = await api.get<ProposalDetail>(`/proposal/${proposalId}/sections`);
    return data;
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

    const response = await fetch(`${baseURL}/proposal/generate`, {
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
            if (eventType === "error") callbacks.onError(new Error(parsed.message ?? "Generation failed"));
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

  async updateProposalSections(payload: UpdateSectionsRequest): Promise<void> {
    const { proposal_id, ...body } = payload;
    await api.patch(`/proposal/${proposal_id}/sections`, body);
  }

  async exportProposal(payload: ExportProposalRequest): Promise<void> {
    const { proposal_id, ...body } = payload;
    const response = await api.post(`/proposal/${proposal_id}/export`, body, {
      responseType: "blob",
    });
    downloadBlob(response.data, `proposal_${proposal_id}.${payload.format}`, payload.format);
  }

  async sendEmail(payload: SendEmailRequest): Promise<void> {
    const { proposal_id, ...body } = payload;
    await api.post(`/proposal/${proposal_id}/export/email`, body);
  }

  async updateStatus(payload: UpdateStatusRequest): Promise<void> {
    await api.patch(`/proposal/${payload.proposal_id}/status`, null, {
      params: { status: payload.status },
    });
  }
}

export const proposalService = new ProposalService();
