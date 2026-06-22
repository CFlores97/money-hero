import { apiClient } from "@/lib/api";
import type { RankingEntry, RankingResponse } from "@/types/domain";

interface GraphQLRankingUser {
  position: number;
  userId: string;
  name: string;
  avatar: string | null;
  totalXp: number;
  level: number;
  league: string;
}

interface GraphQLRankingResponse {
  data: {
    rankingGlobal: {
      myPosition: number | null;
      users: GraphQLRankingUser[];
    };
  };
  errors?: { message: string }[];
}

const GLOBAL_RANKING_QUERY = `
  query RankingGlobal($limit: Int) {
    rankingGlobal(limit: $limit) {
      myPosition
      users {
        position
        userId
        name
        avatar
        totalXp
        level
        league
      }
    }
  }
`;

function mapEntry(entry: GraphQLRankingUser): RankingEntry {
  return {
    position: entry.position,
    userId: entry.userId,
    name: entry.name,
    avatar: entry.avatar,
    totalXp: entry.totalXp,
    level: entry.level,
    league: entry.league,
  };
}

export async function getGlobalRanking(limit = 20): Promise<RankingResponse> {
  const response = await apiClient.post<GraphQLRankingResponse>("/graphql", {
    query: GLOBAL_RANKING_QUERY,
    variables: { limit },
  });

  if (response.data.errors?.length) {
    throw new Error(response.data.errors[0].message);
  }

  const ranking = response.data.data.rankingGlobal;
  const entries = ranking.users.map(mapEntry);
  const myEntry = entries.find((entry) => entry.position === ranking.myPosition) ?? null;

  return {
    scope: "global",
    data: entries,
    myPosition: myEntry,
  };
}

export async function getFriendsRanking(): Promise<RankingResponse> {
  return {
    scope: "friends",
    data: [],
    myPosition: null,
  };
}