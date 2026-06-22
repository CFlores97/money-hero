import { getAchievements } from '../../modules/achievements/achievements.service.js';

function requireUser(context) {
  if (!context.user?.id) {
    throw new Error('Usuario no autenticado');
  }

  return context.user.id;
}

export const achievementResolvers = {
  Query: {
    achievements: async (_, args, context) => {
      const userId = requireUser(context);
      return getAchievements(userId, args.unlocked);
    }
  }
};