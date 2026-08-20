import type { AuthUser } from '../services/AuthService';
import { STORAGE_KEYS } from './storageKeys';

/**
 * Fallback session lifetime applied when the backend returns no expiry for a
 * password sign-in. This is an optimization, not a guarantee: the server's
 * 401 response remains the authoritative expiry signal (see
 * `handleUnauthorized` in `src/session/auth.ts`).
 */
export const DEFAULT_SESSION_TTL_MS = 24 * 60 * 60 * 1000;

export interface SessionPayload {
  token: string;
  user: AuthUser;
  /**
   * Session expiry as epoch milliseconds. When omitted, the session carries
   * no client-side expiry and is treated as authenticated until the server
   * rejects it with a 401. Google sign-in records the ID token's `exp`
   * (seconds → ms); password sign-in records the backend's `expiresAt`
   * (epoch seconds) when present, otherwise the documented
   * `DEFAULT_SESSION_TTL_MS` fallback.
   */
  expiresAt?: number;
}

export function setSession({ token, user, expiresAt }: SessionPayload): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  if (expiresAt !== undefined) {
    window.localStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRES_AT, String(expiresAt));
  } else {
    window.localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRES_AT);
  }
}
