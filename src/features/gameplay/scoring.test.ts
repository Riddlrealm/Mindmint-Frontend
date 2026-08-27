import { describe, expect, it } from 'vitest';
import { calculateQuestionScore, getAccumulatedReward } from './scoring';
import type { GameModeDetail } from '../../data/gameModes';

const mockClassicMode: GameModeDetail = {
  id: 'classic',
  name: 'Classic Mode',
  description: 'Standard scoring',
  questionCount: 10,
  duration: '15 min',
  maxScore: 5000,
  features: [],
  instructions: [],
};

const mockPracticeMode: GameModeDetail = {
  id: 'practice',
  name: 'Practice Mode',
  description: 'No time pressure',
  questionCount: 15,
  duration: 'No limit',
  maxScore: 0,
  features: [],
  instructions: [],
};

describe('scoring', () => {
  it('returns 0 points for incorrect answers', () => {
    const score = calculateQuestionScore(false, 5, mockClassicMode, 10, 120);
    expect(score).toBe(0);
  });

  it('awards higher points for faster correct answers in ranked modes', () => {
    const fastScore = calculateQuestionScore(true, 2, mockClassicMode, 10, 120);
    const slowScore = calculateQuestionScore(true, 110, mockClassicMode, 10, 120);

    expect(fastScore).toBeGreaterThan(slowScore);
    expect(fastScore).toBeLessThanOrEqual(500);
    expect(slowScore).toBeGreaterThanOrEqual(250);
  });

  it('accumulates correctly over a 5-question sequence', () => {
    const times = [3, 8, 15, 20, 5];
    let totalScore = 0;

    for (const t of times) {
      totalScore += calculateQuestionScore(true, t, mockClassicMode, 10, 120);
    }

    expect(totalScore).toBeGreaterThan(2000);
    expect(totalScore).toBeLessThanOrEqual(2500);
  });

  it('awards standard score in Practice mode (maxScore 0)', () => {
    const score = calculateQuestionScore(true, 10, mockPracticeMode, 15, 120);
    expect(score).toBeGreaterThanOrEqual(100);
  });

  it('resolves correct reward milestones', () => {
    const mockQuestions = [
      { id: 1, level: 1, reward: '$100', text: '', answers: [] },
      { id: 2, level: 2, reward: '$200', text: '', answers: [] },
      { id: 15, level: 15, reward: '$1,000,000', text: '', answers: [] },
    ];

    expect(getAccumulatedReward(mockQuestions, 1, false)).toBe('$100');
    expect(getAccumulatedReward(mockQuestions, 2, false)).toBe('$200');
    expect(getAccumulatedReward(mockQuestions, 15, true)).toBe('$1,000,000');
  });
});
