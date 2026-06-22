import { apiClient } from "@/lib/api";

export type DashboardSummary = {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  activeAlerts: number;
  expensesByCategory: {
    categoryName: string;
    amount: number;
    percentage: number;
  }[];
  recentTransactions: {
    type: string;
    amount: number;
    description: string | null;
    date: string;
    category: {
      name: string;
      icon: string | null;
    } | null;
  }[];
};

const DASHBOARD_QUERY = `
  query DashboardSummary($month: String) {
    dashboardSummary(month: $month) {
      totalBalance
      totalIncome
      totalExpenses
      activeAlerts
      expensesByCategory {
        categoryName
        amount
        percentage
      }
      recentTransactions {
        type
        amount
        description
        date
        category {
          name
          icon
        }
      }
    }
  }
`;

export async function getDashboardSummary(month?: string) {
  const response = await apiClient.post("/graphql", {
    query: DASHBOARD_QUERY,
    variables: { month },
  });

  return response.data.data.dashboardSummary as DashboardSummary;
}