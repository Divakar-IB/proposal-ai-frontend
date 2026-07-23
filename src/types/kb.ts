export interface KbCategory {
  id: number;
  name: string;
  description: string;
  document_count: number;
}

export interface CreateCategoryRequest {
  name: string;
  description: string;
}

export interface UpdateCategoryRequest {
  id: number;
  name: string;
  description: string;
}

export enum DocumentStatus {
  Active   = "active",
  Inactive = "inactive",
}

export interface PaginatedResponse<T> {
  page: number;
  limit: number;
  total_pages: number;
  total: number;
  data: T[];
}

export interface KbDocument {
  id: number;
  document_name: string;
  description: string;
  file_name: string;
  extension: string;
  category_id: number;
  category_name: string;
  user_id: number;
  version: number;
  status: string;
  availability_status: string;
  tags: string[];
  url: string;
  created_at: string;
}

export interface UploadDocumentRequest {
  file: File;
  document_name: string;
  description: string;
  category_id: number;
  status: DocumentStatus;
  tags: string[];
}

export interface UpdateDocumentRequest {
  document_id: number;
  file?: File;
  document_name: string;
  description: string;
  category_id: number;
  status: DocumentStatus;
  tags: string[];
}
