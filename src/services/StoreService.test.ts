import { afterEach, describe, expect, it, vi } from "vitest";
import {
  mapWalletResponse,
  StoreRequestError,
  StoreService,
} from "./StoreService";
import { STORAGE_KEYS } from "../session/storageKeys";

const WALLET = {
  coins: 500,
  lifelines: { fiftyFifty: 1, callAFriend: 2, audience: 0 },
};

describe("mapWalletResponse", () => {
  it("maps a wrapped { data } response, coercing bigint-as-string numbers", () => {
    const wallet = mapWalletResponse({
      data: {
        coins: "500",
        lifelines: { fiftyFifty: "1", callAFriend: 2, audience: 0 },
      },
    });

    expect(wallet).toEqual(WALLET);
  });

  it("accepts a bare object and defaults missing lifelines to zero", () => {
    const wallet = mapWalletResponse({ coins: 100 });

    expect(wallet).toEqual({
      coins: 100,
      lifelines: { fiftyFifty: 0, callAFriend: 0, audience: 0 },
    });
  });

  it("returns null for malformed responses — never fabricates a balance", () => {
    expect(mapWalletResponse(null)).toBeNull();
    expect(mapWalletResponse("junk")).toBeNull();
    expect(mapWalletResponse({ data: [] })).toBeNull();
    expect(mapWalletResponse({})).toBeNull(); // no usable coins
    expect(mapWalletResponse({ coins: "abc" })).toBeNull();
  });
});

describe("store fetches", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it("fetches the wallet with the bearer token and maps the response", async () => {
    vi.stubEnv("VITE_BACKEND_API_URL", "http://localhost:3000");
    window.localStorage.setItem(STORAGE_KEYS.TOKEN, "test-token");

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: WALLET }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const wallet = await StoreService.fetchWalletState();

    expect(wallet).toEqual(WALLET);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:3000/api/store/wallet");
    expect(init.headers.Authorization).toBe("Bearer test-token");
  });

  it("posts only the item reference — never a price — and returns the authoritative wallet", async () => {
    vi.stubEnv("VITE_BACKEND_API_URL", "http://localhost:3000");
    window.localStorage.setItem(STORAGE_KEYS.TOKEN, "test-token");

    const confirmedWallet = {
      coins: 600,
      lifelines: { fiftyFifty: 1, callAFriend: 2, audience: 0 },
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: confirmedWallet }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const wallet = await StoreService.purchaseItem({
      itemType: "coin-pack",
      itemId: 1,
    });

    expect(wallet).toEqual(confirmedWallet);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://localhost:3000/api/store/purchase");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ itemType: "coin-pack", itemId: 1 });
    expect(JSON.parse(init.body)).not.toHaveProperty("price");
  });

  it("throws a StoreRequestError with the server message on a failed purchase — no wallet is returned", async () => {
    vi.stubEnv("VITE_BACKEND_API_URL", "http://localhost:3000");
    window.localStorage.setItem(STORAGE_KEYS.TOKEN, "test-token");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: "Insufficient coins" }),
      }),
    );

    await expect(
      StoreService.purchaseItem({ itemType: "lifeline", itemId: 2 }),
    ).rejects.toThrow("Insufficient coins");
    await expect(
      StoreService.purchaseItem({ itemType: "lifeline", itemId: 2 }),
    ).rejects.toBeInstanceOf(StoreRequestError);
  });

  it("fails closed without a token — no request is fired", async () => {
    vi.stubEnv("VITE_BACKEND_API_URL", "http://localhost:3000");

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      StoreService.purchaseItem({ itemType: "coin-pack", itemId: 1 }),
    ).rejects.toThrow(StoreRequestError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails closed when the API URL is not configured", async () => {
    vi.stubEnv("VITE_BACKEND_API_URL", "");
    window.localStorage.setItem(STORAGE_KEYS.TOKEN, "test-token");

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(StoreService.fetchWalletState()).rejects.toThrow(
      "API URL is not configured",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
