import { apiClient } from "@/lib/api";
import type { Achievement } from "@/types/domain";

export function getAchievements(unlocked?: boolean) {
  const params = unlocked === undefined ? undefined : { unlocked };
  return apiClient.get<Achievement[]>("/achievements", { params }).then((response) => response.data);
}
