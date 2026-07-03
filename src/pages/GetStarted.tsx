import { Link } from "react-router-dom";

export default function GetStarted() {
  return (
    <div className="min-h-screen bg-[#01100F] flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#CFFDED] mb-6">
          Get Started with Mindmint
        </h1>
        <p className="text-gray-400 text-lg mb-12 leading-relaxed">
          Challenge your mind, compete with friends, and earn on-chain rewards.
          Pick your path below to begin your journey.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            to="/sign-in"
            className="inline-block px-10 py-4 bg-[#ca8a04] hover:bg-[#b07803] text-white font-bold text-lg rounded-xl transition-all duration-200 shadow-lg"
          >
            Sign In
          </Link>
          <Link
            to="/game-mode"
            className="inline-block px-10 py-4 border-2 border-[#F9BC07] text-[#F9BC07] hover:bg-[#F9BC07] hover:text-black font-bold text-lg rounded-xl transition-all duration-200"
          >
            Browse Game Modes
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-[#141516] border border-[#323336] rounded-lg p-6">
            <div className="text-3xl mb-3" aria-hidden="true">🧠</div>
            <h3 className="text-[#CFFDED] font-semibold mb-2">Test Your Mind</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              15 levels of increasing difficulty. Each correct answer takes you closer to becoming a Mindmint Millionaire.
            </p>
          </div>
          <div className="bg-[#141516] border border-[#323336] rounded-lg p-6">
            <div className="text-3xl mb-3" aria-hidden="true">🏆</div>
            <h3 className="text-[#CFFDED] font-semibold mb-2">Compete & Earn</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Climb the leaderboard, earn XLM tokens, and mint exclusive NFT achievements for your victories.
            </p>
          </div>
          <div className="bg-[#141516] border border-[#323336] rounded-lg p-6">
            <div className="text-3xl mb-3" aria-hidden="true">🎮</div>
            <h3 className="text-[#CFFDED] font-semibold mb-2">Multiple Modes</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Classic, Challenge, Multiplayer, Daily Challenge and more — a mode for every type of player.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
