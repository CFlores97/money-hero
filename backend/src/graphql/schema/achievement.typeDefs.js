export const achievementTypeDefs = `
  type Achievement {
    id: ID
    title: String
    description: String
    icon: String
    criteria: String
    unlockedAt: String
    unlocked: Boolean
  }

  extend type Query {
    achievements(unlocked: Boolean): [Achievement]
  }
`;