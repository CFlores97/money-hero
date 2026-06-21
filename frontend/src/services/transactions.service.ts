import { apiClient } from "@/lib/api";
import type {
  CreateTransactionInput,
  Transaction,
  TransactionFilters,
  TransactionListResponse,
} from "@/types/domain";

export function getTransactions(filters: TransactionFilters = {}) {
  return apiClient
    .get<TransactionListResponse>("/transactions", {
      params: filters,
    })
    .then((response) => response.data);
}

export function createTransaction(payload: CreateTransactionInput) {
  return apiClient.post<Transaction>("/transactions", payload).then((response) => response.data);
}

export function deleteTransaction(id: string) {
  return apiClient.delete(`/transactions/${id}`).then(() => undefined);
}
