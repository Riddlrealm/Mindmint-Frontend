export interface ActivityItem {
  // The backend may identify sessions by numeric id or UUID string; the mock
  // fixture uses numeric ids. Accept both so a single shape serves either
  // source (the value is only ever used as a React key).
  id: string | number;
  mode: string;
  level: number;
  groupSize: number;
  participants: number;
  coins: {
    gold: number;
    red: number;
  };
  earnings: number;
  image: string;
}

/**
 * Per-user dashboard stats served by the backend. Drives the four stat cards
 * (points, games played, level, achievements) and the level-progress bar on
 * the Dashboard.
 */
export interface UserStats {
  totalPoints: number;
  gamesPlayed: number;
  level: number;
  achievements: number;
  currentXp: number;
  targetXp: number;
}

export interface LeaderboardPlayer {
  id: number;
  name: string;
  avatar: string;
  level: number;
  score: number;
  scoreIcon: string;
}
