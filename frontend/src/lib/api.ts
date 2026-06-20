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

  if (response.status === 204) return null as T;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = Array.isArray(data?.message)
      ? data.message.join(", ")
      : data?.message || "Ocurrió un error inesperado.";
    throw new ApiError(data?.statusCode ?? response.status, message);
  }

  return data as T;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
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

// ─── Users ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
}

export function getMe(token: string) {
  return request<UserProfile>("/users/me", { method: "GET" }, token);
}

export function updateMe(token: string, data: { name?: string; avatar?: string | null }) {
  return request<UserProfile>("/users/me", { method: "PATCH", body: JSON.stringify(data) }, token);
}

// ─── Categories ──────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense" | "both";
}

export function getCategories(token: string) {
  return request<Category[]>("/categories", { method: "GET" }, token);
}

// ─── Transactions ─────────────────────────────────────────────────────────────

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

export interface TransactionListResponse {
  data: Transaction[];
  total: number;
}

export interface TransactionFilters {
  type?: "income" | "expense";
  categoryId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface CreateTransactionInput {
  type: "income" | "expense";
  amount: number;
  categoryId: string;
  date: string;
  description?: string | null;
}

export function getTransactions(token: string, filters: TransactionFilters = {}) {
  const params = new URLSearchParams();
  if (filters.type) params.set("type", filters.type);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.offset) params.set("offset", String(filters.offset));
  const qs = params.toString();
  return request<TransactionListResponse>(`/transactions${qs ? `?${qs}` : ""}`, { method: "GET" }, token);
}

export function createTransaction(token: string, data: CreateTransactionInput) {
  return request<Transaction>("/transactions", { method: "POST", body: JSON.stringify(data) }, token);
}

export function deleteTransaction(token: string, id: string) {
  return request<null>(`/transactions/${id}`, { method: "DELETE" }, token);
}

// ─── Budgets ──────────────────────────────────────────────────────────────────

export interface Budget {
  id: string;
  userId: string;
  month: string;
  limitAmount: number;
  categoryId: string | null;
  spentAmount: number;
  percentageUsed: number;
  alertTriggered: boolean;
  createdAt: string;
}

export interface CreateBudgetInput {
  month: string;
  limitAmount: number;
  categoryId?: string | null;
}

export function createBudget(token: string, data: CreateBudgetInput) {
  return request<Budget>("/budgets", { method: "POST", body: JSON.stringify(data) }, token);
}

export function getCurrentBudget(token: string) {
  return request<Budget>("/budgets/current", { method: "GET" }, token);
}

export function deleteBudget(token: string, id: string) {
  return request<null>(`/budgets/${id}`, { method: "DELETE" }, token);
}

// ─── Goals ────────────────────────────────────────────────────────────────────

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

export function getGoals(token: string, status?: string) {
  const qs = status ? `?status=${status}` : "";
  return request<Goal[]>(`/goals${qs}`, { method: "GET" }, token);
}

export function deleteGoal(token: string, id: string) {
  return request<null>(`/goals/${id}`, { method: "DELETE" }, token);
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

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
}

export function getNotifications(token: string, readStatus?: boolean) {
  const qs = readStatus !== undefined ? `?readStatus=${readStatus}` : "";
  return request<Notification[]>(`/notifications${qs}`, { method: "GET" }, token);
}

export function markNotificationRead(token: string, id: string) {
  return request<Notification>(`/notifications/${id}/read`, { method: "PATCH" }, token);
}

export function markAllNotificationsRead(token: string) {
  return request<{ message: string }>("/notifications/read-all", { method: "PATCH" }, token);
}
