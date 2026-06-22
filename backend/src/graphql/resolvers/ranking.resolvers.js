import { supabase } from '../../config/supabase.js';

function requireUser(context) {
  if (!context.user?.id) {
    throw new Error('Usuario no autenticado');
  }

  return context.user.id;
}

export const rankingResolvers = {
  Query: {
    rankingGlobal: async (_, args, context) => {
      const userId = requireUser(context);
      const limit = args.limit ?? 10;

      const { data, error } = await supabase
        .from('gamification_profiles')
        .select(`
          user_id,
          total_xp,
          level,
          league,
          users(id, name, avatar)
        `)
        .order('total_xp', { ascending: false });

      if (error) throw new Error(error.message);

      const ranked = (data ?? []).map((row, index) => ({
        position: index + 1,
        userId: row.user_id,
        name: row.users?.name ?? 'Usuario',
        avatar: row.users?.avatar ?? null,
        totalXp: row.total_xp ?? 0,
        level: row.level ?? 1,
        league: row.league ?? 'Aprendiz'
      }));

      const myPosition =
        ranked.find((item) => item.userId === userId)?.position ?? null;

      return {
        myPosition,
        users: ranked.slice(0, limit)
      };
    }
  }
};