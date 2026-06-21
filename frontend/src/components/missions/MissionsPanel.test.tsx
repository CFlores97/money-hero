import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import MissionsPanel from "@/components/missions/MissionsPanel";
import type { Mission } from "@/types/domain";

const missions: Mission[] = [
  {
    id: "m1",
    title: "Completa un gasto",
    description: "Registra un gasto",
    frequency: "daily",
    xpReward: 10,
    conditionType: "register_expense",
    status: "active",
    progress: 1,
    expiresAt: "2026-06-22T00:00:00.000Z",
  },
  {
    id: "m2",
    title: "Reclama tu premio",
    description: "Misón completada",
    frequency: "weekly",
    xpReward: 50,
    conditionType: "weekly_goal",
    status: "completed",
    progress: 3,
    expiresAt: "2026-06-28T00:00:00.000Z",
  },
];

describe("MissionsPanel", () => {
  it("muestra botón reclamar solo para completed", () => {
    render(<MissionsPanel missions={missions} />);

    expect(screen.getByText("Reclamar recompensa")).toBeInTheDocument();
    expect(screen.getByText("Completa un gasto")).toBeInTheDocument();
    expect(screen.queryAllByText("Reclamar recompensa")).toHaveLength(1);
  });

  it("reclama correctamente", async () => {
    const user = userEvent.setup();
    const onClaim = vi.fn();

    render(<MissionsPanel missions={missions} onClaim={onClaim} />);

    await user.click(screen.getByRole("button", { name: /reclamar recompensa/i }));

    expect(onClaim).toHaveBeenCalledWith("m2");
  });
});
