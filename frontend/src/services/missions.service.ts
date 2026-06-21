import { apiClient } from "@/lib/api";
import type { ApiMessageResponse, Mission, MissionFrequency, MissionStatus } from "@/types/domain";

export function getMissions(filters: { frequency?: MissionFrequency; status?: MissionStatus } = {}) {
  return apiClient
    .get<Mission[]>("/missions", {
      params: filters,
    })
    .then((response) => response.data);
}

export function completeMission(id: string) {
  return apiClient
    .post<
      ApiMessageResponse & {
        xpEarned: number;
        newTotalXp: number;
        levelUp: boolean;
        newLevel: number | null;
      }
    >(`/missions/${id}/complete`)
    .then((response) => response.data);
}
