import { Trophy, Gamepad2, TrendingUp, Star } from 'lucide-react';
import { RecentActivity } from '../components/RecentActivity';
import Leaderboard from '../components/Leaderboard';
import { useLeaderboard } from '../hooks/useLeaderboard';
import type { LeaderboardView } from '../hooks/useLeaderboard';
import { mockActivities } from '../models/recentActivity';
import { STORAGE_KEYS } from '../session/storageKeys';
import { readJson } from '../session/storage';

const DashboardStats = [
  { label: 'Total Points', value: '1,250', Icon: Trophy },
  { label: 'Games Played', value: '42', Icon: Gamepad2 },
  { label: 'Current Level', value: '15', Icon: TrendingUp },
  { label: 'Achievements', value: '8', Icon: Star },
] as const;

const PROGRESS = { currentLevel: 15, currentXp: 750, targetXp: 1000 };
const progressPercent = Math.min(
  100,
  Math.round((PROGRESS.currentXp / PROGRESS.targetXp) * 100),
);

const isStoredUser = (value: unknown): value is { name?: string } => {
  if (value === null || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return record.name === undefined || typeof record.name === 'string';
};

const Dashboard = () => {
  // Guarded read: malformed `mindmint_user` data degrades to a nameless
  // welcome instead of throwing during render.
  const user = readJson(STORAGE_KEYS.USER, isStoredUser);

  // Live, cached leaderboard via the shared queryClient. The dashboard shows
  // the top five; the full ranking lives on /leaderboard.
  const leaderboard = useLeaderboard();
  const leaderboardView: LeaderboardView =
    leaderboard.status === "ready"
      ? { status: "ready", players: leaderboard.players.slice(0, 5) }
      : leaderboard;

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

        {/* Stats Cards */}
        <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {DashboardStats.map(({ label, value, Icon }) => (
            <div
              key={label}
              className="bg-[#141516] border border-[#323336] rounded-lg p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <dt className="text-gray-400 text-sm">{label}</dt>
                  <dd className="text-2xl font-bold text-[#CFFDED]">{value}</dd>
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
          aria-label={`Level ${PROGRESS.currentLevel} progress: ${progressPercent} percent`}
        >
          <h2 className="text-xl font-semibold mb-4 text-[#CFFDED]">Level Progress</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Level {PROGRESS.currentLevel}</span>
              <span className="text-gray-400">{PROGRESS.currentXp} / {PROGRESS.targetXp} XP</span>
            </div>
            <div className="w-full bg-[#323336] rounded-full h-2">
              <div
                className="bg-[#F9BC07] h-2 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Recent Activity and Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <RecentActivity activities={mockActivities.slice(0, 4)} />
          </div>
          <div>
            <Leaderboard view={leaderboardView} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;