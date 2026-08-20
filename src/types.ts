export interface ActivityItem {
  id: number;
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

export interface LeaderboardPlayer {
  // The backend identifies players by UUID string; the mock fixture uses
  // numeric ids. Accept both so a single shape serves either source.
  id: string | number;
  name: string;
  avatar: string;
  level: number;
  score: number;
  scoreIcon: string;
}
