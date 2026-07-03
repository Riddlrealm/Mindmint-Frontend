export interface CoinPack {
  id: number;
  name: string;
  coins: number;
  price: string;
  icon: string;
}

export interface LifelineItem {
  id: number;
  name: string;
  description: string;
  price: string;
  icon: string;
}

export const COIN_PACKS: readonly CoinPack[] = [
  { id: 1, name: "Starter Pack", coins: 100, price: "2 XLM", icon: "/coins.svg" },
  { id: 2, name: "Explorer Pack", coins: 500, price: "8 XLM", icon: "/coins.svg" },
  { id: 3, name: "Champion Pack", coins: 1500, price: "20 XLM", icon: "/bag-coins.svg" },
  { id: 4, name: "Legend Pack", coins: 5000, price: "60 XLM", icon: "/bag-coins.svg" },
] as const;

export const LIFELINE_ITEMS: readonly LifelineItem[] = [
  { id: 1, name: "50:50", description: "Remove two wrong answers", price: "10 coins", icon: "/fiftyfifty.svg" },
  { id: 2, name: "Call a Friend", description: "Get a hint from a virtual expert", price: "15 coins", icon: "/call.svg" },
  { id: 3, name: "Ask the Audience", description: "See the crowd's vote breakdown", price: "15 coins", icon: "/audience.svg" },
] as const;
