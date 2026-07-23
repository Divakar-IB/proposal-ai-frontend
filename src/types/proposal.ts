export type ProposalStatus = "draft" | "generating" | "review" | "complete";
export type GenerationMode = "llm_only" | "knowledge_augmented";
export type ProposalFocus = "concise" | "standard" | "detailed" | "executive";
export type ProposalSectionStatus = "pending" | "generating" | "done" | "error";
export type ExportFormat = "pdf" | "docx";

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

export interface UploadRequirementDocumentRequest {
  file: File;
  proposal_name: string;
  client_name: string;
  additional_context?: string;
}

export interface KnowledgeMatch {
  document_id: number;
  title: string;
  source_filename: string;
  breadcrumb: string;
  match_percent: number;
}

export interface UploadRequirementDocumentResponse {
  id: number;
  proposal_id: number;
  file_name: string;
  extension: string;
  user_id: number;
  proposal_name: string;
  client_name: string;
  additional_context: string | null;
  status: string;
  summary: string | null;
  knowledge_matches: KnowledgeMatch[];
  created_at: string;
}

export interface TagCapabilitiesRequest {
  proposal_id: string;
  use_knowledge_base: boolean;
  focus: ProposalFocus;
}

export interface GenerateProposalRequest {
  proposal_id: string;
  page_count: number;
  generation_mode: GenerationMode;
}

export interface RegenerateSectionRequest {
  section_id: string;
  instruction: string;
}

export interface ExportProposalRequest {
  proposal_id: string;
  template_id: number;
  format: ExportFormat;
}

export interface ExportProposalResponse {
  download_url: string;
  expires_at: string;
}

export interface Template {
  id: number;
  name: string;
  description: string;
  preview_url: string;
}

export interface ProposalDetailSection {
  id: number;
  title: string;
  content: string;
}

export interface ProposalDetail {
  id: number;
  title: string;
  client_name: string;
  status: string;
  sections: ProposalDetailSection[];
}
