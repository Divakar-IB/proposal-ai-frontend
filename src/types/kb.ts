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
