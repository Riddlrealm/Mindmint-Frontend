import type { StorageKey } from './storageKeys';

/**
 * Safely reads and parses a JSON value from localStorage.
 *
 * Guards against every way a read can fail: missing `window` (server-side
 * rendering, module-eval during boot), storage APIs that throw (e.g. disabled
 * storage), missing keys, malformed JSON, and shapes that fail the caller's
 * `validate` guard. Returns `null` in all of those cases; callers apply their
 * own defaults.
 *
 * Contract for new keys: pass a type guard that rejects unknown shapes so a
 * future schema rename degrades to the caller's defaults instead of throwing
 * during a render or module evaluation.
 */
export function readJson<T>(
  key: StorageKey,
  validate: (value: unknown) => value is T,
): T | null {
  if (typeof window === 'undefined') {
    return null;
  }

  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    return null;
  }

  if (raw === null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Safely reads a plain string value from localStorage (no parsing). Returns
 * null when storage is unavailable or the key is absent.
 */
export function readString(key: StorageKey): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
