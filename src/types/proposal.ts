export type ProposalStatus = "draft" | "generating" | "review" | "complete";
export type ProposalFocus = "concise" | "standard" | "detailed" | "executive";
export type ProposalSectionStatus = "pending" | "generating" | "done" | "error";
export type ExportFormat = "pdf" | "docx" | "pptx";

export interface Proposal {
  id: string;
  client_name: string;
  project_name: string;
  status: ProposalStatus;
  focus: ProposalFocus | null;
  rfp_file_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalSection {
  id: string;
  proposal_id: string;
  name: string;
  content: string | null;
  order: number;
  status: ProposalSectionStatus;
  word_count: number;
  kb_source_ids: string[];
}

export interface CapabilityTag {
  id: string;
  name: string;
  category: string;
}

export interface CreateProposalRequest {
  client_name: string;
  project_name: string;
  rfp_file_id: string;
  notes?: string;
}

export interface TagCapabilitiesRequest {
  proposal_id: string;
  tag_ids: string[];
  compliance_frameworks: string[];
  focus: ProposalFocus;
}

export interface GenerateProposalRequest {
  proposal_id: string;
  sections: string[];
}

export interface RegenerateSectionRequest {
  section_id: string;
  instruction: string;
}

export interface ExportProposalRequest {
  proposal_id: string;
  template_id: string;
  format: ExportFormat;
}

export interface ExportProposalResponse {
  download_url: string;
  expires_at: string;
}
