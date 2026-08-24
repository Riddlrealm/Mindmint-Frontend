import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Leaderboard } from "./Leaderboard";
import type { LeaderboardPlayer } from "../types";

const players: LeaderboardPlayer[] = [
  {
    id: 1,
    name: "Abbas",
    avatar: "/a.svg",
    level: 56,
    score: 50000,
    scoreIcon: "/coins.svg",
  },
  {
    id: 2,
    name: "John",
    avatar: "/b.svg",
    level: 53,
    score: 45000,
    scoreIcon: "/coins.svg",
  },
];

describe("Leaderboard", () => {
  it("renders players in the order provided", () => {
    render(<Leaderboard view={{ status: "ready", players }} />);

    const rows = screen.getAllByTestId("leaderboard-row");
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent("Abbas");
    expect(rows[1]).toHaveTextContent("John");
  });

  it("renders the error surface with a retry affordance", () => {
    const retry = vi.fn();
    render(
      <Leaderboard
        view={{ status: "error", errorMessage: "down", retry }}
      />,
    );

    expect(screen.getByText("Leaderboard unavailable")).toBeInTheDocument();
    expect(screen.getByText("down")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("renders the empty surface", () => {
    render(<Leaderboard view={{ status: "empty" }} />);

    expect(screen.getByText("No players ranked yet")).toBeInTheDocument();
  });

  it("renders the loading surface", () => {
    render(<Leaderboard view={{ status: "loading" }} />);

    expect(screen.getByText("Loading leaderboard")).toBeInTheDocument();
  });
});
