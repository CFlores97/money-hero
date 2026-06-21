import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import ProfilePage from "@/app/profile/page";
import * as usersService from "@/services/users.service";

vi.mock("@/components/ProtectedPage", () => ({
  default: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe("ProfilePage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra el avatar cuando llega una URL valida", async () => {
    vi.spyOn(usersService, "getMe").mockResolvedValue({
      id: "u1",
      name: "Carlo Rocket",
      email: "carlo@example.com",
      avatar: "https://example.com/avatar.webp",
      createdAt: "2026-06-21T00:00:00.000Z",
    });

    render(<ProfilePage />);

    const avatar = await screen.findByAltText("Avatar de Carlo Rocket");

    expect(avatar).toHaveAttribute("src", "https://example.com/avatar.webp");
  });

  it("muestra iniciales cuando la imagen falla", async () => {
    vi.spyOn(usersService, "getMe").mockResolvedValue({
      id: "u1",
      name: "Carlo Rocket",
      email: "carlo@example.com",
      avatar: "https://example.com/avatar.webp",
      createdAt: "2026-06-21T00:00:00.000Z",
    });

    render(<ProfilePage />);

    const avatar = await screen.findByAltText("Avatar de Carlo Rocket");
    fireEvent.error(avatar);

    expect(await screen.findByText("CR")).toBeInTheDocument();
  });
});
