import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import GameHeader from '../components/gameplay/GameHeader';
import GameLevelContainer from '../components/gameplay/GameLevelContainer';
import QuestionContainer from '../components/gameplay/QuestionContainer';
import { MOCK_GAME_DATA } from '../data/mockGameData';
import { gameModes } from '../data/gameModes';
import { useAppDispatch } from '../hooks';
import { addNotification } from '../features/notifications/notificationsSlice';

const Gameplay: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);

  // Mode handoff contract: `/gameplay?mode=<id>`, written by the /game-mode
  // page's "Play Now" link (and readable by the registered game slice).
  // The id is validated against `gameModes`; an unknown or missing id falls
  // back to the first mode so a tampered or stale URL never crashes gameplay.
  const modeId = searchParams.get('mode');
  const mode = useMemo(
    () => gameModes.find((m) => m.id === modeId) ?? gameModes[0],
    [modeId],
  );

  // The mode's `questionCount` defines the run length; capped at the number of
  // available mock levels. `duration` and `maxScore` are display metadata for
  // now — gameplay does not currently read them (no real run/scoring engine).
  const maxLevel = Math.min(
    mode.questionCount > 0 ? mode.questionCount : MOCK_GAME_DATA.length,
    MOCK_GAME_DATA.length,
  );

  const currentQuestionData = useMemo(() => {
    return MOCK_GAME_DATA.find(q => q.level === currentLevel) || MOCK_GAME_DATA[0];
  }, [currentLevel]);

  const handleLevelSelection = () => {
    // level selection UI — gameplay progression is handled by handleAnswerSubmit
  };

  const handleAnswerSubmit = (_letter: string, isCorrect: boolean) => {
    if (isCorrect) {
      if (currentLevel < maxLevel) {
        setCurrentLevel(prev => prev + 1);
      } else {
        dispatch(
          addNotification({
            type: 'success',
            title: 'Congratulations!',
            message: 'You are a Mindmint Millionaire!',
          }),
        );
      }
    } else {
      setIsGameOver(true);
    }
  };

  return (
    <div className="h-screen w-full bg-[#0f0f0f] flex flex-col overflow-hidden font-sans">
      <GameHeader />

      <div className="flex flex-1 flex-row px-12 py-10 gap-16 items-start justify-center overflow-hidden">
        
        <div className="w-87.5 shrink-0 h-full">
          <GameLevelContainer 
            currentLevel={currentLevel} 
            levelsData={MOCK_GAME_DATA} 
            onLevelSelect={handleLevelSelection} 
          />
        </div>

        <div className="flex-1 h-full flex flex-col overflow-hidden">
          
          <div className="w-full h-1/2 flex flex-col"> 
          
            <p className="text-[#9CA3AF] text-sm mb-2" aria-live="polite">
              {mode.name}
            </p>

            <QuestionContainer 
              key={currentLevel} 
              questionText={currentQuestionData.text}
              answers={currentQuestionData.answers}
              onAnswerSubmit={handleAnswerSubmit}
              timeLimit={29 * 60 + 59} 
            />
          </div>

          <div className="flex-1 w-full" /> 
        </div>
      </div>

      {isGameOver && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center p-10 border-2 border-red-500 bg-gray-900 rounded-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">GAME OVER</h2>
            <button 
              onClick={() => { setCurrentLevel(1); setIsGameOver(false); }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gameplay;
