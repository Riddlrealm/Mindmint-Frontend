import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import GameHeader from '../components/gameplay/GameHeader';
import GameLevelContainer from '../components/gameplay/GameLevelContainer';
import QuestionContainer from '../components/gameplay/QuestionContainer';
import { MOCK_GAME_DATA } from '../data/mockGameData';
import { gameModes } from '../data/gameModes';
import { useAppDispatch, useAppSelector } from '../hooks';
import { addNotification } from '../features/notifications/notificationsSlice';
import {
  startRun,
  recordAnswer,
  abandonRun,
} from '../features/gameplay/gameplaySlice';

const Gameplay: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const currentRun = useAppSelector((state) => state.gameplay.currentRun);
  const lastCompletion = useAppSelector((state) => state.gameplay.lastCompletion);

  // Mode handoff contract: `/gameplay?mode=<id>`
  const modeId = searchParams.get('mode');
  const mode = useMemo(
    () => gameModes.find((m) => m.id === modeId) ?? gameModes[0],
    [modeId],
  );

  const maxLevel = Math.min(
    mode.questionCount > 0 ? mode.questionCount : MOCK_GAME_DATA.length,
    MOCK_GAME_DATA.length,
  );

  // Prompt player to resume if an existing run matches or offer fresh start
  const [dismissedResume, setDismissedResume] = useState(false);
  const showResumePrompt =
    !dismissedResume &&
    Boolean(
      currentRun &&
        currentRun.status === 'in-progress' &&
        currentRun.modeId === mode.id &&
        currentRun.currentLevel > 1,
    );

  useEffect(() => {
    if (!currentRun || currentRun.status !== 'in-progress') {
      dispatch(startRun({ modeId: mode.id, maxLevel }));
    }
  }, [dispatch, mode.id, maxLevel, currentRun]);

  const currentLevel = currentRun?.currentLevel ?? 1;
  const currentScore = currentRun?.score ?? 0;
  const currentReward = currentRun?.totalReward ?? '$0';

  const currentQuestionData = useMemo(() => {
    return (
      MOCK_GAME_DATA.find((q) => q.level === currentLevel) || MOCK_GAME_DATA[0]
    );
  }, [currentLevel]);

  const handleAnswerSubmit = (
    selectedLetter: string,
    isCorrect: boolean,
    timeUsed: number,
  ) => {
    // If run was not initialized yet, initialize before recording
    if (!currentRun || currentRun.status !== 'in-progress') {
      dispatch(startRun({ modeId: mode.id, maxLevel }));
    }

    dispatch(
      recordAnswer({
        questionId: currentQuestionData.id,
        level: currentLevel,
        selectedLetter,
        isCorrect,
        timeUsed,
        mode,
        totalQuestions: maxLevel,
      }),
    );

    if (isCorrect) {
      if (currentLevel >= maxLevel) {
        dispatch(
          addNotification({
            type: 'success',
            title: 'Congratulations!',
            message: `You are a Mindmint Millionaire! Final Score: ${currentScore}`,
          }),
        );
      }
    }
  };

  const handleRestart = () => {
    dispatch(abandonRun());
    dispatch(startRun({ modeId: mode.id, maxLevel }));
    setDismissedResume(true);
  };

  const handleResume = () => {
    setDismissedResume(true);
  };

  const isGameOver = lastCompletion?.status === 'lost';
  const isGameWon = lastCompletion?.status === 'won';

  return (
    <div className="h-screen w-full bg-[#0f0f0f] flex flex-col overflow-hidden font-sans">
      <GameHeader />

      {/* Resume Affordance Banner */}
      {showResumePrompt && currentRun && (
        <div className="bg-blue-900/80 border-b border-blue-500 px-6 py-2 flex items-center justify-between text-white text-sm">
          <span>
            Resumed previous <strong>{mode.name}</strong> run at Level{' '}
            <strong>{currentRun.currentLevel}</strong> (Score:{' '}
            <strong>{currentRun.score}</strong>).
          </span>
          <div className="flex gap-3">
            <button
              onClick={handleResume}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded font-semibold text-xs"
            >
              Continue Run
            </button>
            <button
              onClick={handleRestart}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded font-semibold text-xs"
            >
              Restart Fresh
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-row px-12 py-10 gap-16 items-start justify-center overflow-hidden">
        <div className="w-87.5 shrink-0 h-full">
          <GameLevelContainer
            currentLevel={currentLevel}
            levelsData={MOCK_GAME_DATA}
          />
        </div>

        <div className="flex-1 h-full flex flex-col overflow-hidden">
          <div className="w-full h-1/2 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#9CA3AF] text-sm" aria-live="polite">
                {mode.name} — Level {currentLevel} of {maxLevel}
              </p>
              <div className="flex gap-4 text-xs font-mono">
                <span className="text-yellow-400">Score: {currentScore}</span>
                <span className="text-green-400">Reward: {currentReward}</span>
              </div>
            </div>

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

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center p-10 border-2 border-red-500 bg-gray-900 rounded-2xl max-w-md w-full">
            <h2 className="text-4xl font-bold text-white mb-2">GAME OVER</h2>
            <p className="text-gray-300 mb-2">
              Reached Level {lastCompletion.finalLevel}
            </p>
            <div className="bg-black/50 p-4 rounded-lg my-4 text-left font-mono text-sm space-y-1">
              <div className="flex justify-between text-yellow-400">
                <span>Final Score:</span>
                <span>{lastCompletion.totalScore}</span>
              </div>
              <div className="flex justify-between text-green-400">
                <span>Banked Reward:</span>
                <span>{lastCompletion.finalReward}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Time Played:</span>
                <span>{Math.round(lastCompletion.totalTimeUsed)}s</span>
              </div>
            </div>
            <button
              onClick={() => {
                dispatch(startRun({ modeId: mode.id, maxLevel }));
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-500 transition-colors w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Victory Modal */}
      {isGameWon && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="text-center p-10 border-2 border-green-500 bg-gray-900 rounded-2xl max-w-md w-full">
            <h2 className="text-4xl font-bold text-green-400 mb-2">
              VICTORY!
            </h2>
            <p className="text-gray-200 mb-2">
              You became a Mindmint Millionaire!
            </p>
            <div className="bg-black/50 p-4 rounded-lg my-4 text-left font-mono text-sm space-y-1">
              <div className="flex justify-between text-yellow-400">
                <span>Final Score:</span>
                <span>{lastCompletion.totalScore}</span>
              </div>
              <div className="flex justify-between text-green-400">
                <span>Reward Won:</span>
                <span>{lastCompletion.finalReward}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Total Duration:</span>
                <span>{Math.round(lastCompletion.totalTimeUsed)}s</span>
              </div>
            </div>
            <button
              onClick={() => {
                dispatch(startRun({ modeId: mode.id, maxLevel }));
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-500 transition-colors w-full"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gameplay;
