import { supabase } from '../../config/supabase.js';

function nextMonthStart(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const next = new Date(Date.UTC(year, monthNumber, 1));
  return next.toISOString().slice(0, 10);
}

function requireUser(context) {
  if (!context.user?.id) {
    throw new Error('Usuario no autenticado');
  }
  return context.user.id;
}

function groupExpensesByCategory(transactions, totalExpenses) {
  const groups = new Map();

  for (const item of transactions) {
    if (item.type !== 'expense') continue;

    const categoryId = item.category?.id ?? 'sin-categoria';
    const current = groups.get(categoryId) ?? {
      categoryId,
      categoryName: item.category?.name ?? 'Sin categoría',
      icon: item.category?.icon ?? null,
      amount: 0
    };

    current.amount += Number(item.amount);
    groups.set(categoryId, current);
  }

  return Array.from(groups.values()).map((item) => ({
    ...item,
    amount: Number(item.amount.toFixed(2)),
    percentage:
      totalExpenses > 0
        ? Number(((item.amount / totalExpenses) * 100).toFixed(1))
        : 0
  }));
}

export const dashboardResolvers = {
  Query: {
    dashboardSummary: async (_, args, context) => {
      const userId = requireUser(context);

      const selectedMonth =
        args.month || new Date().toISOString().slice(0, 7);

      const start = `${selectedMonth}-01`;
      const end = nextMonthStart(selectedMonth);

      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          id,
          type,
          amount,
          date,
          description,
          category:categories(id, name, icon)
        `)
        .eq('user_id', userId)
        .gte('date', start)
        .lt('date', end)
        .order('date', { ascending: false });

      if (error) throw new Error(error.message);

      const totalIncome = transactions
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + Number(item.amount), 0);

      const totalExpenses = transactions
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + Number(item.amount), 0);

      const { data: goals } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');

      const { count: activeAlerts } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read_status', false);

      return {
        totalBalance: Number((totalIncome - totalExpenses).toFixed(2)),
        totalIncome: Number(totalIncome.toFixed(2)),
        totalExpenses: Number(totalExpenses.toFixed(2)),
        activeAlerts: activeAlerts ?? 0,
        expensesByCategory: groupExpensesByCategory(
          transactions,
          totalExpenses
        ),
        recentTransactions: transactions.slice(0, 5),
        goalsProgress: (goals ?? []).map((goal) => {
          const target = Number(goal.target_amount);
          const current = Number(goal.current_amount);

          return {
            id: goal.id,
            name: goal.name,
            targetAmount: target,
            currentAmount: current,
            deadline: goal.deadline,
            status: goal.status,
            percentageCompleted:
              target > 0
                ? Number(((current / target) * 100).toFixed(1))
                : 0
          };
        })
      };
    }
  }
};