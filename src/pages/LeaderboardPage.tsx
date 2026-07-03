import { mockLeaderboardPlayers } from "../data/mockLeaderboardData";

const PODIUM_STYLES = [
  // 2nd place (silver) — render left
  {
    borderColor: "border-[#C0C0C0]",
    crownColor: "text-[#C0C0C0]",
    badgeBg: "bg-[#C0C0C0]",
    label: "2nd",
    heightClass: "h-24",
    order: 1,
    rank: 2,
  },
  // 1st place (gold) — render centre, tallest
  {
    borderColor: "border-[#F9BC07]",
    crownColor: "text-[#F9BC07]",
    badgeBg: "bg-[#F9BC07]",
    label: "1st",
    heightClass: "h-32",
    order: 2,
    rank: 1,
  },
  // 3rd place (bronze) — render right
  {
    borderColor: "border-[#CD7F32]",
    crownColor: "text-[#CD7F32]",
    badgeBg: "bg-[#CD7F32]",
    label: "3rd",
    heightClass: "h-20",
    order: 3,
    rank: 3,
  },
];

const LeaderboardPage = () => {
  // podiumOrder: [silver(2nd), gold(1st), bronze(3rd)] for visual layout
  const podiumOrder = [
    { style: PODIUM_STYLES[0], player: mockLeaderboardPlayers[1] }, // 2nd
    { style: PODIUM_STYLES[1], player: mockLeaderboardPlayers[0] }, // 1st
    { style: PODIUM_STYLES[2], player: mockLeaderboardPlayers[2] }, // 3rd
  ];

  return (
    <div className="bg-[#0F0F0F] min-h-screen text-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[#CFFDED] mb-2">
            Leaderboard
          </h1>
          <p className="text-gray-400">See how you rank against other players</p>
        </div>

        {/* ── Top-3 Podium ── */}
        <div className="flex items-end justify-center gap-6 mb-10">
          {podiumOrder.map(({ style, player }) => (
            <div
              key={style.rank}
              className="flex flex-col items-center gap-2"
            >
              {/* Crown / medal indicator */}
              <span className={`text-2xl font-black ${style.crownColor}`}>
                {style.rank === 1 ? "👑" : style.label}
              </span>

              {/* Avatar */}
              <div
                className={`rounded-full border-4 ${style.borderColor} overflow-hidden ${style.rank === 1 ? "w-20 h-20" : "w-16 h-16"}`}
              >
                <img
                  src={player.avatar}
                  alt={player.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name */}
              <span className="font-semibold text-[#CFFDED] text-sm">
                {player.name}
              </span>

              {/* Score */}
              <span className="text-xs text-gray-400">
                {player.score.toLocaleString()} pts
              </span>

              {/* Podium block */}
              <div
                className={`w-28 ${style.heightClass} ${style.badgeBg} rounded-t-lg flex items-center justify-center`}
              >
                <span className="text-black font-black text-xl">{style.rank}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Full Ranked Table ── */}
        <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-[#2A2A2A]">
          <div className="px-6 py-4 border-b border-[#2A2A2A]">
            <h2 className="text-lg font-bold text-[#CFFDED]">All Rankings</h2>
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-3 w-12">Rank</th>
                <th className="px-6 py-3">Player</th>
                <th className="px-6 py-3 text-center">Level</th>
                <th className="px-6 py-3 text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {mockLeaderboardPlayers.map((player, index) => {
                const rank = index + 1;
                const rankColors: Record<number, string> = {
                  1: "text-[#F9BC07]",
                  2: "text-[#C0C0C0]",
                  3: "text-[#CD7F32]",
                };
                const rankColor = rankColors[rank] ?? "text-gray-400";

                return (
                  <tr
                    key={player.id}
                    className="border-t border-[#2A2A2A] hover:bg-[#222222] transition-colors"
                  >
                    {/* Rank */}
                    <td className="px-6 py-4">
                      <span className={`font-bold text-lg ${rankColor}`}>
                        {rank}
                      </span>
                    </td>

                    {/* Avatar + Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={player.avatar}
                          alt={player.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-[#2A2A2A]"
                        />
                        <span className="font-medium text-white">
                          {player.name}
                        </span>
                      </div>
                    </td>

                    {/* Level */}
                    <td className="px-6 py-4 text-center">
                      <span className="text-[#CFFDED] font-semibold">
                        {player.level}
                      </span>
                    </td>

                    {/* Score */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {player.scoreIcon && (
                          <img
                            src={player.scoreIcon}
                            alt="score icon"
                            className="w-4 h-4"
                          />
                        )}
                        <span className="font-bold text-[#F9BC07]">
                          {player.score.toLocaleString()}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
