import { api } from "@/lib/axios";
import type { KbCategory, CreateCategoryRequest, UpdateCategoryRequest } from "@/types";

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
    const { data } = await api.post<KbCategory>("/category", payload);
    return data;
  }
}

export const kbService = new KbService();
