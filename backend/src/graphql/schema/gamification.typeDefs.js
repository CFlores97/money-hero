export const gamificationTypeDefs = `
  type GamificationProgress {
    userId: ID
    totalXp: Int
    level: Int
    league: String
    streakDays: Int
    xpToNextLevel: Int
    recentXpGained: Int
  }

  extend type Query {
    gamificationProgress: GamificationProgress
  }
`;