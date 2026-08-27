import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import storeReducer, { loadWallet, purchaseItem } from "./storeSlice";
import { StoreService } from "../../services/StoreService";
import type { WalletState } from "../../types";
import { STORAGE_KEYS } from "../../session/storageKeys";

const makeStore = () =>
  configureStore({ reducer: { store: storeReducer } });

const INITIAL_WALLET: WalletState = {
  coins: 100,
  lifelines: { fiftyFifty: 1, callAFriend: 0, audience: 0 },
};

function seedWallet(store: ReturnType<typeof makeStore>) {
  store.dispatch({
    type: "store/loadWallet/fulfilled",
    payload: { wallet: INITIAL_WALLET },
  });
}

describe("storeSlice", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("reflects a mocked confirmed purchase by adopting the authoritative wallet", async () => {
    const confirmedWallet: WalletState = {
      coins: 600,
      lifelines: { fiftyFifty: 1, callAFriend: 2, audience: 0 },
    };
    vi.spyOn(StoreService, "purchaseItem").mockResolvedValue(confirmedWallet);

    const store = makeStore();
    seedWallet(store);

    const action = await store.dispatch(
      purchaseItem({ itemType: "coin-pack", itemId: 1 }),
    );

    expect(action.type).toBe("store/purchaseItem/fulfilled");
    expect(store.getState().store.wallet).toEqual(confirmedWallet);
    expect(store.getState().store.pendingItem).toBeNull();
    expect(store.getState().store.purchaseError).toBeNull();
  });

  it("leaves the balance untouched when a mocked purchase fails", async () => {
    vi.spyOn(StoreService, "purchaseItem").mockRejectedValue(
      new Error("Insufficient coins"),
    );

    const store = makeStore();
    seedWallet(store);

    const action = await store.dispatch(
      purchaseItem({ itemType: "lifeline", itemId: 3 }),
    );

    expect(action.type).toBe("store/purchaseItem/rejected");
    // The failed purchase must never increment the balance.
    expect(store.getState().store.wallet).toEqual(INITIAL_WALLET);
    expect(store.getState().store.pendingItem).toBeNull();
    expect(store.getState().store.purchaseError).toBe("Insufficient coins");
  });

  it("marks the pending item while a purchase is in flight and clears it on completion", async () => {
    let resolvePurchase!: (wallet: WalletState) => void;
    vi.spyOn(StoreService, "purchaseItem").mockReturnValue(
      new Promise<WalletState>((resolve) => {
        resolvePurchase = resolve;
      }),
    );

    const store = makeStore();
    const dispatchPromise = store.dispatch(
      purchaseItem({ itemType: "lifeline", itemId: 2 }),
    );

    expect(store.getState().store.pendingItem).toBe("lifeline:2");

    resolvePurchase({
      coins: 100,
      lifelines: { fiftyFifty: 1, callAFriend: 1, audience: 0 },
    });
    await dispatchPromise;

    expect(store.getState().store.pendingItem).toBeNull();
  });

  it("caches the confirmed wallet to the signed-in user's localStorage entry", async () => {
    window.localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify({ id: "user-1", email: "jane@example.com" }),
    );
    const confirmedWallet: WalletState = {
      coins: 600,
      lifelines: { fiftyFifty: 1, callAFriend: 2, audience: 0 },
    };
    vi.spyOn(StoreService, "purchaseItem").mockResolvedValue(confirmedWallet);

    const store = makeStore();
    await store.dispatch(purchaseItem({ itemType: "coin-pack", itemId: 1 }));

    const cached = JSON.parse(
      window.localStorage.getItem(STORAGE_KEYS.WALLET_STATE) ?? "null",
    );
    expect(cached).toEqual({ userId: "user-1", wallet: confirmedWallet });
  });

  it("loadWallet serves the cached wallet when the backend is unreachable", async () => {
    vi.stubEnv("VITE_BACKEND_API_URL", "http://localhost:3000");
    window.localStorage.setItem(
      STORAGE_KEYS.USER,
      JSON.stringify({ id: "user-1", email: "jane@example.com" }),
    );
    window.localStorage.setItem(
      STORAGE_KEYS.WALLET_STATE,
      JSON.stringify({ userId: "user-1", wallet: INITIAL_WALLET }),
    );
    vi.spyOn(StoreService, "fetchWalletState").mockRejectedValue(
      new Error("server down"),
    );

    const store = makeStore();
    await store.dispatch(loadWallet());

    expect(store.getState().store.wallet).toEqual(INITIAL_WALLET);
  });
});
