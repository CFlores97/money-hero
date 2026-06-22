export const dashboardTypeDefs = `
  type Category {
    id: ID
    name: String
    icon: String
  }

  type Transaction {
    id: ID
    type: String
    amount: Float
    date: String
    description: String
    category: Category
  }

  type GoalProgress {
    id: ID
    name: String
    targetAmount: Float
    currentAmount: Float
    deadline: String
    status: String
    percentageCompleted: Float
  }

  type ExpenseByCategory {
    categoryId: ID
    categoryName: String
    icon: String
    amount: Float
    percentage: Float
  }

  type DashboardSummary {
    totalBalance: Float
    totalIncome: Float
    totalExpenses: Float
    activeAlerts: Int
    goalsProgress: [GoalProgress]
    expensesByCategory: [ExpenseByCategory]
    recentTransactions: [Transaction]
  }

  type Query {
    dashboardSummary(month: String): DashboardSummary
  }
`;