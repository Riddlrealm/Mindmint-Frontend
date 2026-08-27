import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../session/storageKeys';
import { readJson } from '../../session/storage';
import type {
  GameplayRun,
  GameplayCompletionRecord,
  QuestionAnswerRecord,
} from './types';
import { isGameplayRun } from './types';
import { calculateQuestionScore, getAccumulatedReward } from './scoring';
import type { GameModeDetail } from '../../data/gameModes';
import { MOCK_GAME_DATA } from '../../data/mockGameData';

interface GameplayState {
  currentRun: GameplayRun | null;
  lastCompletion: GameplayCompletionRecord | null;
}

const getInitialRun = (): GameplayRun | null => {
  const saved = readJson(STORAGE_KEYS.GAMEPLAY_RUN, isGameplayRun);
  if (saved && saved.status === 'in-progress') {
    return saved;
  }
  return null;
};

const initialState: GameplayState = {
  currentRun: getInitialRun(),
  lastCompletion: null,
};

const saveRunToStorage = (run: GameplayRun | null) => {
  if (typeof window === 'undefined') return;
  if (!run) {
    try {
      localStorage.removeItem(STORAGE_KEYS.GAMEPLAY_RUN);
    } catch {
      // safe fallback
    }
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEYS.GAMEPLAY_RUN, JSON.stringify(run));
  } catch {
    // safe fallback
  }
};

const saveCompletionToStorage = (record: GameplayCompletionRecord) => {
  if (typeof window === 'undefined') return;
  try {
    const existingRaw = localStorage.getItem(STORAGE_KEYS.COMPLETED_RUNS);
    const existingList: GameplayCompletionRecord[] = existingRaw ? JSON.parse(existingRaw) : [];
    existingList.push(record);
    localStorage.setItem(STORAGE_KEYS.COMPLETED_RUNS, JSON.stringify(existingList));
  } catch {
    // safe fallback
  }
};

export const gameplaySlice = createSlice({
  name: 'gameplay',
  initialState,
  reducers: {
    startRun: (
      state,
      action: PayloadAction<{ modeId: string; maxLevel: number }>,
    ) => {
      const now = Date.now();
      const newRun: GameplayRun = {
        runId: `run_${now}_${Math.random().toString(36).substring(2, 8)}`,
        modeId: action.payload.modeId,
        currentLevel: 1,
        maxLevel: action.payload.maxLevel,
        status: 'in-progress',
        score: 0,
        totalReward: '$0',
        startedAt: now,
        lastUpdated: now,
        duration: 0,
        answers: [],
      };
      state.currentRun = newRun;
      state.lastCompletion = null;
      saveRunToStorage(newRun);
    },

    recordAnswer: (
      state,
      action: PayloadAction<{
        questionId: number;
        level: number;
        selectedLetter: string;
        isCorrect: boolean;
        timeUsed: number;
        mode: GameModeDetail;
        totalQuestions: number;
      }>,
    ) => {
      const run = state.currentRun;
      if (!run || run.status !== 'in-progress') return;

      const {
        questionId,
        level,
        selectedLetter,
        isCorrect,
        timeUsed,
        mode,
        totalQuestions,
      } = action.payload;

      const scoreEarned = calculateQuestionScore(
        isCorrect,
        timeUsed,
        mode,
        totalQuestions,
      );

      const rewardEarned = isCorrect
        ? getAccumulatedReward(MOCK_GAME_DATA, level, level >= run.maxLevel)
        : run.totalReward;

      const answerRecord: QuestionAnswerRecord = {
        level,
        questionId,
        selectedLetter,
        isCorrect,
        timeUsed,
        scoreEarned,
        rewardEarned,
        answeredAt: Date.now(),
      };

      run.answers.push(answerRecord);
      run.duration += timeUsed;
      run.score += scoreEarned;
      run.lastUpdated = Date.now();

      if (isCorrect) {
        run.totalReward = rewardEarned;
        if (run.currentLevel < run.maxLevel) {
          run.currentLevel += 1;
          saveRunToStorage(run);
        } else {
          // Player won the entire run!
          run.status = 'won';
          const completion: GameplayCompletionRecord = {
            runId: run.runId,
            modeId: run.modeId,
            status: 'won',
            finalLevel: run.currentLevel,
            maxLevel: run.maxLevel,
            totalScore: run.score,
            finalReward: run.totalReward,
            totalTimeUsed: run.duration,
            startedAt: run.startedAt,
            completedAt: Date.now(),
            answers: [...run.answers],
          };
          state.lastCompletion = completion;
          saveCompletionToStorage(completion);
          saveRunToStorage(null); // Finished runs do not auto-resume
        }
      } else {
        // Player lost the run
        run.status = 'lost';
        const completion: GameplayCompletionRecord = {
          runId: run.runId,
          modeId: run.modeId,
          status: 'lost',
          finalLevel: run.currentLevel,
          maxLevel: run.maxLevel,
          totalScore: run.score,
          finalReward: run.totalReward,
          totalTimeUsed: run.duration,
          startedAt: run.startedAt,
          completedAt: Date.now(),
          answers: [...run.answers],
        };
        state.lastCompletion = completion;
        saveCompletionToStorage(completion);
        saveRunToStorage(null); // Finished runs do not auto-resume
      }
    },

    abandonRun: (state) => {
      if (state.currentRun && state.currentRun.status === 'in-progress') {
        state.currentRun.status = 'abandoned';
        saveRunToStorage(null);
      }
      state.currentRun = null;
    },

    clearRun: (state) => {
      state.currentRun = null;
      state.lastCompletion = null;
      saveRunToStorage(null);
    },
  },
});

export const { startRun, recordAnswer, abandonRun, clearRun } =
  gameplaySlice.actions;
export default gameplaySlice.reducer;
