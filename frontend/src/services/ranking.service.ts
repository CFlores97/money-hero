import { apiClient } from "@/lib/api";
import type { RankingEntry, RankingResponse } from "@/types/domain";

interface RankingApiEntry {
  position: number;
  user_id: string;
  user: {
    name: string;
    avatar: string | null;
  };
  total_xp: number;
  level: number;
  league: string;
}

interface RankingApiResponse {
  scope: "global" | "friends";
  data: RankingApiEntry[];
  myPosition: RankingApiEntry | null;
}

function mapEntry(entry: RankingApiEntry): RankingEntry {
  return {
    position: entry.position,
    userId: entry.user_id,
    name: entry.user.name,
    avatar: entry.user.avatar,
    totalXp: entry.total_xp,
    level: entry.level,
    league: entry.league,
  };
}

function mapRanking(response: RankingApiResponse): RankingResponse {
  return {
    scope: response.scope,
    data: response.data.map(mapEntry),
    myPosition: response.myPosition ? mapEntry(response.myPosition) : null,
  };
}

export function getGlobalRanking(limit = 20) {
  return apiClient
    .get<RankingApiResponse>("/ranking/global", {
      params: { limit },
    })
    .then((response) => mapRanking(response.data));
}

export function getFriendsRanking() {
  return apiClient.get<RankingApiResponse>("/ranking/friends").then((response) => mapRanking(response.data));
}
