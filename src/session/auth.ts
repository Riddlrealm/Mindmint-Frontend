import { clearSession } from './clearSession';
import { STORAGE_KEYS } from './storageKeys';

/**
 * Error message returned by authenticated calls when the server rejects the
 * session with HTTP 401. Distinct from a generic operation failure so the UI
 * never reports an expired session as e.g. "Failed to delete account."
 */
export const SESSION_EXPIRED_ERROR =
  'Your session has expired. Please sign in again.';

/**
 * Reads the persisted auth token from localStorage, falling back to
 * sessionStorage. Returns null when neither storage holds a token or when
 * storage is unavailable (e.g. server-side rendering).
 */
export const readToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  return (
    window.localStorage.getItem(STORAGE_KEYS.TOKEN) ||
    window.sessionStorage.getItem(STORAGE_KEYS.TOKEN)
  );
};

/**
 * Reads the recorded session expiry (epoch ms). Returns null when no expiry
 * was recorded — the session then has no client-side expiry.
 */
export const readSessionExpiry = (): number | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
  if (!raw) {
    return null;
  }

  const expiresAt = Number(raw);
  return Number.isFinite(expiresAt) ? expiresAt : null;
};

/**
 * Centralized "is the visitor authenticated" rule: a token must exist and,
 * when an expiry was recorded, must not have passed. A token past its expiry
 * is treated as signed out. The server's 401 remains the authoritative
 * signal; the client-side expiry is an optimization.
 */
export const isAuthenticated = (): boolean => {
  if (!readToken()) {
    return false;
  }

  const expiresAt = readSessionExpiry();
  if (expiresAt !== null && expiresAt <= Date.now()) {
    return false;
  }

  return true;
};

/**
 * Centralized reaction to an expired/revoked session (HTTP 401): clears every
 * session artifact and redirects to /sign-in, preserving the current
 * destination in a `from` query parameter so sign-in can return the user to
 * it after re-authentication.
 */
export function handleUnauthorized(): void {
  clearSession();

  const current = `${window.location.pathname}${window.location.search}`;
  const from = current !== '/sign-in' ? `?from=${encodeURIComponent(current)}` : '';
  window.location.assign(`/sign-in${from}`);
}
