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

export type UserProfile = AuthUser;

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense" | "both";
  icon: string | null;
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

export interface TransactionFilters {
  type?: "income" | "expense";
  categoryId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionListResponse {
  data: Transaction[];
  total: number;
}

export interface CreateTransactionInput {
  type: "income" | "expense";
  amount: number;
  categoryId: string;
  date: string;
  description?: string | null;
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
  createdAt: string;
}

export interface CreateBudgetInput {
  month: string;
  limitAmount: number;
  categoryId?: string | null;
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

export interface GamificationProgress {
  userId: string;
  totalXp: number;
  level: number;
  league: string;
  streakDays: number;
  xpToNextLevel: number;
  recentXpGained: number;
}

export type MissionFrequency = "daily" | "weekly";
export type MissionStatus = "active" | "completed" | "claimed";

export interface Mission {
  id: string;
  title: string;
  description: string;
  frequency: MissionFrequency;
  xpReward: number;
  conditionType: string;
  status: MissionStatus;
  progress: number;
  expiresAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  criteria: string;
  unlockedAt: string | null;
  unlocked: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  readStatus: boolean;
  createdAt: string;
}

export interface ApiMessageResponse {
  message: string;
}

export interface RankingEntry {
  position: number;
  userId: string;
  name: string;
  avatar: string | null;
  totalXp: number;
  level: number;
  league: string;
}

export interface RankingResponse {
  scope: "global" | "friends";
  data: RankingEntry[];
  myPosition: RankingEntry | null;
}
