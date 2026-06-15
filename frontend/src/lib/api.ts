const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class ApiError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new ApiError(0, "No se pudo conectar con el servidor. ¿Está corriendo el backend?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message || "Ocurrió un error inesperado.";
    throw new ApiError(data?.statusCode ?? response.status, message);
  }

  return data as T;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export function register(name: string, email: string, password: string) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export function login(email: string, password: string) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout(token: string) {
  return request<{ message: string }>("/auth/logout", { method: "POST" }, token);
}

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense" | "both";
}

export function getCategories(token: string) {
  return request<Category[]>("/categories", { method: "GET" }, token);
}

export interface Transaction {
  id: string;
  userId: string;
  type: "income" | "expense";
  amount: number;
  categoryId: string;
  date: string;
  description: string | null;
  createdAt: string;
}

export interface CreateTransactionInput {
  type: "income" | "expense";
  amount: number;
  categoryId: string;
  date: string;
  description?: string | null;
}

export function createTransaction(token: string, data: CreateTransactionInput) {
  return request<Transaction>("/transactions", { method: "POST", body: JSON.stringify(data) }, token);
}

export interface Goal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  status: "active" | "completed" | "failed";
  percentageCompleted: number;
}

export interface CreateGoalInput {
  name: string;
  targetAmount: number;
  deadline: string;
}

export function createGoal(token: string, data: CreateGoalInput) {
  return request<Goal>("/goals", { method: "POST", body: JSON.stringify(data) }, token);
}

export function updateGoalProgress(token: string, goalId: string, amount: number) {
  return request<Goal>(
    `/goals/${goalId}/progress`,
    { method: "PATCH", body: JSON.stringify({ amount }) },
    token
  );
}

export interface Budget {
  id: string;
  userId: string;
  month: string;
  limitAmount: number;
  categoryId: string | null;
  spentAmount: number;
  percentageUsed: number;
  alertTriggered: boolean;
}

export interface CreateBudgetInput {
  month: string;
  limitAmount: number;
  categoryId?: string | null;
}

export function createBudget(token: string, data: CreateBudgetInput) {
  return request<Budget>("/budgets", { method: "POST", body: JSON.stringify(data) }, token);
}
