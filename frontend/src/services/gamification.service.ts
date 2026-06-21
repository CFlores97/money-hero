import { apiClient } from "@/lib/api";
import type { GamificationProgress } from "@/types/domain";

export function getProgress() {
  return apiClient.get<GamificationProgress>("/gamification/progress").then((response) => response.data);
}
