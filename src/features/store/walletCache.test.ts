import { beforeEach, describe, expect, it } from "vitest";
import {
  readCachedWallet,
  readUserId,
  writeCachedWallet,
} from "./walletCache";
import type { WalletState } from "../../types";
import { STORAGE_KEYS } from "../../session/storageKeys";

const WALLET: WalletState = {
  coins: 100,
  lifelines: { fiftyFifty: 1, callAFriend: 0, audience: 2 },
};

const signInAs = (id: string, email: string) => {
  window.localStorage.setItem(
    STORAGE_KEYS.USER,
    JSON.stringify({ id, email }),
  );
};

describe("walletCache", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("returns null when no session exists", () => {
    expect(readUserId()).toBeNull();
    expect(readCachedWallet()).toBeNull();
  });

  it("stores and reads the wallet for the signed-in user", () => {
    signInAs("user-1", "jane@example.com");
    writeCachedWallet(WALLET);

    expect(readCachedWallet()).toEqual(WALLET);
  });

  it("never serves a cached wallet to a different user", () => {
    signInAs("user-1", "jane@example.com");
    writeCachedWallet(WALLET);

    // The next sign-in must not inherit the previous user's balance.
    signInAs("user-2", "john@example.com");
    expect(readCachedWallet()).toBeNull();
  });

  it("does not write a cache entry without a signed-in user", () => {
    writeCachedWallet(WALLET);

    expect(window.localStorage.getItem(STORAGE_KEYS.WALLET_STATE)).toBeNull();
  });

  it("ignores corrupted cache entries", () => {
    signInAs("user-1", "jane@example.com");
    window.localStorage.setItem(STORAGE_KEYS.WALLET_STATE, "not json");

    expect(readCachedWallet()).toBeNull();
  });
});
