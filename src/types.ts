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
  // The backend identifies players by UUID string; the mock fixture uses
  // numeric ids. Accept both so a single shape serves either source.
  id: string | number;
  name: string;
  avatar: string;
  level: number;
  score: number;
  scoreIcon: string;
}

/**
 * The three purchasable lifelines. The key doubles as the inventory bucket
 * name in `WalletState.lifelines` and as the `inventoryKey` on each
 * `LifelineItem` in `src/data/storeItems.ts`.
 */
export type LifelineId = "fiftyFifty" | "callAFriend" | "audience";

export interface LifelineInventory {
  fiftyFifty: number;
  callAFriend: number;
  audience: number;
}

/**
 * A user's store wallet: spendable coin balance plus owned lifeline counts.
 *
 * The backend is the source of truth — the client never prices or deducts on
 * its own. The wallet returned by a confirmed purchase (or by the wallet
 * fetch) is what the UI renders, and a snapshot is cached in localStorage
 * keyed to the signed-in user (`STORAGE_KEYS.WALLET_STATE`) purely for offline
 * display and dev-mode fallback.
 */
export interface WalletState {
  coins: number;
  lifelines: LifelineInventory;
}
