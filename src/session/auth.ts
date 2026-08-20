import { STORAGE_KEYS } from "./storageKeys";

/**
 * Reads the persisted auth token from localStorage, falling back to
 * sessionStorage. Returns null when neither storage holds a token or when
 * storage is unavailable (e.g. server-side rendering).
 */
export const readToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.localStorage.getItem(STORAGE_KEYS.TOKEN) ||
    window.sessionStorage.getItem(STORAGE_KEYS.TOKEN)
  );
};

/**
 * Centralized "is the visitor authenticated" rule used by the routing layer
 * (`ProtectedRoute`) and available to any header/user-menu rendering that
 * needs the same decision. Presence-based: a token exists. Token expiry and
 * 401 handling are enforced separately (see the session-expiry work); this
 * module is the single place the app asks "is there a session at all?".
 */
export const isAuthenticated = (): boolean => readToken() !== null;
