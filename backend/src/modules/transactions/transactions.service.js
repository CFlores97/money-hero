import { supabase } from '../../config/supabase.js';
import { AppError } from '../../utils/AppError.js';
import { mapTransaction } from '../../utils/mappers.js';
import { addXp } from '../gamification/gamification.service.js';
import { evaluateBudgetForMonth } from '../budgets/budgets.service.js';

export async function createTransaction(userId, data) {
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', data.categoryId)
    .maybeSingle();

  if (categoryError || !category) throw new AppError(400, 'Categoria no encontrada');

  const categoryIsValid = category.type === data.type || category.type === 'both';
  if (!categoryIsValid) {
    throw new AppError(400, 'La categoria no corresponde al tipo de transaccion');
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

  if (error) throw new AppError(400, error.message);

  await addXp(userId, 5);

  if (data.type === 'expense') {
    await evaluateBudgetForMonth(userId, data.date);
  }

  return mapTransaction(transaction);
}

export async function listTransactions(userId, filters) {
  const limit = Math.min(Number(filters.limit ?? 20), 100);
  const offset = Math.max(Number(filters.offset ?? 0), 0);

  let query = supabase
    .from('transactions')
    .select('id, user_id, category_id, type, amount, date, description, created_at', {
      count: 'exact'
    })
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.type) query = query.eq('type', filters.type);
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
  if (filters.from) query = query.gte('date', filters.from);
  if (filters.to) query = query.lte('date', filters.to);

  const { data, error, count } = await query;
  if (error) throw new AppError(400, error.message);
  return { data: data.map(mapTransaction), total: count ?? 0 };
}

export async function deleteTransaction(userId, transactionId) {
  const { data, error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', userId)
    .select('id');

  if (error) throw new AppError(400, error.message);
  if (!data?.length) throw new AppError(404, 'Transaccion no encontrada');
}
