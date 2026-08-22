import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import Dashboard from "./Dashboard";
import { STORAGE_KEYS } from "../session/storageKeys";

const statsResponse = {
  data: {
    totalPoints: 1250,
    gamesPlayed: 42,
    level: 15,
    achievements: 8,
    currentXp: 750,
    targetXp: 1000,
  },
};

const activityResponse = {
  data: [
    {
      id: 1,
      mode: "Puzzle Game Mode",
      level: 22,
      groupSize: 10,
      participants: 12,
      coins: { gold: 50, red: 50 },
      earnings: 21,
      image: "/bag-coins.svg",
    },
  ],
};

function renderDashboard() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.stubEnv("VITE_BACKEND_API_URL", "http://localhost:3000");
  window.localStorage.setItem(STORAGE_KEYS.TOKEN, "test-token");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe("Dashboard", () => {
  it("renders the fetched stats in the four cards, the progress bar, and the activity feed", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/api/dashboard/stats")) {
        return Promise.resolve({ ok: true, status: 200, json: async () => statsResponse });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => activityResponse });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderDashboard();

    // Four stat cards, formatted values from the backend
    expect(await screen.findByText("1,250")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("15")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();

    // Level progress bar
    expect(screen.getByText("750 / 1,000 XP")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "75");

    // Recent activity feed
    expect(await screen.findByText("Puzzle Game Mode")).toBeInTheDocument();
  });

  it("renders the retry affordance when the stats request fails", async () => {
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/api/dashboard/stats")) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: async () => ({ message: "server down" }),
        });
      }
      return Promise.resolve({ ok: true, status: 200, json: async () => activityResponse });
    });
    vi.stubGlobal("fetch", fetchMock);

    renderDashboard();

    expect(await screen.findByText("Dashboard stats are unavailable")).toBeInTheDocument();
    expect(screen.getByText("server down")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
