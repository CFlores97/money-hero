import { apiClient } from "@/lib/api";
import type { UserProfile } from "@/types/domain";

export function getMe() {
  return apiClient.get<UserProfile>("/users/me").then((response) => response.data);
}

export function updateMe(payload: { name?: string; avatar?: string | null }) {
  return apiClient.patch<UserProfile>("/users/me", payload).then((response) => response.data);
}
