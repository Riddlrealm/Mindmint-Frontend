import type { WalletState } from "../types";
import { STORAGE_KEYS } from "../session/storageKeys";

/**
 * Reads the persisted session token from localStorage, falling back to
 * sessionStorage (mirrors AuthService's inline read; done here to keep this
 * module free of an import cycle through the session/auth → clearSession →
 * store chain, since StoreService is imported by a slice inside the root
 * store).
 */
function readToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return (
    window.localStorage.getItem(STORAGE_KEYS.TOKEN) ||
    window.sessionStorage.getItem(STORAGE_KEYS.TOKEN)
  );
}

/**
 * Store endpoint contracts (agreed with Mindmint-Backend):
 *
 *   GET  {VITE_BACKEND_API_URL}/api/store/wallet
 *   POST {VITE_BACKEND_API_URL}/api/store/purchase   body: { itemType, itemId }
 *
 * The API gateway's `JwtAuthGuard` protects every route, so an
 * `Authorization: Bearer <token>` header is attached whenever a session token
 * is available — and these calls fail closed (never fire) when there is no
 * token, so a signed-out visitor can never purchase or read another user's
 * balance.
 *
 * Trust boundary: the backend is the sole authority on pricing, deduction,
 * and balances. The client only sends *what* is being bought
 * (`{ itemType, itemId }`) — never a price. A purchase is only complete when
 * the server responds with the authoritative post-purchase wallet; that
 * response is what the UI renders and caches. Non-2xx responses (including
 * an unconfirmed/error outcome) throw `StoreRequestError` and never touch the
 * displayed balance.
 *
 * Expected responses (both accept the `{ data }` wrapper or the bare object):
 *
 *   GET:  { data: { coins, lifelines: { fiftyFifty, callAFriend, audience } } }
 *   POST: { data: { coins, lifelines: { fiftyFifty, callAFriend, audience } } }
 */

const getApiBase = (): string => import.meta.env.VITE_BACKEND_API_URL || "";

const WALLET_PATH = "/api/store/wallet";
const PURCHASE_PATH = "/api/store/purchase";

export type StoreItemType = "coin-pack" | "lifeline";

export interface StoreItemRef {
  itemType: StoreItemType;
  itemId: number;
}

export class StoreRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreRequestError";
  }
}

/**
 * Accepts both a JSON number and the string form the backend's `bigint`
 * columns are serialized as by Postgres/TypeORM (e.g. `"100"`).
 */
function asFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function readLifelineCount(
  lifelines: unknown,
  key: "fiftyFifty" | "callAFriend" | "audience",
): number {
  if (lifelines === null || typeof lifelines !== "object") return 0;
  return asFiniteNumber((lifelines as Record<string, unknown>)[key]) ?? 0;
}

/**
 * Maps and validates a wallet response into the `WalletState` shape. Accepts
 * either the `{ data }` wrapper or the bare object and coerces string numbers.
 * Returns null when the response is missing or unusable, so callers can fail
 * closed instead of rendering a fabricated balance.
 */
export function mapWalletResponse(payload: unknown): WalletState | null {
  if (payload === null || typeof payload !== "object") {
    return null;
  }

  const record =
    (payload as { data?: unknown }).data !== undefined &&
    (payload as { data?: unknown }).data !== null
      ? (payload as { data?: unknown }).data
      : payload;

  if (record === null || typeof record !== "object") {
    return null;
  }

  const wallet = record as Record<string, unknown>;
  const coins = asFiniteNumber(wallet.coins ?? wallet.balance);
  if (coins === null) {
    return null;
  }

  return {
    coins,
    lifelines: {
      fiftyFifty: readLifelineCount(wallet.lifelines, "fiftyFifty"),
      callAFriend: readLifelineCount(wallet.lifelines, "callAFriend"),
      audience: readLifelineCount(wallet.lifelines, "audience"),
    },
  };
}

function errorMessageFromResponse(detail: unknown, status: number): string {
  if (detail && typeof detail === "object") {
    const message = (detail as { message?: unknown }).message;
    if (typeof message === "string" && message.trim() !== "") {
      return message;
    }
  }
  return `Request failed with status ${status}`;
}

/**
 * Single authenticated request path for the store endpoints. Fails closed
 * without a configured API URL or a session token, attaches the bearer token,
 * and throws `StoreRequestError` on network failure or any non-2xx response —
 * the caller never sees a "success" the server did not confirm.
 */
async function fetchWithAuth(path: string, init: RequestInit): Promise<unknown> {
  const apiBase = getApiBase();
  if (!apiBase) {
    throw new StoreRequestError("API URL is not configured.");
  }

  const token = readToken();
  if (!token) {
    throw new StoreRequestError("Sign in to make purchases.");
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  let res: Response;
  try {
    res = await fetch(`${apiBase}${path}`, { ...init, headers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network request failed";
    throw new StoreRequestError(
      `Unable to reach the store service: ${message}`,
    );
  }

  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new StoreRequestError(errorMessageFromResponse(detail, res.status));
  }

  return res.json();
}

function requireWallet(payload: unknown): WalletState {
  const wallet = mapWalletResponse(payload);
  if (!wallet) {
    throw new StoreRequestError(
      "The server confirmed the request but returned no wallet.",
    );
  }
  return wallet;
}

export const StoreService = {
  /**
   * Fetches the signed-in user's authoritative wallet (coins + lifelines)
   * from the backend. Throws `StoreRequestError` when the API is not
   * configured, the session is missing, or the server rejects the request.
   */
  async fetchWalletState(): Promise<WalletState> {
    return requireWallet(await fetchWithAuth(WALLET_PATH, { method: "GET" }));
  },

  /**
   * Purchases a coin pack or lifeline. Only the item reference is sent — the
   * backend prices, verifies, and deducts, then returns the authoritative
   * post-purchase wallet. Resolves with that wallet; rejects with
   * `StoreRequestError` (leaving the client balance untouched) when the
   * purchase fails or is not confirmed.
   */
  async purchaseItem(item: StoreItemRef): Promise<WalletState> {
    return requireWallet(
      await fetchWithAuth(PURCHASE_PATH, {
        method: "POST",
        body: JSON.stringify(item),
      }),
    );
  },
};
