import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DashboardRequestError,
  fetchRecentActivity,
  fetchUserStats,
  mapActivityResponse,
  mapUserStats,
} from "./DashboardService";
import { STORAGE_KEYS } from "../session/storageKeys";

describe("mapUserStats", () => {
  it("maps a wrapped { data } response, coercing bigint-as-string numbers", () => {
    const stats = mapUserStats({
      data: {
        totalPoints: "1250",
        gamesPlayed: 42,
        level: 15,
        achievements: 8,
        currentXp: 750,
        targetXp: 1000,
      },
    });

    expect(stats).toEqual({
      totalPoints: 1250,
      gamesPlayed: 42,
      level: 15,
      achievements: 8,
      currentXp: 750,
      targetXp: 1000,
    });
  });

  it("accepts a bare object and defaults missing fields", () => {
    const stats = mapUserStats({ level: 3, points: 100, gamesPlayed: 5 });

    expect(stats).toEqual({
      totalPoints: 100,
      gamesPlayed: 5,
      level: 3,
      achievements: 0,
      currentXp: 0,
      targetXp: 0,
    });
  });

  it("returns null for malformed responses", () => {
    expect(mapUserStats(null)).toBeNull();
    expect(mapUserStats("nope")).toBeNull();
    expect(mapUserStats({ data: [] })).toBeNull();
    expect(mapUserStats({})).toBeNull(); // no usable level
    expect(mapUserStats({ level: "abc" })).toBeNull();
  });
});

describe("mapActivityResponse", () => {
  const entry = {
    id: 1,
    mode: "Puzzle Game Mode",
    level: 22,
    groupSize: 10,
    participants: 12,
    coins: { gold: 50, red: 50 },
    earnings: 8,
    image: "/bag-coins.svg",
  };

  it("maps a wrapped { data } response", () => {
    const items = mapActivityResponse({ data: [entry] });

    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(entry);
  });

  it("accepts a bare array", () => {
    const items = mapActivityResponse([entry]);

    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(entry);
  });

  it("drops malformed entries and maps alternate field names", () => {
    const items = mapActivityResponse({
      data: [
        entry,
        {
          id: "session-uuid",
          gameMode: "Endless Game Mode",
          level: "6",
          earnings: "8",
        },
        { mode: "missing id" },
        "junk",
        null,
      ],
    });

    expect(items).toHaveLength(2);
    expect(items[1]).toMatchObject({
      id: "session-uuid",
      mode: "Endless Game Mode",
      level: 6,
      groupSize: 1,
      participants: 1,
      earnings: 8,
    });
  });

  it("returns an empty list for non-array payloads", () => {
    expect(mapActivityResponse(null)).toEqual([]);
    expect(mapActivityResponse({})).toEqual([]);
    expect(mapActivityResponse("junk")).toEqual([]);
  });
});

describe("dashboard fetches", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it("attaches the bearer token and maps the stats response", async () => {
    vi.stubEnv("VITE_BACKEND_API_URL", "http://localhost:3000");
    window.localStorage.setItem(STORAGE_KEYS.TOKEN, "test-token");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          totalPoints: 1250,
          gamesPlayed: 42,
          level: 15,
          achievements: 8,
          currentXp: 750,
          targetXp: 1000,
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const stats = await fetchUserStats();

    expect(stats).toEqual({
      totalPoints: 1250,
      gamesPlayed: 42,
      level: 15,
      achievements: 8,
      currentXp: 750,
      targetXp: 1000,
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:3000/api/dashboard/stats");
    expect(init.headers.Authorization).toBe("Bearer test-token");
  });

  it("throws a DashboardRequestError with the server message on failure", async () => {
    vi.stubEnv("VITE_BACKEND_API_URL", "http://localhost:3000");
    window.localStorage.setItem(STORAGE_KEYS.TOKEN, "test-token");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ message: "stats service is down" }),
      }),
    );

    await expect(fetchUserStats()).rejects.toThrow("stats service is down");
    await expect(fetchUserStats()).rejects.toBeInstanceOf(DashboardRequestError);
  });

  it("fails closed without a token — no request is fired", async () => {
    vi.stubEnv("VITE_BACKEND_API_URL", "http://localhost:3000");

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchUserStats()).rejects.toThrow(DashboardRequestError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to the bundled mock feed when no API URL is configured", async () => {
    vi.stubEnv("VITE_BACKEND_API_URL", "");
    window.localStorage.setItem(STORAGE_KEYS.TOKEN, "test-token");

    const items = await fetchRecentActivity();

    expect(items.length).toBeGreaterThan(0);
    expect(items[0].mode).toBe("Puzzle Game Mode");
  });
});
