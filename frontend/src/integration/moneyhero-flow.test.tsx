import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type FormEvent } from "react";
import { vi } from "vitest";
import MissionsPanel from "@/components/missions/MissionsPanel";
import TransactionForm from "@/components/transactions/TransactionForm";
import * as session from "@/lib/session";
import type { Category, GamificationProgress, Mission } from "@/types/domain";

const categories: Category[] = [{ id: "expense-1", name: "Comida", type: "expense", icon: null }];

function FlowHarness() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [gamification, setGamification] = useState<GamificationProgress | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    session.setToken("jwt-demo");
    session.setCurrentUser({
      id: "u1",
      name: "Carlo",
      email: "carlo@example.com",
      avatar: null,
      createdAt: "2026-06-21T00:00:00.000Z",
    });
    setIsAuthenticated(true);
  }

  async function handleCreateExpense() {
    setGamification({
      userId: "u1",
      totalXp: 55,
      level: 1,
      league: "Bronce",
      streakDays: 2,
      xpToNextLevel: 195,
      recentXpGained: 5,
    });
    setMissions([
      {
        id: "mission-1",
        title: "Registra un gasto",
        description: "Completa el primer gasto del día",
        frequency: "daily",
        xpReward: 20,
        conditionType: "register_expense",
        status: "completed",
        progress: 1,
        expiresAt: "2026-06-22T00:00:00.000Z",
      },
    ]);
  }

  if (!isAuthenticated) {
    return (
      <form onSubmit={handleLogin}>
        <button type="submit">Login</button>
      </form>
    );
  }

  return (
    <div>
      <p>{gamification ? `${gamification.totalXp} XP` : "Sin XP"}</p>
      <TransactionForm categories={categories} onSubmit={handleCreateExpense} />
      <MissionsPanel missions={missions} onClaim={() => setMissions([])} />
    </div>
  );
}

describe("flujo integrado mockeado", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("Login → crear gasto → actualizar gamificación y misiones → reclamar misión", async () => {
    const user = userEvent.setup();
    const setTokenSpy = vi.spyOn(session, "setToken").mockImplementation(() => undefined);
    const setCurrentUserSpy = vi.spyOn(session, "setCurrentUser").mockImplementation(() => undefined);

    render(<FlowHarness />);

    await user.click(screen.getByRole("button", { name: "Login" }));
    expect(setTokenSpy).toHaveBeenCalledWith("jwt-demo");
    expect(setCurrentUserSpy).toHaveBeenCalled();

    await user.type(screen.getByLabelText("Monto"), "25");
    await user.selectOptions(screen.getByLabelText("Categoría"), "expense-1");
    await user.click(screen.getByRole("button", { name: /guardar transacción/i }));

    expect(await screen.findByText("55 XP")).toBeInTheDocument();
    expect(screen.getByText("Registra un gasto")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /reclamar recompensa/i }));

    await waitFor(() => {
      expect(screen.queryByText("Registra un gasto")).not.toBeInTheDocument();
    });
  });
});
