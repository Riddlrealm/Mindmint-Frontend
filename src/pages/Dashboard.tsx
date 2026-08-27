import { Trophy, Gamepad2, TrendingUp, Star } from 'lucide-react';
import { RecentActivity } from '../components/RecentActivity';
import Leaderboard from '../components/Leaderboard';
import { SurfaceState } from '../components/state/SurfaceState';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { useLeaderboard } from '../hooks/useLeaderboard';
import type { DashboardStatsView } from '../hooks/useDashboardStats';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useRecentActivity } from '../hooks/useRecentActivity';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { STORAGE_KEYS } from '../session/storageKeys';
import { readJson } from '../session/storage';
import type { UserStats } from '../types';

// Presentation config only — the values themselves come from the backend via
// `useDashboardStats`, never from module constants.
const STAT_CARDS = [
  { label: 'Total Points', key: 'totalPoints', Icon: Trophy },
  { label: 'Games Played', key: 'gamesPlayed', Icon: Gamepad2 },
  { label: 'Current Level', key: 'level', Icon: TrendingUp },
  { label: 'Achievements', key: 'achievements', Icon: Star },
] as const satisfies ReadonlyArray<{
  label: string;
  key: keyof UserStats;
  Icon: typeof Trophy;
}>;

const isStoredUser = (value: unknown): value is { name?: string } => {
  if (value === null || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return record.name === undefined || typeof record.name === 'string';
};

function StatsSection({ view }: { view: DashboardStatsView }) {
  if (view.status === 'loading') {
    return (
      <div className="mb-8">
        <SurfaceState
          status="loading"
          title="Loading your stats"
          description="We’re pulling together your points, games, and level progress."
        />
      </div>
    );
  }

  if (view.status === 'error') {
    return (
      <div className="mb-8">
        <SurfaceState
          status="error"
          title="Dashboard stats are unavailable"
          description={
            view.errorMessage ??
            'We couldn’t load your stats right now. Retry to refresh them.'
          }
          actionLabel="Retry"
          onAction={view.retry}
        />
      </div>
    );
  }

  if (view.status === 'empty') {
    return (
      <div className="mb-8">
        <SurfaceState
          status="empty"
          title="No stats yet"
          description="Your points, games played, and level progress will appear here once you start playing."
        />
      </div>
    );
  }

  const { stats } = view;
  const progressPercent =
    stats.targetXp > 0
      ? Math.min(100, Math.round((stats.currentXp / stats.targetXp) * 100))
      : 0;

  return (
    <>
      {/* Stats Cards */}
      <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {STAT_CARDS.map(({ label, key, Icon }) => (
          <div
            key={label}
            className="bg-[#141516] border border-[#323336] rounded-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <dt className="text-gray-400 text-sm">{label}</dt>
                <dd className="text-2xl font-bold text-[#CFFDED]">
                  {stats[key].toLocaleString()}
                </dd>
              </div>
              <div className="w-12 h-12 bg-[#F9BC07] rounded-full flex items-center justify-center">
                <Icon className="w-6 h-6 text-black" aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </dl>

      {/* Progress Section */}
      <div
        className="bg-[#141516] border border-[#323336] rounded-lg p-6 mb-8"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Level ${stats.level} progress: ${progressPercent} percent`}
      >
        <h2 className="text-xl font-semibold mb-4 text-[#CFFDED]">Level Progress</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Level {stats.level}</span>
            <span className="text-gray-400">
              {stats.currentXp.toLocaleString()} / {stats.targetXp.toLocaleString()} XP
            </span>
          </div>
          <div className="w-full bg-[#323336] rounded-full h-2">
            <div
              className="bg-[#F9BC07] h-2 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

const Dashboard = () => {
  // Guarded read: malformed `mindmint_user` data degrades to a nameless
  // welcome instead of throwing during render.
  const user = readJson(STORAGE_KEYS.USER, isStoredUser);

  // Live, cached per-user data via the shared queryClient. Signed-out or
  // missing-token visitors get the empty surface and never trigger a request
  // without credentials.
  const statsView = useDashboardStats();
  const activityView = useRecentActivity();
  const leaderboardView = useLeaderboard();

  return (
    <div className="bg-[#0F0F0F] min-h-screen text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#CFFDED] mb-2">
            Dashboard
          </h1>
          <p className="text-gray-400">
            Welcome back{user?.name ? `, ${user.name}` : ''}! Here's your gaming overview.
          </p>
        </div>

        {/* Stats + Progress */}
        <StatsSection view={statsView} />

        {/* Recent Activity and Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentActivity view={activityView} />
          <div>
            <Leaderboard view={leaderboardView} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
