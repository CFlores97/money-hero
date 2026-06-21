import type { AuthUser } from "@/types/domain";

const TOKEN_KEY = "moneyhero_token";
const USER_KEY = "moneyhero_user";

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  if (!canUseStorage()) {
    return null;
  }

  const rawUser = window.localStorage.getItem(USER_KEY);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function setCurrentUser(user: AuthUser) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  removeToken();

  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(USER_KEY);
}
