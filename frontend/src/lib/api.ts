import axios, { AxiosError } from "axios";
import { clearSession, getToken } from "@/lib/session";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export class ApiClientError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
  }
}

function getMessageFromError(error: AxiosError<{ message?: string | string[] }>) {
  const message = error.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(", ");
  }

  if (typeof message === "string" && message.trim()) {
    return message;
  }

  if (error.code === "ERR_NETWORK") {
    return "No pudimos conectarnos en este momento. Intenta nuevamente en unos instantes.";
  }

  return "Ocurrió un error inesperado.";
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  config.headers = config.headers ?? {};

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    const statusCode = error.response?.status ?? 0;

    if (statusCode === 401) {
      clearSession();

      if (typeof window !== "undefined" && window.location.pathname !== "/login") {
        const isJsdom =
          typeof window.navigator !== "undefined" &&
          window.navigator.userAgent.toLowerCase().includes("jsdom");

        if (isJsdom) {
          return Promise.reject(new ApiClientError(getMessageFromError(error), statusCode));
        }

        try {
          window.location.assign("/login");
        } catch {
          // jsdom no implementa navegación completa; en navegador real sí redirige.
        }
      }
    }

    return Promise.reject(new ApiClientError(getMessageFromError(error), statusCode));
  }
);
