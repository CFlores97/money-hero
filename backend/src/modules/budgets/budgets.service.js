import { supabase } from '../../config/supabase.js';
import { AppError } from '../../utils/AppError.js';

export async function createBudget(userId, data) {
  const { data: existing } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', userId)
    .eq('month', data.month)
    .maybeSingle();

  if (existing) {
    throw new AppError(400, 'Ya existe un presupuesto para ese mes');
  }

  if (data.categoryId) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', data.categoryId)
      .maybeSingle();

    if (!category) {
      throw new AppError(400, 'Categoria no encontrada');
    }
  }

  const { data: budget, error } = await supabase
    .from('budgets')
    .insert({
      user_id: userId,
      month: data.month,
      limit_amount: data.limitAmount,
      category_id: data.categoryId || null
    })
    .select('*')
    .single();

  if (error) {
    throw new AppError(400, error.message);
  }

  return {
    id: budget.id,
    userId: budget.user_id,
    month: budget.month,
    limitAmount: Number(budget.limit_amount),
    categoryId: budget.category_id,
    spentAmount: 0,
    percentageUsed: 0,
    alertTriggered: false
  };
}