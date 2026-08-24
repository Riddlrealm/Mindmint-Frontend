import { afterEach, describe, expect, it, vi } from "vitest";
import {
  fetchLeaderboard,
  LeaderboardRequestError,
  mapLeaderboardResponse,
} from "./LeaderboardService";

describe("mapLeaderboardResponse", () => {
  it("maps a { data } wrapper and sorts players by score descending", () => {
    const players = mapLeaderboardResponse({
      data: [
        { playerId: "a", rank: 2, score: 100 },
        { playerId: "b", rank: 1, score: 500 },
        { playerId: "c", rank: 3, score: 50 },
      ],
      total: 3,
    });

    expect(players.map((player) => player.score)).toEqual([500, 100, 50]);
    expect(players.map((player) => player.id)).toEqual(["b", "a", "c"]);
  });

  it("accepts a bare array and coerces string numbers", () => {
    const players = mapLeaderboardResponse([
      {
        id: 1,
        name: "Abbas",
        level: "56",
        score: "50000",
        avatar: "https://example.com/a.jpg",
        scoreIcon: "/bag-coins.svg",
      },
      { id: 2, name: "John", level: 53, score: 45000 },
    ]);

    expect(players).toHaveLength(2);
    expect(players[0]).toMatchObject({
      id: 1,
      name: "Abbas",
      level: 56,
      score: 50000,
    });
    expect(players[1]).toMatchObject({ id: 2, name: "John", score: 45000 });
  });

  it("degrades missing fields to safe defaults instead of crashing", () => {
    const players = mapLeaderboardResponse([{ playerId: "u1", score: 10 }]);

    expect(players[0]).toEqual({
      id: "u1",
      name: "Player",
      avatar: "/avatar.svg",
      level: 0,
      score: 10,
      scoreIcon: "/coins.svg",
    });
  });

  it("drops malformed entries and unknown shapes", () => {
    expect(mapLeaderboardResponse(null)).toEqual([]);
    expect(mapLeaderboardResponse({ total: 0 })).toEqual([]);
    expect(mapLeaderboardResponse([null, 42, "nope", { rank: 1 }])).toEqual([]);
  });
});

describe("fetchLeaderboard", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("fetches from the configured API and returns players in score order", async () => {
    vi.stubEnv("VITE_BACKEND_API_URL", "http://api.test");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          data: [
            { playerId: "u1", score: 100 },
            { playerId: "u2", score: 900 },
          ],
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const players = await fetchLeaderboard();

    expect(players.map((player) => player.id)).toEqual(["u2", "u1"]);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://api.test/api/leaderboard?category=score&timePeriod=all_time&limit=100",
      expect.objectContaining({
        headers: expect.objectContaining({ Accept: "application/json" }),
      }),
    );
  });

  it("falls back to the mock fixture when no backend is configured", async () => {
    vi.stubEnv("VITE_BACKEND_API_URL", undefined);

    const players = await fetchLeaderboard();

    expect(players.length).toBeGreaterThan(0);
  });

  it("throws a LeaderboardRequestError on a non-ok response", async () => {
    vi.stubEnv("VITE_BACKEND_API_URL", "http://api.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify({ message: "Unauthorized" }), {
            status: 401,
          }),
        ),
      ),
    );

    await expect(fetchLeaderboard()).rejects.toThrow(LeaderboardRequestError);
    await expect(fetchLeaderboard()).rejects.toThrow("Unauthorized");
  });

  it("throws a LeaderboardRequestError when the network request fails", async () => {
    vi.stubEnv("VITE_BACKEND_API_URL", "http://api.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("network down")),
    );

    await expect(fetchLeaderboard()).rejects.toThrow(LeaderboardRequestError);
    await expect(fetchLeaderboard()).rejects.toThrow("network down");
  });
});
