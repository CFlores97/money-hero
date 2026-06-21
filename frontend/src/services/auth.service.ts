import { apiClient } from "@/lib/api";
import type { ApiMessageResponse, AuthResponse } from "@/types/domain";

export function login(payload: { email: string; password: string }) {
  return apiClient.post<AuthResponse>("/auth/login", payload).then((response) => response.data);
}

export function register(payload: { name: string; email: string; password: string }) {
  return apiClient.post<AuthResponse>("/auth/register", payload).then((response) => response.data);
}

export function logout() {
  return apiClient.post<ApiMessageResponse>("/auth/logout").then((response) => response.data);
}
