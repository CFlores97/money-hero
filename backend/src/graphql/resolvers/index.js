import { dashboardResolvers } from './dashboard.resolvers.js';
import { rankingResolvers } from './ranking.resolvers.js';
import { achievementResolvers } from './achievement.resolvers.js';

export const resolvers = {
  Query: {
    ...dashboardResolvers.Query,
    ...rankingResolvers.Query,
    ...achievementResolvers.Query
  }
};