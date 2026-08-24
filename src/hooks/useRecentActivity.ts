import { useQuery } from "@tanstack/react-query";
import type { ActivityItem } from "../types";
import { fetchRecentActivity } from "../services/DashboardService";
import { isAuthenticated } from "../session/auth";

/**
 * Discriminated view over the recent-activity query. Components switch on
 * `status` to render the matching `SurfaceState` affordance or the live feed.
 */
export type RecentActivityView =
  | { status: "loading" }
  | { status: "error"; errorMessage: string | null; retry: () => void }
  | { status: "empty" }
  | { status: "ready"; items: ActivityItem[] };

export const RECENT_ACTIVITY_QUERY_KEY = ["dashboard", "recent-activity"] as const;

function toErrorMessage(error: unknown): string | null {
  return error instanceof Error ? error.message : null;
}

/**
 * Serves the signed-in user's recent activity through the shared
 * `queryClient`, so it inherits the configured retry/staleTime/gcTime defaults
 * and is cached across visits.
 *
 * Signed-out (or expired-session) visitors get the empty feed directly — the
 * query is disabled and no unauthenticated request is ever fired, and they
 * can never be shown another user's cached activity.
 */
export function useRecentActivity(): RecentActivityView {
  const hasSession = isAuthenticated();
  const query = useQuery({
    queryKey: RECENT_ACTIVITY_QUERY_KEY,
    queryFn: fetchRecentActivity,
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

  const items = query.data ?? [];
  if (items.length === 0) {
    return { status: "empty" };
  }

  return { status: "ready", items };
}
