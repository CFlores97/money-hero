export const rankingTypeDefs = `
  type RankingUser {
    position: Int
    userId: ID
    name: String
    avatar: String
    totalXp: Int
    level: Int
    league: String
  }

  type RankingResult {
    myPosition: Int
    users: [RankingUser]
  }

  extend type Query {
    rankingGlobal(limit: Int): RankingResult
  }
`;