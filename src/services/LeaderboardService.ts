import type { LeaderboardPlayer } from "../types";
import { mockLeaderboardPlayers } from "../data/mockLeaderboardData";
import { readToken } from "../session/auth";

/**
 * Leaderboard endpoint contract (agreed with Mindmint-Backend):
 *
 *   GET {VITE_BACKEND_API_URL}/api/leaderboard?category=score&timePeriod=all_time&limit=100
 *
 * The API gateway's `JwtAuthGuard` protects every route, so an
 * `Authorization: Bearer <token>` header is attached whenever a session token
 * is available. The backend responds with:
 *
 *   { data: Array<{ playerId, rank, score, name?, avatar?, level?, scoreIcon? }>, total }
 *
 * `playerId` is the signed-in user's UUID (matching `AuthUser.id`). Fields the
 * backend has not yet enriched (`name`, `avatar`, `level`, `scoreIcon`) are
 * optional in the contract and are degraded to safe defaults by
 * `mapLeaderboardResponse` rather than crashing the view.
 */

const getApiBase = (): string => import.meta.env.VITE_BACKEND_API_URL || "";

const LEADERBOARD_PATH = "/api/leaderboard";
const LEADERBOARD_LIMIT = 100;

const DEFAULT_NAME = "Player";
const DEFAULT_AVATAR = "/avatar.svg";
const DEFAULT_SCORE_ICON = "/coins.svg";

type LeaderboardEntry = Record<string, unknown>;

export class LeaderboardRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LeaderboardRequestError";
  }
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

/**
 * Accepts both a JSON number and the string form the backend's `bigint`
 * columns are serialized as by Postgres/TypeORM (e.g. `"50000"`).
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

function readId(entry: LeaderboardEntry): string | number | null {
  const id = entry.playerId ?? entry.userId ?? entry.id;
  if (typeof id === "string" && id.trim() !== "") return id;
  if (typeof id === "number" && Number.isFinite(id)) return id;
  return null;
}

function mapEntry(entry: LeaderboardEntry): LeaderboardPlayer | null {
  const id = readId(entry);
  if (id === null) return null;

  return {
    id,
    name:
      asString(entry.name ?? entry.displayName ?? entry.username) ??
      DEFAULT_NAME,
    avatar: asString(entry.avatar ?? entry.picture) ?? DEFAULT_AVATAR,
    level: asFiniteNumber(entry.level) ?? 0,
    score: asFiniteNumber(entry.score ?? entry.value) ?? 0,
    scoreIcon: asString(entry.scoreIcon) ?? DEFAULT_SCORE_ICON,
  };
}

/**
 * Maps and validates a leaderboard response into the `LeaderboardPlayer`
 * shape. Accepts either a bare array or the backend's `{ data, total }`
 * wrapper, drops malformed entries, and guarantees score order (highest
 * first). Never throws: unknown shapes degrade to an empty list.
 */
export function mapLeaderboardResponse(payload: unknown): LeaderboardPlayer[] {
  if (payload === null || typeof payload !== "object") {
    return [];
  }

  const raw = Array.isArray(payload)
    ? payload
    : (payload as { data?: unknown }).data;

  if (!Array.isArray(raw)) {
    return [];
  }

  const players: LeaderboardPlayer[] = [];
  for (const entry of raw) {
    if (entry === null || typeof entry !== "object") continue;
    const player = mapEntry(entry as LeaderboardEntry);
    if (player) players.push(player);
  }

  return players.sort((a, b) => b.score - a.score);
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

export async function fetchLeaderboard(): Promise<LeaderboardPlayer[]> {
  const apiBase = getApiBase();

  // Dev fixture: with no backend configured there is nowhere to fetch from,
  // so keep the existing mock data on screen instead of a broken table.
  if (!apiBase) {
    return mockLeaderboardPlayers;
  }

  const url = `${apiBase}${LEADERBOARD_PATH}?category=score&timePeriod=all_time&limit=${LEADERBOARD_LIMIT}`;

  const headers: Record<string, string> = { Accept: "application/json" };
  const token = readToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(url, { headers });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Network request failed";
    throw new LeaderboardRequestError(
      `Unable to reach the leaderboard service: ${message}`,
    );
  }

  if (!res.ok) {
    const detail = await res.json().catch(() => null);
    throw new LeaderboardRequestError(errorMessageFromResponse(detail, res.status));
  }

  const payload: unknown = await res.json();
  return mapLeaderboardResponse(payload);
}
