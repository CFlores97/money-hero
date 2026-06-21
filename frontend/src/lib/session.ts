import type { AuthUser } from "@/types/domain";

const TOKEN_KEY = "moneyhero_token";
const USER_KEY = "moneyhero_user";
const LEGACY_TOKEN_KEYS = ["token", "authToken"];
const LEGACY_USER_KEYS = ["user", "authUser"];

function canUseStorage() {
  return typeof window !== "undefined";
}

function getStorage() {
  if (!canUseStorage()) {
    return null;
  }

  return window.localStorage;
}

function migrateLegacyValue(primaryKey: string, legacyKeys: string[]) {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const currentValue = storage.getItem(primaryKey);
  if (currentValue) {
    return currentValue;
  }

  for (const legacyKey of legacyKeys) {
    const legacyValue = storage.getItem(legacyKey);
    if (legacyValue) {
      storage.setItem(primaryKey, legacyValue);
      storage.removeItem(legacyKey);
      return legacyValue;
    }
  }

  return null;
}

export function getToken(): string | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  return storage.getItem(TOKEN_KEY) ?? migrateLegacyValue(TOKEN_KEY, LEGACY_TOKEN_KEYS);
}

export function setToken(token: string) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(TOKEN_KEY, token);
  for (const legacyKey of LEGACY_TOKEN_KEYS) {
    storage.removeItem(legacyKey);
  }
}

export function removeToken() {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(TOKEN_KEY);
  for (const legacyKey of LEGACY_TOKEN_KEYS) {
    storage.removeItem(legacyKey);
  }
}

export function getCurrentUser(): AuthUser | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const rawUser = storage.getItem(USER_KEY) ?? migrateLegacyValue(USER_KEY, LEGACY_USER_KEYS);
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as AuthUser;
  } catch {
    storage.removeItem(USER_KEY);
    return null;
  }
}

export function setCurrentUser(user: AuthUser) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.setItem(USER_KEY, JSON.stringify(user));
  for (const legacyKey of LEGACY_USER_KEYS) {
    storage.removeItem(legacyKey);
  }
}

export function clearSession() {
  const storage = getStorage();
  removeToken();

  if (!storage) {
    return;
  }

  storage.removeItem(USER_KEY);
  for (const legacyKey of LEGACY_USER_KEYS) {
    storage.removeItem(legacyKey);
  }
}
