import { supabase } from '../../config/supabase.js';
import { AppError } from '../../utils/AppError.js';
import { mapTransaction } from '../../utils/mappers.js';
import { addXp } from '../gamification/gamification.service.js';

export async function createTransaction(userId, data) {
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*')
    .eq('id', data.categoryId)
    .maybeSingle();

  if (categoryError || !category) {
    throw new AppError(400, 'Categoria no encontrada');
  }

  const categoryIsValid = category.type === data.type || category.type === 'both';

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

  await addXp(userId, 5);

  return mapTransaction(transaction);
}