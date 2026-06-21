import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import AchievementsPage from "@/app/achievements/page";
import * as achievementsService from "@/services/achievements.service";
import type { Achievement } from "@/types/domain";

vi.mock("@/components/ProtectedPage", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const achievements: Achievement[] = [
  {
    id: "a1",
    title: "Primer paso",
    description: "Registro inicial",
    icon: "award",
    criteria: "transactions_count >= 1",
    unlockedAt: "2026-06-20T10:00:00.000Z",
    unlocked: true,
  },
  {
    id: "a2",
    title: "Racha sólida",
    description: "Mantén la racha",
    icon: null,
    criteria: "streak_days >= 7",
    unlockedAt: null,
    unlocked: false,
  },
];

describe("AchievementsPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("muestra bloqueados y desbloqueados", async () => {
    vi.spyOn(achievementsService, "getAchievements").mockResolvedValue(achievements);

    render(<AchievementsPage />);

    expect(await screen.findByText("Primer paso")).toBeInTheDocument();
    expect(screen.getByText("Racha sólida")).toBeInTheDocument();
    expect(screen.getByText("Desbloqueado")).toBeInTheDocument();
    expect(screen.getByText("Bloqueado")).toBeInTheDocument();
  });

  it("filtra unlocked", async () => {
    const getAchievementsSpy = vi.spyOn(achievementsService, "getAchievements").mockImplementation(async (unlocked) => {
      if (unlocked === true) {
        return achievements.filter((achievement) => achievement.unlocked);
      }

      return achievements;
    });
    const user = userEvent.setup();

    render(<AchievementsPage />);

    await screen.findByText("Primer paso");
    await user.click(screen.getByRole("button", { name: "Desbloqueados" }));

    await waitFor(() => {
      expect(getAchievementsSpy).toHaveBeenLastCalledWith(true);
    });
    expect(screen.getByText("Primer paso")).toBeInTheDocument();
    expect(screen.queryByText("Racha sólida")).not.toBeInTheDocument();
  });
});
