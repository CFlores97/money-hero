import { apiClient } from "@/lib/api";
import type { Budget, CreateBudgetInput } from "@/types/domain";

export function createBudget(payload: CreateBudgetInput) {
  return apiClient.post<Budget>("/budgets", payload).then((response) => response.data);
}

export function getCurrentBudget() {
  return apiClient.get<Budget>("/budgets/current").then((response) => response.data);
}

export function deleteBudget(id: string) {
  return apiClient.delete(`/budgets/${id}`).then(() => undefined);
}
