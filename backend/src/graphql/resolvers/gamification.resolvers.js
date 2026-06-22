import { progress } from "../../modules/gamification/gamification.service.js";

function requireUser(context) {
  if (!context.user?.id) {
    throw new Error("Usuario no autenticado");
  }

  return context.user.id;
}

export const gamificationResolvers = {
  Query: {
    gamificationProgress: async (_, __, context) => {
      const userId = requireUser(context);
      return progress(userId);
    },
  },
};