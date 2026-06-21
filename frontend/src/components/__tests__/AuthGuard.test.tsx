import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import AuthGuard from "@/components/AuthGuard";
import * as session from "@/lib/session";

const replaceMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

describe("AuthGuard", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("bloquea si no existe token", async () => {
    vi.spyOn(session, "getToken").mockReturnValue(null);

    render(
      <AuthGuard>
        <div>contenido protegido</div>
      </AuthGuard>
    );

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/login");
    });
    expect(screen.queryByText("contenido protegido")).not.toBeInTheDocument();
  });

  it("permite contenido si existe token", async () => {
    vi.spyOn(session, "getToken").mockReturnValue("token-demo");

    render(
      <AuthGuard>
        <div>contenido protegido</div>
      </AuthGuard>
    );

    expect(await screen.findByText("contenido protegido")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
