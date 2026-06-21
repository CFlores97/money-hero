import { apiClient } from "@/lib/api";
import type { Category } from "@/types/domain";

export function getCategories(type?: "income" | "expense") {
  const params = type ? { type } : undefined;
  return apiClient.get<Category[]>("/categories", { params }).then((response) => response.data);
}
