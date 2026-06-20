import { supabase } from '../../config/supabase.js';
import { AppError } from '../../utils/AppError.js';

function mapBudget(row, spentAmount = 0) {
  const limit = Number(row.limit_amount);
  return {
    id: row.id,
    userId: row.user_id,
    month: row.month,
    limitAmount: limit,
    categoryId: row.category_id,
    spentAmount: Number(spentAmount.toFixed(2)),
    percentageUsed: limit > 0 ? Number(((spentAmount / limit) * 100).toFixed(1)) : 0,
    alertTriggered: row.alert_triggered,
    createdAt: row.created_at
  };
}

function nextMonthStart(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const next = new Date(Date.UTC(year, monthNumber, 1));
  return next.toISOString().slice(0, 10);
}

async function calculateSpent(userId, month, categoryId) {
  let query = supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', `${month}-01`)
    .lt('date', nextMonthStart(month));

  if (categoryId) query = query.eq('category_id', categoryId);

  const { data, error } = await query;
  if (error) throw new AppError(400, error.message);
  return data.reduce((sum, t) => sum + Number(t.amount), 0);
}

export async function createBudget(userId, data) {
  const { data: existing } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', userId)
    .eq('month', data.month)
    .maybeSingle();

  if (existing) throw new AppError(400, 'Ya existe un presupuesto para ese mes');

  if (data.categoryId) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('id', data.categoryId)
      .maybeSingle();

    if (!category) throw new AppError(400, 'Categoria no encontrada');
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

  if (error) throw new AppError(400, error.message);
  return mapBudget(budget, 0);
}

export async function getCurrentBudget(userId) {
  const month = new Date().toISOString().slice(0, 7);

  const { data: budget, error } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle();

  if (error) throw new AppError(400, error.message);
  if (!budget) throw new AppError(404, 'No hay presupuesto para el mes actual');

  const spentAmount = await calculateSpent(userId, month, budget.category_id);
  return mapBudget(budget, spentAmount);
}

export async function deleteBudget(userId, budgetId) {
  const { data, error } = await supabase
    .from('budgets')
    .delete()
    .eq('id', budgetId)
    .eq('user_id', userId)
    .select('id');

  if (error) throw new AppError(400, error.message);
  if (!data?.length) throw new AppError(404, 'Presupuesto no encontrado');
}

export async function evaluateBudgetForMonth(userId, date) {
  const month = date.slice(0, 7);

  const { data: budget } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle();

  if (!budget || budget.alert_triggered) return;

  const spentAmount = await calculateSpent(userId, month, budget.category_id);
  const alertPercentage = Number(process.env.BUDGET_ALERT_PERCENTAGE ?? 80);
  const percentageUsed =
    Number(budget.limit_amount) > 0
      ? (spentAmount / Number(budget.limit_amount)) * 100
      : 0;

  if (percentageUsed >= alertPercentage) {
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'budget_alert',
      message: `Alcanzaste el ${alertPercentage}% de tu presupuesto de ${month}`
    });

    await supabase
      .from('budgets')
      .update({ alert_triggered: true })
      .eq('id', budget.id);
  }
}
