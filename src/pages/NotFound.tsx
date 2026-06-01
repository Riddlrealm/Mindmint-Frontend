
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-[500px] rounded-xl border border-white/10  p-8 text-center shadow-2xl backdrop-blur-md">
        {/* Animated Icon Container */}
        <div className="animate-pulse text-6xl mb-4">
          <span>🧭</span>
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-4">
          404 - Route Coordinates Lost
        </h1>
        
        <p className="text-sm text-slate-400 leading-relaxed mb-8">
          The system path you requested does not exist or has been shifted across the stellar network. Let's get you back on track.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          {/* Action 1: Go Back */}
          <button 
            className="px-6 py-3 text-sm font-semibold rounded-md cursor-pointer transition-colors bg-slate-800 text-slate-200 hover:bg-slate-700" 
            onClick={() => navigate(-1)}
          >
            Go Back
          </button>

          {/* Action 2: Return Home */}
          <button 
            className="px-6 py-3 text-sm font-semibold rounded-md cursor-pointer transition-colors bg-blue-600 text-white hover:bg-blue-500" 
            onClick={() => navigate("/")}
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
}