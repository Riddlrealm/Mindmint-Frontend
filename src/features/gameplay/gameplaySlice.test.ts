import { describe, expect, it } from 'vitest';
import gameplayReducer, {
  startRun,
  recordAnswer,
  abandonRun,
  clearRun,
} from './gameplaySlice';
import { isGameplayRun } from './types';
import type { GameModeDetail } from '../../data/gameModes';

const mockMode: GameModeDetail = {
  id: 'classic',
  name: 'Classic Mode',
  description: 'Standard mode',
  questionCount: 10,
  duration: '15 min',
  maxScore: 5000,
  features: [],
  instructions: [],
};

describe('gameplaySlice', () => {
  it('starts a fresh in-progress run', () => {
    const state = gameplayReducer(
      undefined,
      startRun({ modeId: 'classic', maxLevel: 10 }),
    );
    expect(state.currentRun).not.toBeNull();
    expect(state.currentRun?.modeId).toBe('classic');
    expect(state.currentRun?.currentLevel).toBe(1);
    expect(state.currentRun?.status).toBe('in-progress');
    expect(state.currentRun?.score).toBe(0);
    expect(state.lastCompletion).toBeNull();
  });

  it('records correct answer and advances level', () => {
    let state = gameplayReducer(
      undefined,
      startRun({ modeId: 'classic', maxLevel: 10 }),
    );

    state = gameplayReducer(
      state,
      recordAnswer({
        questionId: 1,
        level: 1,
        selectedLetter: 'B',
        isCorrect: true,
        timeUsed: 10,
        mode: mockMode,
        totalQuestions: 10,
      }),
    );

    expect(state.currentRun?.currentLevel).toBe(2);
    expect(state.currentRun?.score ?? 0).toBeGreaterThan(0);
    expect(state.currentRun?.answers).toHaveLength(1);
    expect(state.currentRun?.status).toBe('in-progress');
  });

  it('records wrong answer and finalizes run as lost', () => {
    let state = gameplayReducer(
      undefined,
      startRun({ modeId: 'classic', maxLevel: 10 }),
    );

    // Question 1 correct
    state = gameplayReducer(
      state,
      recordAnswer({
        questionId: 1,
        level: 1,
        selectedLetter: 'B',
        isCorrect: true,
        timeUsed: 5,
        mode: mockMode,
        totalQuestions: 10,
      }),
    );

    // Question 2 incorrect
    state = gameplayReducer(
      state,
      recordAnswer({
        questionId: 2,
        level: 2,
        selectedLetter: 'A',
        isCorrect: false,
        timeUsed: 20,
        mode: mockMode,
        totalQuestions: 10,
      }),
    );

    expect(state.currentRun?.status).toBe('lost');
    expect(state.lastCompletion?.status).toBe('lost');
    expect(state.lastCompletion?.finalLevel).toBe(2);
    expect(state.lastCompletion?.totalScore ?? 0).toBeGreaterThan(0);
  });

  it('completing final level finalizes run as won', () => {
    let state = gameplayReducer(
      undefined,
      startRun({ modeId: 'classic', maxLevel: 1 }),
    );

    state = gameplayReducer(
      state,
      recordAnswer({
        questionId: 1,
        level: 1,
        selectedLetter: 'B',
        isCorrect: true,
        timeUsed: 5,
        mode: mockMode,
        totalQuestions: 1,
      }),
    );

    expect(state.currentRun?.status).toBe('won');
    expect(state.lastCompletion?.status).toBe('won');
    expect(state.lastCompletion?.finalReward).toBe('$1,000,000');
  });

  it('abandonRun marks active run as abandoned', () => {
    let state = gameplayReducer(
      undefined,
      startRun({ modeId: 'classic', maxLevel: 10 }),
    );
    state = gameplayReducer(state, abandonRun());
    expect(state.currentRun).toBeNull();
  });

  it('clearRun resets active run and last completion', () => {
    let state = gameplayReducer(
      undefined,
      startRun({ modeId: 'classic', maxLevel: 10 }),
    );
    state = gameplayReducer(state, clearRun());
    expect(state.currentRun).toBeNull();
    expect(state.lastCompletion).toBeNull();
  });

  it('validates valid gameplay run shape via type guard', () => {
    const validRun = {
      runId: 'run_123',
      modeId: 'classic',
      currentLevel: 3,
      maxLevel: 10,
      status: 'in-progress',
      score: 1200,
      totalReward: '$300',
      startedAt: Date.now(),
      lastUpdated: Date.now(),
      duration: 35,
      answers: [],
    };

    expect(isGameplayRun(validRun)).toBe(true);
    expect(isGameplayRun(null)).toBe(false);
    expect(isGameplayRun({ status: 'invalid' })).toBe(false);
  });
});
