import { useQuery } from "@tanstack/react-query";
import type { LeaderboardPlayer } from "../types";
import { fetchLeaderboard } from "../services/LeaderboardService";

/**
 * Discriminated view over a leaderboard query. Components switch on `status`
 * to render the matching `SurfaceState` affordance or the live table.
 */
export type LeaderboardView =
  | { status: "loading" }
  | { status: "error"; errorMessage: string | null; retry: () => void }
  | { status: "empty" }
  | { status: "ready"; players: LeaderboardPlayer[] };

export const LEADERBOARD_QUERY_KEY = ["leaderboard"] as const;

function toErrorMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

/**
 * Serves the leaderboard through the shared `queryClient`, so it inherits the
 * configured retry/staleTime/gcTime defaults and is cached across visits.
 */
export function useLeaderboard(): LeaderboardView {
  const query = useQuery({
    queryKey: LEADERBOARD_QUERY_KEY,
    queryFn: fetchLeaderboard,
  });

  if (query.isPending) {
    return { status: "loading" };
  }

  if (query.isError) {
    return {
      status: "error",
      errorMessage: toErrorMessage(query.error),
      retry: () => {
        void query.refetch();
      },
    };
  }

  const players = query.data ?? [];
  if (players.length === 0) {
    return { status: "empty" };
  }

  return { status: "ready", players };
}
