import { useQuery } from "@tanstack/react-query";
import type { UserStats } from "../types";
import { fetchUserStats } from "../services/DashboardService";
import { isAuthenticated } from "../session/auth";

/**
 * Discriminated view over the user-stats query. Components switch on `status`
 * to render the matching `SurfaceState` affordance or the live stat cards.
 */
export type DashboardStatsView =
  | { status: "loading" }
  | { status: "error"; errorMessage: string | null; retry: () => void }
  | { status: "empty" }
  | { status: "ready"; stats: UserStats };

export const DASHBOARD_STATS_QUERY_KEY = ["dashboard", "stats"] as const;

function toErrorMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

/**
 * Serves the signed-in user's stats/progress through the shared
 * `queryClient`, so it inherits the configured retry/staleTime/gcTime defaults
 * and is cached across visits.
 *
 * Signed-out (or expired-session) visitors get the empty state directly — the
 * query is disabled and no unauthenticated request is ever fired.
 */
export function useDashboardStats(): DashboardStatsView {
  const hasSession = isAuthenticated();
  const query = useQuery({
    queryKey: DASHBOARD_STATS_QUERY_KEY,
    queryFn: fetchUserStats,
    enabled: hasSession,
  });

  if (!hasSession) {
    return { status: "empty" };
  }

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

  const stats = query.data;
  if (!stats) {
    return { status: "empty" };
  }

  return { status: "ready", stats };
}
