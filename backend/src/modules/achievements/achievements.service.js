import { supabase } from '../../config/supabase.js';
import { AppError } from '../../utils/AppError.js';
import { createNotification } from '../notifications/notifications.service.js';

async function getUserMetrics(userId) {
  const [
    { count: transactionsCount, error: transactionsError },
    { data: profile, error: profileError },
    { count: goalsCompleted, error: goalsError }
  ] = await Promise.all([
    supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),

    supabase
      .from('gamification_profiles')
      .select('streak_days')
      .eq('user_id', userId)
      .maybeSingle(),

    supabase
      .from('goals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed')
  ]);

  if (transactionsError) {
    throw new AppError(500, transactionsError.message);
  }

  if (profileError) {
    throw new AppError(500, profileError.message);
  }

  if (goalsError) {
    throw new AppError(500, goalsError.message);
  }

  return {
    transactions_count: transactionsCount ?? 0,
    streak_days: profile?.streak_days ?? 0,
    goals_completed: goalsCompleted ?? 0
  };
}

export async function evaluateAchievements(userId) {
  const metrics = await getUserMetrics(userId);

  const { data: achievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*');

  if (achievementsError) {
    throw new AppError(500, achievementsError.message);
  }

  const unlockedNow = [];

  for (const achievement of achievements ?? []) {
    const currentValue = metrics[achievement.criteria_key];

    if (
      currentValue === undefined ||
      currentValue < achievement.criteria_value
    ) {
      continue;
    }

    const { data: existingAchievement, error: existingError } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', achievement.id)
      .maybeSingle();

    if (existingError) {
      throw new AppError(500, existingError.message);
    }

    // Ya estaba desbloqueado: no crear otro registro ni otra notificación.
    if (existingAchievement) {
      continue;
    }

    const { error: unlockError } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievement.id
      });

    if (unlockError) {
      throw new AppError(500, unlockError.message);
    }

    await createNotification(userId, {
      type: 'achievement_unlocked',
      message: `Logro desbloqueado: ${achievement.title}`
    });

    unlockedNow.push(achievement);
  }

  return unlockedNow;
}

export async function getAchievements(userId, unlocked) {
  const [
    { data: achievements, error: achievementsError },
    { data: userAchievements, error: userAchievementsError }
  ] = await Promise.all([
    supabase
      .from('achievements')
      .select('*')
      .order('created_at', { ascending: true }),

    supabase
      .from('user_achievements')
      .select('achievement_id, unlocked_at')
      .eq('user_id', userId)
  ]);

  if (achievementsError) {
    throw new AppError(500, achievementsError.message);
  }

  if (userAchievementsError) {
    throw new AppError(500, userAchievementsError.message);
  }

  const unlockedMap = new Map(
    (userAchievements ?? []).map((row) => [
      row.achievement_id,
      row.unlocked_at
    ])
  );

  const result = (achievements ?? []).map((achievement) => {
    const unlockedAt = unlockedMap.get(achievement.id) ?? null;

    return {
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      criteria: `${achievement.criteria_key} >= ${achievement.criteria_value}`,
      unlockedAt,
      unlocked: unlockedAt !== null
    };
  });

  if (unlocked === true) {
    return result.filter((achievement) => achievement.unlocked);
  }

  return result;
}