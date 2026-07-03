import { Link } from "react-router-dom";
import GameModeSection from "../components/GameMode/GameModeSection";
import gameModeCategories from "../assets/game-mode-categories.png";

export default function GameMode() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Hero Banner */}
      <div className="bg-[#033330] px-6 py-12 md:py-16">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-[#CFFDED] mb-4">
              Choose Your Game Mode
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed mb-6">
              From solo challenges to competitive multiplayer, there's a mode for
              every kind of player. Pick one and start playing.
            </p>
            <Link
              to="/gameplay"
              title="Start playing Mindmint — enter gameplay"
              className="inline-block px-8 py-3 bg-[#ca8a04] hover:bg-[#b07803] text-white font-bold rounded-xl transition-all duration-200 shadow-lg"
            >
              Play Now
            </Link>
          </div>
          <div className="flex-shrink-0 hidden md:block">
            <img
              src={gameModeCategories}
              alt="Game mode categories overview"
              className="w-64 h-auto object-contain rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Game Mode Selector */}
      <GameModeSection />
    </div>
  );
}
