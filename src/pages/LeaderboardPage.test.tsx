import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LeaderboardPage from "./LeaderboardPage";

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <LeaderboardPage />
    </QueryClientProvider>,
  );
}

const SUCCESS_RESPONSE = {
  data: [
    {
      playerId: "u1",
      rank: 1,
      score: 50000,
      name: "Abbas",
      avatar: "/a.svg",
      level: 56,
      scoreIcon: "/coins.svg",
    },
    {
      playerId: "u2",
      rank: 2,
      score: 45000,
      name: "John",
      avatar: "/b.svg",
      level: 53,
      scoreIcon: "/coins.svg",
    },
    {
      playerId: "u3",
      rank: 3,
      score: 40000,
      name: "Duncan",
      avatar: "/c.svg",
      level: 46,
      scoreIcon: "/coins.svg",
    },
  ],
  total: 3,
};

describe("LeaderboardPage", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("renders fetched players in score order in the ranked table", async () => {
    vi.stubEnv("VITE_BACKEND_API_URL", "http://api.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify(SUCCESS_RESPONSE), { status: 200 }),
      ),
    );

    renderPage();

    // The first row is the table header; data rows follow in score order.
    const rows = await screen.findAllByRole("row");
    const dataRows = rows.slice(1);
    expect(dataRows).toHaveLength(3);
    expect(within(dataRows[0]).getByText("Abbas")).toBeInTheDocument();
    expect(within(dataRows[1]).getByText("John")).toBeInTheDocument();
    expect(within(dataRows[2]).getByText("Duncan")).toBeInTheDocument();
  });

  it("renders the error surface and a retry affordance", async () => {
    vi.stubEnv("VITE_BACKEND_API_URL", "http://api.test");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Leaderboard down" }), {
          status: 500,
        }),
      ),
    );

    renderPage();

    expect(
      await screen.findByText("Leaderboard unavailable"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
