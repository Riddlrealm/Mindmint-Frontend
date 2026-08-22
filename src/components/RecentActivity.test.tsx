import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { RecentActivity } from "./RecentActivity";
import type { ActivityItem } from "../types";

const items: ActivityItem[] = [
  {
    id: 1,
    mode: "Puzzle Game Mode",
    level: 22,
    groupSize: 10,
    participants: 12,
    coins: { gold: 50, red: 50 },
    earnings: 8,
    image: "/bag-coins.svg",
  },
  {
    id: 2,
    mode: "Endless Game Mode",
    level: 6,
    groupSize: 10,
    participants: 12,
    coins: { gold: 50, red: 50 },
    earnings: 8,
    image: "/chest.svg",
  },
];

describe("RecentActivity", () => {
  it("renders the fetched activities", () => {
    render(<RecentActivity view={{ status: "ready", items }} />);

    expect(screen.getByText("Puzzle Game Mode")).toBeInTheDocument();
    expect(screen.getByText("Endless Game Mode")).toBeInTheDocument();
    expect(screen.getByText("Level 22")).toBeInTheDocument();
    expect(screen.getByText("Level 6")).toBeInTheDocument();
  });

  it("renders the loading surface", () => {
    render(<RecentActivity view={{ status: "loading" }} />);

    expect(screen.getByText("Loading recent activity")).toBeInTheDocument();
  });

  it("renders the error surface with a working retry affordance", () => {
    const retry = vi.fn();
    render(
      <RecentActivity
        view={{ status: "error", errorMessage: "feed is down", retry }}
      />,
    );

    expect(screen.getByText("Recent activity is unavailable")).toBeInTheDocument();
    expect(screen.getByText("feed is down")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("renders the empty surface", () => {
    render(<RecentActivity view={{ status: "empty" }} />);

    expect(screen.getByText("No activity yet")).toBeInTheDocument();
  });
});
