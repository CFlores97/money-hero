import { apiClient } from "@/lib/api";
import type { CreateGoalInput, Goal } from "@/types/domain";

export function getGoals(status?: "active" | "completed" | "failed") {
  const params = status ? { status } : undefined;
  return apiClient.get<Goal[]>("/goals", { params }).then((response) => response.data);
}

export function createGoal(payload: CreateGoalInput) {
  return apiClient.post<Goal>("/goals", payload).then((response) => response.data);
}

export function updateGoalProgress(id: string, amount: number) {
  return apiClient.patch<Goal>(`/goals/${id}/progress`, { amount }).then((response) => response.data);
}

export function deleteGoal(id: string) {
  return apiClient.delete(`/goals/${id}`).then(() => undefined);
}
