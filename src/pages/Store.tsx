import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { COIN_PACKS, LIFELINE_ITEMS } from "../data/storeItems";
import type { StoreItemRef } from "../services/StoreService";
import { itemKey, loadWallet, purchaseItem } from "../features/store/storeSlice";
import { useAppDispatch, useAppSelector } from "../hooks";
import { useToast } from "../hooks/useToast";
import { isAuthenticated } from "../session/auth";

const COIN_PACK = "coin-pack" as const;
const LIFELINE = "lifeline" as const;

export default function Store() {
  const dispatch = useAppDispatch();
  const { addToast } = useToast();
  const wallet = useAppSelector((s) => s.store.wallet);
  const pendingItem = useAppSelector((s) => s.store.pendingItem);
  const purchaseError = useAppSelector((s) => s.store.purchaseError);

  // Refresh the authoritative wallet on mount; falls back to the cached
  // balance for instant render / dev when the backend is unreachable.
  useEffect(() => {
    void dispatch(loadWallet());
  }, [dispatch]);

  const handlePurchase = async (item: StoreItemRef, name: string) => {
    if (!isAuthenticated()) {
      addToast("Sign in to make purchases.", "error", "Sign in required");
      return;
    }

    try {
      await dispatch(purchaseItem(item)).unwrap();
      addToast(`${name} purchased successfully.`, "success", "Purchase confirmed");
    } catch (err) {
      const message =
        typeof err === "string" && err
          ? err
          : "Purchase failed. Please try again.";
      addToast(message, "error", "Purchase failed");
    }
  };

  const buyButtonClasses = (outline: boolean, isPending: boolean) =>
    `w-full py-2.5 font-bold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
      outline
        ? "border border-[#F9BC07] text-[#F9BC07] hover:bg-[#F9BC07] hover:text-black"
        : "bg-[#ca8a04] hover:bg-[#b07803] text-white"
    } ${isPending ? "flex items-center justify-center gap-2" : ""}`;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#CFFDED] mb-2">Store</h1>
            <p className="text-gray-400">Top up your coins or stock up on lifelines before your next game.</p>
          </div>
          <div
            className="bg-[#141516] border border-[#323336] rounded-xl px-5 py-3 text-right"
            aria-label="Your coin balance"
          >
            <p className="text-gray-500 text-xs uppercase tracking-wide">Your balance</p>
            <p className="text-2xl font-black text-[#F9BC07]">
              {wallet === null ? "—" : wallet.coins}
              <span className="text-sm font-medium text-gray-400 ml-1">coins</span>
            </p>
          </div>
        </div>

        {/* Purchase error banner */}
        {purchaseError && (
          <div
            role="alert"
            className="mb-8 border border-red-500/40 bg-red-500/10 text-red-200 rounded-xl px-4 py-3 text-sm"
          >
            {purchaseError}
          </div>
        )}

        {/* Coin Packs */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#F9BC07] mb-6 uppercase tracking-wide">
            Coin Packs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COIN_PACKS.map((pack) => {
              const item: StoreItemRef = { itemType: COIN_PACK, itemId: pack.id };
              const key = itemKey(item);
              const isPending = pendingItem === key;
              return (
                <div
                  key={pack.id}
                  className={`relative bg-[#141516] border rounded-xl p-6 flex flex-col items-center text-center transition-all hover:scale-105 ${
                    pack.id === 2
                      ? "border-[#F9BC07] shadow-[0_0_20px_rgba(249,188,7,0.15)]"
                      : "border-[#323336]"
                  }`}
                >
                  {pack.id === 2 && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F9BC07] text-black text-xs font-bold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <img src={pack.icon} alt={`${pack.name} icon`} className="w-16 h-16 mb-4 object-contain" />
                  <h3 className="font-bold text-lg text-[#CFFDED] mb-1">{pack.name}</h3>
                  <p className="text-3xl font-black text-[#F9BC07] mb-1">{pack.coins}</p>
                  <p className="text-gray-500 text-sm mb-4">coins</p>
                  <button
                    type="button"
                    aria-label={`Buy ${pack.name} — ${pack.coins} coins for ${pack.price}`}
                    aria-busy={isPending}
                    disabled={pendingItem !== null}
                    onClick={() => void handlePurchase(item, pack.name)}
                    className={buyButtonClasses(false, isPending)}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        Purchasing…
                      </>
                    ) : (
                      pack.price
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Lifelines */}
        <section>
          <h2 className="text-xl font-semibold text-[#F9BC07] mb-6 uppercase tracking-wide">
            Lifelines
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {LIFELINE_ITEMS.map((itemDef) => {
              const item: StoreItemRef = { itemType: LIFELINE, itemId: itemDef.id };
              const key = itemKey(item);
              const isPending = pendingItem === key;
              return (
                <div
                  key={itemDef.id}
                  className="bg-[#141516] border border-[#323336] rounded-xl p-6 flex flex-col items-center text-center hover:border-[#F9BC07]/50 transition-colors"
                >
                  <img src={itemDef.icon} alt={`${itemDef.name} lifeline icon`} className="w-14 h-14 mb-4 object-contain" />
                  <h3 className="font-bold text-lg text-[#CFFDED] mb-1">{itemDef.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{itemDef.description}</p>
                  <button
                    type="button"
                    aria-label={`Buy ${itemDef.name} lifeline for ${itemDef.price}`}
                    aria-busy={isPending}
                    disabled={pendingItem !== null}
                    onClick={() => void handlePurchase(item, itemDef.name)}
                    className={buyButtonClasses(true, isPending)}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        Purchasing…
                      </>
                    ) : (
                      itemDef.price
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
