import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import RankingPage from "@/app/ranking/page";
import * as rankingService from "@/services/ranking.service";
import * as session from "@/lib/session";
import type { RankingResponse } from "@/types/domain";

vi.mock("@/components/ProtectedPage", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const globalRanking: RankingResponse = {
  scope: "global",
  myPosition: {
    position: 2,
    userId: "u1",
    name: "Carlo",
    avatar: null,
    totalXp: 540,
    level: 3,
    league: "Bronce",
  },
  data: [
    {
      position: 1,
      userId: "u2",
      name: "Ana",
      avatar: null,
      totalXp: 800,
      level: 4,
      league: "Plata",
    },
    {
      position: 2,
      userId: "u1",
      name: "Carlo",
      avatar: null,
      totalXp: 540,
      level: 3,
      league: "Bronce",
    },
  ],
};

describe("RankingPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza ranking global", async () => {
    vi.spyOn(rankingService, "getGlobalRanking").mockResolvedValue(globalRanking);
    vi.spyOn(rankingService, "getFriendsRanking").mockResolvedValue(globalRanking);
    vi.spyOn(session, "getCurrentUser").mockReturnValue({
      id: "u1",
      name: "Carlo",
      email: "carlo@example.com",
      avatar: null,
      createdAt: "2026-06-21T00:00:00.000Z",
    });

    render(<RankingPage />);

    expect(await screen.findByText(/Ana/)).toBeInTheDocument();
    expect(screen.getByText(/Carlo/)).toBeInTheDocument();
  });

  it("estado vacío para amigos", async () => {
    vi.spyOn(rankingService, "getGlobalRanking").mockResolvedValue(globalRanking);
    vi.spyOn(rankingService, "getFriendsRanking").mockResolvedValue({
      scope: "friends",
      myPosition: globalRanking.myPosition,
      data: [globalRanking.myPosition!],
    });
    vi.spyOn(session, "getCurrentUser").mockReturnValue({
      id: "u1",
      name: "Carlo",
      email: "carlo@example.com",
      avatar: null,
      createdAt: "2026-06-21T00:00:00.000Z",
    });
    const user = userEvent.setup();

    render(<RankingPage />);

    await screen.findByText(/Ana/);
    await user.click(screen.getByRole("button", { name: "Amigos" }));

    await waitFor(() => {
      expect(screen.getByText("Aún no tienes amistades en ranking")).toBeInTheDocument();
    });
  });
});
