import { api } from "@/lib/axios";
import type { KbCategory, KbDocument, PaginatedResponse, UploadDocumentRequest, UpdateDocumentRequest, CreateCategoryRequest, UpdateCategoryRequest } from "@/types";

class KbService {
  async getCategories(): Promise<KbCategory[]> {
    const { data } = await api.get<{ data: KbCategory[] }>("/category/list");
    return data.data;
  }

  async createCategory(payload: CreateCategoryRequest): Promise<KbCategory> {
    const { data } = await api.post<KbCategory>("/category", payload);
    return data;
  }

  async updateCategory(payload: UpdateCategoryRequest): Promise<KbCategory> {
    const { data } = await api.put<KbCategory>("/category", payload);
    return data;
  }

  async getDocuments(params: {
    category_id?: number;
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<KbDocument>> {
    const { data } = await api.get<PaginatedResponse<KbDocument>>("/document/list", { params });
    return data;
  }

  async getDocument(documentId: number): Promise<KbDocument> {
    const { data } = await api.get<KbDocument>(`/document/${documentId}`);
    return data;
  }

  async uploadDocument(payload: UploadDocumentRequest): Promise<KbDocument> {
    const form = new FormData();
    form.append("file", payload.file);
    form.append("document_name", payload.document_name);
    form.append("description", payload.description);
    form.append("category_id", String(payload.category_id));
    form.append("status", payload.status);
    payload.tags.forEach((tag) => form.append("tags", tag));
    const { data } = await api.post<KbDocument>("/document/upload", form, {
      headers: { "Content-Type": undefined },
    });
    return data;
  }

  async updateDocument(payload: UpdateDocumentRequest): Promise<KbDocument> {
    const form = new FormData();
    form.append("document_name", payload.document_name);
    form.append("description", payload.description);
    form.append("category_id", String(payload.category_id));
    form.append("status", payload.status);
    payload.tags.forEach((tag) => form.append("tags", tag));
    if (payload.file) form.append("file", payload.file);
    const { data } = await api.post<KbDocument>("/document/upload", form, {
      params: { document_id: payload.document_id },
      headers: { "Content-Type": undefined },
    });
    return data;
  }

  async deleteDocument(documentId: number): Promise<void> {
    await api.delete(`/document/${documentId}`, { params: { document_id: documentId } });
  }

  async downloadDocument(documentId: number, fileName: string): Promise<void> {
    const { data } = await api.get<Blob>(`/document/${documentId}/download`, { responseType: "blob" });
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const kbService = new KbService();
