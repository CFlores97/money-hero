import { supabase } from '../../config/supabase.js';
import { AppError } from '../../utils/AppError.js';
import { mapTransaction } from '../../utils/mappers.js';

import {
  addXp,
  registerDailyActivity
} from '../gamification/gamification.service.js';

import { evaluateBudgetForMonth } from '../budgets/budgets.service.js';
import { recordProgress } from '../missions/missions.service.js';
import { evaluateAchievements } from '../achievements/achievements.service.js';

export async function createTransaction(userId, data) {
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', data.categoryId)
    .maybeSingle();

  if (categoryError || !category) {
    throw new AppError(400, 'Categoria no encontrada');
  }

  const categoryIsValid =
    category.type === data.type || category.type === 'both';

  if (!categoryIsValid) {
    throw new AppError(
      400,
      'La categoria no corresponde al tipo de transaccion'
    );
  }

  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      type: data.type,
      amount: data.amount,
      category_id: data.categoryId,
      date: data.date,
      description: data.description || null
    })
    .select('*')
    .single();

  if (error) {
    throw new AppError(400, error.message);
  }

  // La transacción fue creada: cuenta como actividad del día.
  await registerDailyActivity(userId);

  // Otorga XP y registra la causa en xp_events.
  await addXp(userId, 5, {
    sourceType: 'transaction',
    sourceId: transaction.id,
    description: 'XP por registrar una transaccion'
  });

  if (data.type === 'expense') {
    // Recalcula el presupuesto y sus alertas.
    await evaluateBudgetForMonth(userId, data.date);

    // Solo un gasto avanza la misión "Registra un gasto".
    await recordProgress(userId, 'register_expense');
  }

  // Puede desbloquear "Primer paso" u otros logros.
  await evaluateAchievements(userId);

  return mapTransaction(transaction);
}

export async function listTransactions(userId, filters) {
  const limit = Math.min(Number(filters.limit ?? 20), 100);
  const offset = Math.max(Number(filters.offset ?? 0), 0);

  let query = supabase
    .from('transactions')
    .select(
      'id, user_id, category_id, type, amount, date, description, created_at',
      { count: 'exact' }
    )
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.type) query = query.eq('type', filters.type);
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
  if (filters.from) query = query.gte('date', filters.from);
  if (filters.to) query = query.lte('date', filters.to);

  const { data, error, count } = await query;

  if (error) {
    throw new AppError(400, error.message);
  }

  return {
    data: data.map(mapTransaction),
    total: count ?? 0
  };
}

export async function deleteTransaction(userId, transactionId) {
  const { data: transaction, error: findError } = await supabase
    .from('transactions')
    .select('id, type, date')
    .eq('id', transactionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (findError || !transaction) {
    throw new AppError(404, 'Transaccion no encontrada');
  }

  const { error: deleteError } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', userId);

  if (deleteError) {
    throw new AppError(400, deleteError.message);
  }

  // Si borró un gasto, recalcula presupuesto.
  if (transaction.type === 'expense') {
    await evaluateBudgetForMonth(userId, transaction.date);
  }
}