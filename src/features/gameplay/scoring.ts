import type { GameModeDetail } from '../../data/gameModes';
import type { QuestionData } from '../../data/mockGameData';

/**
 * Computes the score awarded for an answer.
 * 
 * Rules:
 * - If incorrect: 0 points.
 * - If mode has `maxScore > 0`:
 *   - Base points per question = Math.floor(maxScore / totalQuestions).
 *   - Speed multiplier: Answers within expected response window receive up to full base points;
 *     slower answers decay smoothly towards 50% of base points.
 *   - Formula: base * (0.5 + 0.5 * Math.max(0, 1 - timeUsed / maxTimeWindow))
 * - If mode has `maxScore === 0` (e.g. Practice or Endless):
 *   - Standard base of 100 points per correct answer, with speed bonus up to 150 points.
 */
export function calculateQuestionScore(
  isCorrect: boolean,
  timeUsed: number,
  mode: GameModeDetail,
  totalQuestions: number,
  timeLimit: number = 120,
): number {
  if (!isCorrect) {
    return 0;
  }

  const effectiveTotal = totalQuestions > 0 ? totalQuestions : 15;
  const timeWindow = Math.min(timeLimit, 120); // 2 minute standard window per question

  if (mode.maxScore > 0) {
    const basePerQuestion = Math.max(10, Math.floor(mode.maxScore / effectiveTotal));
    const speedRatio = Math.max(0, Math.min(1, (timeWindow - timeUsed) / timeWindow));
    // 50% guaranteed for accuracy, up to 50% extra for speed
    const score = Math.round(basePerQuestion * (0.5 + 0.5 * speedRatio));
    return Math.max(1, score);
  }

  // Practice / Endless mode fallback
  const speedBonus = Math.max(0, Math.min(50, Math.round((timeWindow - timeUsed) * 0.5)));
  return 100 + speedBonus;
}

/**
 * Resolves the cumulative reward string up to the current level.
 */
export function getAccumulatedReward(
  questions: QuestionData[],
  levelReached: number,
  isWin: boolean,
): string {
  if (isWin) {
    const last = questions[questions.length - 1];
    return last?.reward ?? '$1,000,000';
  }

  const currentQ = questions.find((q) => q.level === levelReached);
  if (currentQ) {
    return currentQ.reward;
  }

  return '$0';
}
