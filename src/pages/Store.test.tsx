import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import Store from "./Store";
import ToastViewport from "../components/toasts/ToastViewport";
import preferencesReducer from "../features/preferences/preferencesSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";
import storeReducer from "../features/store/storeSlice";
import gameReducer from "../components/GameMode/gameSliceStore";
import { STORAGE_KEYS } from "../session/storageKeys";

const INITIAL_WALLET = {
  data: {
    coins: 100,
    lifelines: { fiftyFifty: 1, callAFriend: 0, audience: 0 },
  },
};

const CONFIRMED_WALLET = {
  data: {
    coins: 600,
    lifelines: { fiftyFifty: 1, callAFriend: 0, audience: 0 },
  },
};

function renderStore() {
  const store = configureStore({
    reducer: {
      preferences: preferencesReducer,
      notifications: notificationsReducer,
      store: storeReducer,
      game: gameReducer,
    },
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <Store />
        <ToastViewport />
      </Provider>,
    ),
  };
}

beforeEach(() => {
  vi.stubEnv("VITE_BACKEND_API_URL", "http://localhost:3000");
  window.localStorage.setItem(STORAGE_KEYS.TOKEN, "test-token");
  window.localStorage.setItem(
    STORAGE_KEYS.USER,
    JSON.stringify({ id: "user-1", email: "jane@example.com" }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  window.localStorage.clear();
});

describe("Store", () => {
  it("shows the fetched balance and reflects a confirmed purchase with a success toast", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const isPurchase = url.endsWith("/api/store/purchase") && init?.method === "POST";
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => (isPurchase ? CONFIRMED_WALLET : INITIAL_WALLET),
        });
      }),
    );

    renderStore();

    // Initial authoritative balance from GET /api/store/wallet
    const balance = await screen.findByLabelText("Your coin balance");
    expect(balance).toHaveTextContent("100");

    fireEvent.click(
      screen.getByRole("button", { name: /Buy Starter Pack/ }),
    );

    // The confirmed post-purchase wallet is reflected in the UI…
    expect(await screen.findByLabelText("Your coin balance")).toHaveTextContent("600");
    // …and a success toast confirms the purchase.
    expect(
      await screen.findByText("Starter Pack purchased successfully."),
    ).toBeInTheDocument();
  });

  it("renders an error state on a failed purchase without incrementing the balance", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const isPurchase = url.endsWith("/api/store/purchase") && init?.method === "POST";
        if (isPurchase) {
          return Promise.resolve({
            ok: false,
            status: 400,
            json: async () => ({ message: "Insufficient coins" }),
          });
        }
        return Promise.resolve({ ok: true, status: 200, json: async () => INITIAL_WALLET });
      }),
    );

    renderStore();

    const balance = await screen.findByLabelText("Your coin balance");
    expect(balance).toHaveTextContent("100");

    fireEvent.click(
      screen.getByRole("button", { name: /Buy Starter Pack/ }),
    );

    // The error is surfaced (inline banner and error toast)…
    const errorSurfaces = await screen.findAllByText("Insufficient coins");
    expect(errorSurfaces.length).toBeGreaterThan(0);
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);

    // …and the balance was never incremented.
    expect(screen.getByLabelText("Your coin balance")).toHaveTextContent("100");
  });
});
