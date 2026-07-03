const COIN_PACKS = [
  { id: 1, name: "Starter Pack", coins: 100, price: "2 XLM", icon: "/coins.svg", popular: false },
  { id: 2, name: "Explorer Pack", coins: 500, price: "8 XLM", icon: "/coins.svg", popular: true },
  { id: 3, name: "Champion Pack", coins: 1500, price: "20 XLM", icon: "/bag-coins.svg", popular: false },
  { id: 4, name: "Legend Pack", coins: 5000, price: "60 XLM", icon: "/bag-coins.svg", popular: false },
];

const LIFELINE_ITEMS = [
  { id: 1, name: "50:50", description: "Remove two wrong answers", price: "10 coins", icon: "/fiftyfifty.svg" },
  { id: 2, name: "Call a Friend", description: "Get a hint from a virtual expert", price: "15 coins", icon: "/call.svg" },
  { id: 3, name: "Ask the Audience", description: "See the crowd's vote breakdown", price: "15 coins", icon: "/audience.svg" },
];

export default function Store() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-[#CFFDED] mb-2">Store</h1>
          <p className="text-gray-400">Top up your coins or stock up on lifelines before your next game.</p>
        </div>

        {/* Coin Packs */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[#F9BC07] mb-6 uppercase tracking-wide">
            Coin Packs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {COIN_PACKS.map((pack) => (
              <div
                key={pack.id}
                className={`relative bg-[#141516] border rounded-xl p-6 flex flex-col items-center text-center transition-all hover:scale-105 ${
                  pack.popular
                    ? "border-[#F9BC07] shadow-[0_0_20px_rgba(249,188,7,0.15)]"
                    : "border-[#323336]"
                }`}
              >
                {pack.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#F9BC07] text-black text-xs font-bold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <img src={pack.icon} alt="" className="w-16 h-16 mb-4 object-contain" />
                <h3 className="font-bold text-lg text-[#CFFDED] mb-1">{pack.name}</h3>
                <p className="text-3xl font-black text-[#F9BC07] mb-1">{pack.coins}</p>
                <p className="text-gray-500 text-sm mb-4">coins</p>
                <button
                  type="button"
                  aria-label={`Buy ${pack.name} — ${pack.coins} coins for ${pack.price}`}
                  className="w-full py-2.5 bg-[#ca8a04] hover:bg-[#b07803] text-white font-bold rounded-lg transition-colors"
                >
                  {pack.price}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Lifelines */}
        <section>
          <h2 className="text-xl font-semibold text-[#F9BC07] mb-6 uppercase tracking-wide">
            Lifelines
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {LIFELINE_ITEMS.map((item) => (
              <div
                key={item.id}
                className="bg-[#141516] border border-[#323336] rounded-xl p-6 flex flex-col items-center text-center hover:border-[#F9BC07]/50 transition-colors"
              >
                <img src={item.icon} alt="" className="w-14 h-14 mb-4 object-contain" />
                <h3 className="font-bold text-lg text-[#CFFDED] mb-1">{item.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                <button
                  type="button"
                  aria-label={`Buy ${item.name} lifeline for ${item.price}`}
                  className="w-full py-2.5 border border-[#F9BC07] text-[#F9BC07] hover:bg-[#F9BC07] hover:text-black font-bold rounded-lg transition-colors"
                >
                  {item.price}
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
