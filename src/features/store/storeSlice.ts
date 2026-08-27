import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { StoreService } from "../../services/StoreService";
import type { StoreItemRef } from "../../services/StoreService";
import type { WalletState } from "../../types";
import { readCachedWallet, writeCachedWallet } from "./walletCache";

/**
 * Store purchase/balance state.
 *
 * Trust boundary: the backend is the only authority on pricing, deduction,
 * and balances. `wallet` is always the server-confirmed wallet (or a cached
 * snapshot of one); a failed/unconfirmed purchase never mutates it. The local
 * cache (`STORAGE_KEYS.WALLET_STATE`) is written only from confirmed
 * responses and keyed to the signed-in user.
 */

interface StoreState {
  /**
   * The user's authoritative wallet (coins + owned lifelines). Null until the
   * first successful load or confirmed purchase.
   */
  wallet: WalletState | null;
  /**
   * Item key (`"coin-pack:1"` / `"lifeline:2"`) of the purchase currently in
   * flight, or null when idle. While set, every buy button is disabled so a
   * double-click can never fire two purchases.
   */
  pendingItem: string | null;
  /** Message of the last failed purchase; null when the last attempt succeeded. */
  purchaseError: string | null;
}

const initialState: StoreState = {
  wallet: null,
  pendingItem: null,
  purchaseError: null,
};

/** Stable per-item key used for pending/disabled state. */
export const itemKey = (item: StoreItemRef): string =>
  `${item.itemType}:${item.itemId}`;

/**
 * Loads the wallet. When the backend is reachable the authoritative balance
 * is fetched and cached; otherwise (no API URL configured, session missing,
 * or the server is unreachable) the last cached wallet is served so the UI
 * never fabricates a balance — it shows the last confirmed one.
 */
export const loadWallet = createAsyncThunk<
  { wallet: WalletState | null },
  void,
  { rejectValue: string }
>("store/loadWallet", async () => {
  const apiBase = import.meta.env.VITE_BACKEND_API_URL || "";
  if (!apiBase) {
    return { wallet: readCachedWallet() };
  }

  try {
    const wallet = await StoreService.fetchWalletState();
    writeCachedWallet(wallet);
    return { wallet };
  } catch {
    // Backend unreachable or session rejected: keep the cached balance on
    // screen rather than blanking the store.
    return { wallet: readCachedWallet() };
  }
});

/**
 * Purchases a coin pack or lifeline. Resolves with the authoritative
 * post-purchase wallet; rejects with the server's message when the purchase
 * fails or is not confirmed — in that case the client balance is untouched.
 */
export const purchaseItem = createAsyncThunk<
  WalletState,
  StoreItemRef,
  { rejectValue: string }
>("store/purchaseItem", async (item, { rejectWithValue }) => {
  try {
    const wallet = await StoreService.purchaseItem(item);
    writeCachedWallet(wallet);
    return wallet;
  } catch (err) {
    return rejectWithValue(
      err instanceof Error ? err.message : "Purchase failed.",
    );
  }
});

export const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    resetStore: (state) => {
      state.wallet = null;
      state.pendingItem = null;
      state.purchaseError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWallet.fulfilled, (state, action) => {
        state.wallet = action.payload.wallet;
      })
      .addCase(purchaseItem.pending, (state, action) => {
        state.pendingItem = itemKey(action.meta.arg);
        state.purchaseError = null;
      })
      .addCase(
        purchaseItem.fulfilled,
        (state, action: PayloadAction<WalletState>) => {
          // Only a server-confirmed wallet is ever shown — this *is* the
          // "increment": the authoritative post-purchase balance.
          state.wallet = action.payload;
          state.pendingItem = null;
        },
      )
      .addCase(purchaseItem.rejected, (state, action) => {
        // Failed/unconfirmed purchase: balance untouched.
        state.pendingItem = null;
        state.purchaseError =
          action.payload ?? "Purchase failed. Please try again.";
      });
  },
});

export const { resetStore } = storeSlice.actions;
export default storeSlice.reducer;
