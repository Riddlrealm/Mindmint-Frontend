import type { ActivityItem, UserStats } from "../types";
import { mockActivities } from "../models/recentActivity";
import { readToken } from "../session/auth";

/**
 * Dashboard endpoint contracts (agreed with Mindmint-Backend):
 *
 *   GET {VITE_BACKEND_API_URL}/api/dashboard/stats
 *   GET {VITE_BACKEND_API_URL}/api/dashboard/activity?limit=8
 *
 * The API gateway's `JwtAuthGuard` protects every route, so an
 * `Authorization: Bearer <token>` header is attached whenever a session token
 * is available — and these fetches fail closed (never fire) when there is no
 * token, so a signed-out visitor can never be shown another user's data.
 *
 * Expected responses:
 *
 *   stats:    { data: { totalPoints, gamesPlayed, level, achievements, currentXp, targetXp } }
 *   activity: { data: Array<{ id, mode, level, groupSize, participants, coins: { gold, red }, earnings, image }> }
 *
 * Both mappers also accept the bare object/array (no `data` wrapper) and
 * coerce string numbers (Postgres `bigint` columns), mirroring the
 * leaderboard contract. When `VITE_BACKEND_API_URL` is unset (local dev), the
 * activity feed falls back to the bundled mock fixture; stats have no mock and
 * surface the error state instead.
 */

const getApiBase = (): string => import.meta.env.VITE_BACKEND_API_URL || "";

const STATS_PATH = "/api/dashboard/stats";
const ACTIVITY_PATH = "/api/dashboard/activity";
const ACTIVITY_LIMIT = 8;

const DEFAULT_ACTIVITY_IMAGE = "/bag-coins.svg";

export class DashboardRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DashboardRequestError";
  }
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

/**
 * Accepts both a JSON number and the string form the backend's `bigint`
 * columns are serialized as by Postgres/TypeORM (e.g. `"1250"`).
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

function readId(entry: Record<string, unknown>): string | number | null {
  const id = entry.id ?? entry.activityId ?? entry.sessionId ?? entry.gameId;
  if (typeof id === "string" && id.trim() !== "") return id;
  if (typeof id === "number" && Number.isFinite(id)) return id;
  return null;
}

function readCoins(
  coins: unknown,
  key: "gold" | "red",
): number {
  if (coins === null || typeof coins !== "object") return 0;
  return asFiniteNumber((coins as Record<string, unknown>)[key]) ?? 0;
}

function mapActivityItem(entry: Record<string, unknown>): ActivityItem | null {
  const id = readId(entry);
  const mode = asString(
    entry.mode ?? entry.gameMode ?? entry.game_mode ?? entry.title,
  );
  if (id === null || mode === null) return null;

  return {
    id,
    mode,
    level: asFiniteNumber(entry.level) ?? 0,
    groupSize: asFiniteNumber(entry.groupSize ?? entry.group_size) ?? 1,
    participants: asFiniteNumber(entry.participants) ?? 1,
    coins: {
      gold: readCoins(entry.coins, "gold"),
      red: readCoins(entry.coins, "red"),
    },
    earnings:
      asFiniteNumber(entry.earnings ?? entry.coinsEarned ?? entry.reward) ?? 0,
    image: asString(entry.image ?? entry.icon) ?? DEFAULT_ACTIVITY_IMAGE,
  };
}

/**
 * Maps and validates a recent-activity response into `ActivityItem`s. Accepts
 * either a bare array or the backend's `{ data }` wrapper and drops malformed
 * entries. Never throws: unknown shapes degrade to an empty list.
 */
export function mapActivityResponse(payload: unknown): ActivityItem[] {
  if (payload === null || typeof payload !== "object") {
    return [];
  }

  const raw = Array.isArray(payload)
    ? payload
    : (payload as { data?: unknown }).data;

  if (!Array.isArray(raw)) {
    return [];
  }

  const items: ActivityItem[] = [];
  for (const entry of raw) {
    if (entry === null || typeof entry !== "object") continue;
    const item = mapActivityItem(entry as Record<string, unknown>);
    if (item) items.push(item);
  }

  return items;
}

/**
 * Maps and validates a stats response into the `UserStats` shape. Accepts
 * either the `{ data }` wrapper or the bare object. Returns null when the
 * response is missing or malformed, so the caller can render the empty state.
 */
export function mapUserStats(payload: unknown): UserStats | null {
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

  const stats = record as Record<string, unknown>;
  const level = asFiniteNumber(stats.level ?? stats.currentLevel);
  if (level === null) {
    return null;
  }

  return {
    totalPoints: asFiniteNumber(stats.totalPoints ?? stats.points) ?? 0,
    gamesPlayed: asFiniteNumber(stats.gamesPlayed ?? stats.games_played) ?? 0,
    level,
    achievements: asFiniteNumber(stats.achievements) ?? 0,
    currentXp: asFiniteNumber(stats.currentXp ?? stats.current_xp) ?? 0,
    targetXp: asFiniteNumber(stats.targetXp ?? stats.target_xp) ?? 0,
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
 * Single authenticated request path for the dashboard endpoints. Fails closed
 * without a configured API URL or a session token — the guarded callers
 * (`useDashboardStats`, `useRecentActivity`) never invoke these without a
 * session, so this is defense in depth.
 */
async function fetchWithAuth(path: string): Promise<unknown> {
  const apiBase = getApiBase();
  if (!apiBase) {
    throw new DashboardRequestError("API URL is not configured.");
  }

  const token = readToken();
  if (!token) {
    throw new DashboardRequestError("Sign in to view your dashboard data.");
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  let res: Response;
  try {
    res = await fetch(`${apiBase}${path}`, { headers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network request failed";
    throw new DashboardRequestError(
      `Unable to reach the dashboard service: ${message}`,
    );
  }

  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new DashboardRequestError(
      errorMessageFromResponse(detail, res.status),
    );
  }

  return res.json();
}

/**
 * Fetches the signed-in user's stats/progress. Falls back to an empty-ish
 * signal (`null`) on malformed responses so the Dashboard can render its
 * empty surface; real failures throw `DashboardRequestError`.
 */
export async function fetchUserStats(): Promise<UserStats | null> {
  const payload: unknown = await fetchWithAuth(STATS_PATH);
  return mapUserStats(payload);
}

/**
 * Fetches the signed-in user's recent activity. When no backend URL is
 * configured (local dev), returns the bundled mock feed so the section stays
 * populated; real failures throw `DashboardRequestError`.
 */
export async function fetchRecentActivity(): Promise<ActivityItem[]> {
  const apiBase = getApiBase();
  if (!apiBase) {
    return mockActivities.slice(0, ACTIVITY_LIMIT);
  }

  const payload: unknown = await fetchWithAuth(
    `${ACTIVITY_PATH}?limit=${ACTIVITY_LIMIT}`,
  );
  return mapActivityResponse(payload);
}
