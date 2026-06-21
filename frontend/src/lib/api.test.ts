import { AxiosError } from "axios";
import { vi } from "vitest";
import { apiClient, ApiClientError } from "@/lib/api";
import * as session from "@/lib/session";

describe("apiClient", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("agrega Bearer token", async () => {
    vi.spyOn(session, "getToken").mockReturnValue("token-demo");

    const adapter = vi.fn(async (config) => ({
      data: { ok: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    }));

    apiClient.defaults.adapter = adapter;

    await apiClient.get("/health");

    expect(adapter.mock.calls[0][0].headers.Authorization).toBe("Bearer token-demo");
  });

  it("limpia sesión ante 401", async () => {
    vi.spyOn(session, "getToken").mockReturnValue("token-demo");
    const clearSessionSpy = vi.spyOn(session, "clearSession").mockImplementation(() => undefined);

    apiClient.defaults.adapter = async (config) => {
      throw new AxiosError(
        "Unauthorized",
        "ERR_BAD_REQUEST",
        config,
        undefined,
        {
          data: { message: "Sesión expirada" },
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config,
        }
      );
    };

    await expect(apiClient.get("/secure")).rejects.toMatchObject({
      message: "Sesión expirada",
      statusCode: 401,
    } satisfies Partial<ApiClientError>);
    expect(clearSessionSpy).toHaveBeenCalled();
  });
});
