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
    return "No se pudo conectar con el backend. Verifica que esté corriendo en http://localhost:3001.";
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
        window.location.assign("/login");
      }
    }

    return Promise.reject(new ApiClientError(getMessageFromError(error), statusCode));
  }
);
