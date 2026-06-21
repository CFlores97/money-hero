import GameButton from "@/components/GameButton";
import EmptyState from "@/components/common/EmptyState";
import { formatDateTime } from "@/lib/formatters";
import type { Notification } from "@/types/domain";

interface NotificationsPanelProps {
  notifications: Notification[];
  isUpdating?: boolean;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

export default function NotificationsPanel({
  notifications,
  isUpdating = false,
  onMarkRead,
  onMarkAllRead,
}: NotificationsPanelProps) {
  if (!notifications.length) {
    return (
      <EmptyState
        title="Sin notificaciones"
        description="Tus alertas apareceran aqui cuando haya novedades para ti."
      />
    );
  }

  const unreadCount = notifications.filter((notification) => !notification.readStatus).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border-2 border-mh-dark/5 bg-white p-5">
        <div>
          <p className="text-sm font-semibold text-mh-dark/55">Resumen</p>
          <p className="font-display text-3xl font-extrabold text-mh-dark">{unreadCount}</p>
          <p className="text-sm text-mh-dark/55">notificaciones sin leer</p>
        </div>
        <GameButton
          type="button"
          variant="outline"
          onClick={onMarkAllRead}
          disabled={isUpdating || unreadCount === 0}
        >
          Marcar todas como leídas
        </GameButton>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <article
            key={notification.id}
            className={`rounded-3xl border-2 p-5 shadow-sm ${
              notification.readStatus ? "border-mh-dark/5 bg-white" : "border-mh-green/20 bg-mh-green/5"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      notification.readStatus ? "bg-mh-dark/15" : "bg-mh-green"
                    }`}
                  />
                  <span className="rounded-full bg-mh-dark/5 px-3 py-1 text-xs font-bold uppercase text-mh-dark/60">
                    {notification.type}
                  </span>
                </div>
                <p className="mt-3 text-base font-semibold text-mh-dark">{notification.message}</p>
                <p className="mt-2 text-xs font-semibold text-mh-dark/45">
                  {formatDateTime(notification.createdAt)}
                </p>
              </div>
              {!notification.readStatus ? (
                <GameButton
                  type="button"
                  variant="gold"
                  onClick={() => onMarkRead(notification.id)}
                  disabled={isUpdating}
                >
                  Marcar leída
                </GameButton>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
