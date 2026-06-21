import { supabase } from '../../config/supabase.js';
import { AppError } from '../../utils/AppError.js';
import { mapGoal } from '../../utils/mappers.js';

import {
  addXp,
  registerDailyActivity
} from '../gamification/gamification.service.js';

import { evaluateAchievements } from '../achievements/achievements.service.js';
import { createNotification } from '../notifications/notifications.service.js';

export async function createGoal(userId, data) {
  const { data: goal, error } = await supabase
    .from('goals')
    .insert({
      user_id: userId,
      name: data.name,
      target_amount: data.targetAmount,
      deadline: data.deadline
    })
    .select('*')
    .single();

  if (error) {
    throw new AppError(400, error.message);
  }

  await registerDailyActivity(userId);

  await addXp(userId, 15, {
    sourceType: 'goal_created',
    sourceId: goal.id,
    description: 'XP por crear una meta de ahorro'
  });

  await evaluateAchievements(userId);

  return mapGoal(goal);
}

export async function listGoals(userId, status) {
  let query = supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError(400, error.message);
  }

  return data.map(mapGoal);
}

export async function deleteGoal(userId, goalId) {
  const { data, error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', userId)
    .select('id');

  if (error) {
    throw new AppError(400, error.message);
  }

  if (!data?.length) {
    throw new AppError(404, 'Meta no encontrada');
  }
}

export async function updateGoalProgress(userId, goalId, amount) {
  const { data: goal, error: findError } = await supabase
    .from('goals')
    .select('*')
    .eq('id', goalId)
    .eq('user_id', userId)
    .maybeSingle();

  if (findError || !goal) {
    throw new AppError(404, 'Meta no encontrada');
  }

  const newCurrentAmount = Number(goal.current_amount) + amount;

  const wasAlreadyCompleted = goal.status === 'completed';

  const isNowCompleted =
    newCurrentAmount >= Number(goal.target_amount);

  const { data: updatedGoal, error } = await supabase
    .from('goals')
    .update({
      current_amount: newCurrentAmount,
      status: isNowCompleted ? 'completed' : 'active'
    })
    .eq('id', goal.id)
    .select('*')
    .single();

  if (error) {
    throw new AppError(400, error.message);
  }

  await registerDailyActivity(userId);

  // Solo otorga XP y notificación la primera vez que termina.
  if (isNowCompleted && !wasAlreadyCompleted) {
    await addXp(userId, 50, {
      sourceType: 'goal_completed',
      sourceId: goal.id,
      description: `XP por completar la meta: ${goal.name}`
    });

    await createNotification(userId, {
      type: 'goal_completed',
      message: `¡Meta completada! Alcanzaste tu objetivo: ${goal.name}`
    });
  }

  await evaluateAchievements(userId);

  return mapGoal(updatedGoal);
}