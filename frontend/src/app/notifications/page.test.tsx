import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import NotificationsPage from "@/app/notifications/page";
import * as notificationsService from "@/services/notifications.service";
import type { Notification } from "@/types/domain";

vi.mock("@/components/ProtectedPage", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const notifications: Notification[] = [
  {
    id: "n1",
    userId: "u1",
    type: "goal_completed",
    message: "Meta completada",
    readStatus: false,
    createdAt: "2026-06-21T08:00:00.000Z",
  },
  {
    id: "n2",
    userId: "u1",
    type: "budget_alert",
    message: "Alerta de presupuesto",
    readStatus: false,
    createdAt: "2026-06-21T09:00:00.000Z",
  },
];

describe("NotificationsPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("marcar una leída", async () => {
    vi.spyOn(notificationsService, "getNotifications").mockResolvedValue(notifications);
    vi.spyOn(notificationsService, "markNotificationRead").mockResolvedValue({
      ...notifications[0],
      readStatus: true,
    });
    const user = userEvent.setup();

    render(<NotificationsPage />);

    await screen.findByText("Meta completada");
    await user.click(screen.getAllByRole("button", { name: /marcar leída/i })[0]);

    await waitFor(() => {
      expect(screen.getByText("1")).toBeInTheDocument();
    });
  });

  it("marcar todas leídas", async () => {
    vi.spyOn(notificationsService, "getNotifications").mockResolvedValue(notifications);
    vi.spyOn(notificationsService, "markAllNotificationsRead").mockResolvedValue({
      message: "ok",
    });
    const user = userEvent.setup();

    render(<NotificationsPage />);

    await screen.findByText("Meta completada");
    await user.click(screen.getByRole("button", { name: /marcar todas como leídas/i }));

    await waitFor(() => {
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });
});
