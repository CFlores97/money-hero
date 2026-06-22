import { supabase } from '../../config/supabase.js';
import { AppError } from '../../utils/AppError.js';
import {
  calculateLevel,
  calculateLeague
} from '../../utils/gamificationRules.js';

export async function addXp(userId, xpAmount, event = null) {
  const { data: current, error: findError } = await supabase
    .from('gamification_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (findError) {
    throw new AppError(500, findError.message);
  }

  const previousLevel = current?.level ?? 1;
  const newTotalXp = (current?.total_xp ?? 0) + xpAmount;
  const newLevel = calculateLevel(newTotalXp);
  const newLeague = calculateLeague(newLevel);

  const { data: profile, error: profileError } = await supabase
    .from('gamification_profiles')
    .upsert(
      {
        user_id: userId,
        total_xp: newTotalXp,
        level: newLevel,
        league: newLeague
      },
      {
        onConflict: 'user_id'
      }
    )
    .select('*')
    .single();

  if (profileError) {
    throw new AppError(500, profileError.message);
  }

  if (event) {
    const { error: xpEventError } = await supabase
      .from('xp_events')
      .insert({
        user_id: userId,
        source_type: event.sourceType,
        source_id: event.sourceId ?? null,
        xp_amount: xpAmount,
        description: event.description ?? null
      });

    if (xpEventError) {
      throw new AppError(500, xpEventError.message);
    }
  }

  return {
    ...profile,
    previousLevel
  };
}

export async function registerDailyActivity(userId) {
  const { data: profile, error } = await supabase
    .from('gamification_profiles')
    .select('streak_days, last_active_at')
    .eq('user_id', userId)
    .single();

  if (error) {
    throw new AppError(400, error.message);
  }

  const today = new Date().toISOString().slice(0, 10);

  const lastDay = profile.last_active_at
    ? new Date(profile.last_active_at).toISOString().slice(0, 10)
    : null;

  // El usuario ya registró actividad hoy.
  // No se debe aumentar la racha dos veces el mismo día.
  if (lastDay === today) {
    return profile;
  }

  const yesterdayDate = new Date();
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);

  const yesterday = yesterdayDate.toISOString().slice(0, 10);

  // Si fue activo ayer, continúa la racha.
  // Si no, se reinicia en 1.
  const streakDays =
    lastDay === yesterday
      ? (profile.streak_days ?? 0) + 1
      : 1;

  const { data, error: updateError } = await supabase
    .from('gamification_profiles')
    .update({
      streak_days: streakDays,
      last_active_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select('*')
    .single();

  if (updateError) {
    throw new AppError(400, updateError.message);
  }

  return data;
}

export async function progress(userId) {
  const { data: gamificationData, error: gamificationError } = await supabase
    .from('gamification_profiles')
    .select('total_xp, level, league, streak_days, last_active_at')
    .eq('user_id', userId)
    .single();

  if (gamificationError) {
    throw new AppError(404, gamificationError.message);
  }

  const xpToNextLevel =
    gamificationData.level * 250 - gamificationData.total_xp;

  const { data: xpEventsData, error: xpEventsError } = await supabase
    .from('xp_events')
    .select('xp_amount, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (xpEventsError) {
    throw new AppError(400, xpEventsError.message);
  }

  return {
    userId,
    totalXp: gamificationData.total_xp,
    level: gamificationData.level,
    league: gamificationData.league,
    streakDays: gamificationData.streak_days,
    xpToNextLevel,
    recentXpGained: xpEventsData?.xp_amount ?? 0
  };
}