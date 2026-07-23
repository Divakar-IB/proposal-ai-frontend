export type ProposalStatus = "inprogress" | "generating" | "review" | "approved" | "done" | "failed";
export type GenerationMode = "llm_only" | "knowledge_augmented";
export type ProposalFocus = "concise" | "standard" | "detailed" | "executive";
export type ProposalSectionStatus = "pending" | "generating" | "done" | "error";
export type ExportFormat = "pdf" | "docx";

export interface Proposal {
  id: number;
  title: string;
  client_name: string;
  status: ProposalStatus;
  generation_mode: GenerationMode;
  page_count: number;
  is_approved: boolean;
  user_id: number;
  requirement_document_ids: number[];
  created_at: string;
  additional_context?: string;
  error_message?: string;
}

export interface ProposalListParams {
  search?: string;
  status?: ProposalStatus;
  created_by?: string;
  created_from?: string;
  created_to?: string;
  page?: number;
  limit?: number;
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
  order: number;
}

export interface UpdateSectionsRequest {
  proposal_id: string;
  sections: Array<{ id: number; order: number }>;
}

export interface ProposalDetail {
  id: number;
  title: string;
  client_name: string;
  status: string;
  sections: ProposalDetailSection[];
}

export interface ProposalState {
  proposal_id: number;
  current_step: "upload" | "generation" | "review" | "export";
  proposal_details: {
    proposal_name: string;
    client_name: string;
    additional_context: string | null;
    files: Array<{
      id: number;
      file_name: string;
      summary: string | null;
      knowledge_matches: KnowledgeMatch[];
    }>;
  };
  summary: {
    summary: string;
    knowledge_matches: KnowledgeMatch[];
    capability_tags: Array<{ name: string; confidence: number }>;
  } | null;
  generation_config: {
    generation_mode: GenerationMode;
    page_count: number;
  } | null;
  generation: {
    status: "generating" | "done" | "failed";
  } | null;
}
