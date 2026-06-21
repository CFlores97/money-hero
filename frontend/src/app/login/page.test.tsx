import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import LoginPage from "@/app/login/page";
import { ApiClientError } from "@/lib/api";
import * as session from "@/lib/session";
import * as authService from "@/services/auth.service";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("LoginPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("muestra validación", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(screen.getByLabelText("Correo electrónico"), "correo-invalido");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText("Ingresa un correo válido.")).toBeInTheDocument();
  });

  it("guarda token tras login exitoso", async () => {
    const user = userEvent.setup();

    vi.spyOn(authService, "login").mockResolvedValue({
      token: "jwt-demo",
      user: {
        id: "u1",
        name: "Carlo",
        email: "carlo@example.com",
        avatar: null,
        createdAt: "2026-06-21T00:00:00.000Z",
      },
    });
    const setTokenSpy = vi.spyOn(session, "setToken").mockImplementation(() => undefined);
    const setCurrentUserSpy = vi.spyOn(session, "setCurrentUser").mockImplementation(() => undefined);

    render(<LoginPage />);

    await user.type(screen.getByLabelText("Correo electrónico"), "carlo@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "Password123");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    await waitFor(() => {
      expect(setTokenSpy).toHaveBeenCalledWith("jwt-demo");
      expect(setCurrentUserSpy).toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("muestra error backend", async () => {
    const user = userEvent.setup();

    vi.spyOn(authService, "login").mockRejectedValue(new ApiClientError("Credenciales incorrectas", 401));

    render(<LoginPage />);

    await user.type(screen.getByLabelText("Correo electrónico"), "carlo@example.com");
    await user.type(screen.getByLabelText("Contraseña"), "Password123");
    await user.click(screen.getByRole("button", { name: /iniciar sesión/i }));

    expect(await screen.findByText("Credenciales incorrectas")).toBeInTheDocument();
  });
});
