import { apiClient } from "@/lib/api";
import type { ApiMessageResponse, Notification } from "@/types/domain";

export function getNotifications(readStatus?: boolean) {
  const params = readStatus === undefined ? undefined : { readStatus };
  return apiClient.get<Notification[]>("/notifications", { params }).then((response) => response.data);
}

export function markNotificationRead(id: string) {
  return apiClient.patch<Notification>(`/notifications/${id}/read`).then((response) => response.data);
}

export function markAllNotificationsRead() {
  return apiClient.patch<ApiMessageResponse>("/notifications/read-all").then((response) => response.data);
}
