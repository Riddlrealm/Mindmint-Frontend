import type { AuthUser } from "../../services/AuthService";
import type { LifelineInventory, WalletState } from "../../types";
import { STORAGE_KEYS } from "../../session/storageKeys";
import { readJson } from "../../session/storage";

/**
 * Local snapshot of the signed-in user's wallet, keyed by user id so a
 * different sign-in can never read another user's balance. The backend stays
 * the source of truth; this cache exists so the UI can render a last-known
 * balance instantly (and in dev when no API URL is configured) without
 * fabricating one.
 */

interface CachedWallet {
  userId: string;
  wallet: WalletState;
}

const isAuthUser = (value: unknown): value is AuthUser => {
  if (value === null || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" && record.id.trim() !== "" &&
    typeof record.email === "string"
  );
};

const isLifelineInventory = (value: unknown): value is LifelineInventory => {
  if (value === null || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.fiftyFifty === "number" &&
    typeof record.callAFriend === "number" &&
    typeof record.audience === "number"
  );
};

const isWalletState = (value: unknown): value is WalletState => {
  if (value === null || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.coins === "number" &&
    Number.isFinite(record.coins) &&
    isLifelineInventory(record.lifelines)
  );
};

const isCachedWallet = (value: unknown): value is CachedWallet => {
  if (value === null || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.userId === "string" &&
    record.userId.trim() !== "" &&
    isWalletState(record.wallet)
  );
};

/** Reads the signed-in user's id from the persisted session, if any. */
export function readUserId(): string | null {
  const user = readJson(STORAGE_KEYS.USER, isAuthUser);
  return user ? user.id : null;
}

/**
 * Reads the cached wallet for the *current* signed-in user. Returns null when
 * storage is unavailable, no session exists, the cached entry belongs to a
 * different user, or the shape is corrupted — callers then render their own
 * default instead of a stale or foreign balance.
 */
export function readCachedWallet(): WalletState | null {
  const cached = readJson(STORAGE_KEYS.WALLET_STATE, isCachedWallet);
  if (!cached) return null;

  const userId = readUserId();
  if (!userId || cached.userId !== userId) return null;

  return cached.wallet;
}

/**
 * Persists the authoritative wallet as a cache entry keyed to the signed-in
 * user. No-ops when storage is unavailable or there is no session, so a
 * signed-out visitor can never write a wallet that a later sign-in inherits.
 */
export function writeCachedWallet(wallet: WalletState): void {
  if (typeof window === "undefined") return;

  const userId = readUserId();
  if (!userId) return;

  window.localStorage.setItem(
    STORAGE_KEYS.WALLET_STATE,
    JSON.stringify({ userId, wallet } satisfies CachedWallet),
  );
}
