"use client";

import { useEffect, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import ErrorAlert from "@/components/common/ErrorAlert";
import LoadingState from "@/components/common/LoadingState";
import PageHeader from "@/components/common/PageHeader";
import NotificationsPanel from "@/components/notifications/NotificationsPanel";
import { emitDataSync, subscribeToDataSync } from "@/lib/data-events";
import { ApiClientError } from "@/lib/api";
import * as notificationsService from "@/services/notifications.service";
import type { Notification } from "@/types/domain";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      try {
        const response = await notificationsService.getNotifications();
        if (isMounted) {
          setNotifications(response);
          setError(null);
          setLoading(false);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error ? loadError.message : "No se pudieron cargar las notificaciones."
          );
          setLoading(false);
        }
      }
    }

    void loadNotifications();
    const unsubscribe = subscribeToDataSync(() => {
      void loadNotifications();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  async function handleMarkRead(id: string) {
    setIsUpdating(true);

    try {
      const updated = await notificationsService.markNotificationRead(id);
      setNotifications((current) => current.map((notification) => (notification.id === id ? updated : notification)));
      emitDataSync();
    } catch (updateError) {
      setError(
        updateError instanceof ApiClientError
          ? updateError.message
          : "No se pudo marcar la notificación."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleMarkAllRead() {
    setIsUpdating(true);

    try {
      await notificationsService.markAllNotificationsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, readStatus: true })));
      emitDataSync();
    } catch (updateError) {
      setError(
        updateError instanceof ApiClientError
          ? updateError.message
          : "No se pudieron marcar todas las notificaciones."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  if (loading) {
    return (
      <ProtectedPage>
        <LoadingState label="Cargando notificaciones..." />
      </ProtectedPage>
    );
  }

  return (
    <ProtectedPage>
      <div className="space-y-6">
        <PageHeader
          title="Notificaciones"
          description="Consulta, marca una o marca todas como leídas."
        />
        {error ? <ErrorAlert message={error} /> : null}
        <NotificationsPanel
          notifications={notifications}
          isUpdating={isUpdating}
          onMarkRead={(id) => void handleMarkRead(id)}
          onMarkAllRead={() => void handleMarkAllRead()}
        />
      </div>
    </ProtectedPage>
  );
}
