export type GameplayRunStatus = 'in-progress' | 'won' | 'lost' | 'abandoned';

export interface QuestionAnswerRecord {
  level: number;
  questionId: number;
  selectedLetter: string;
  isCorrect: boolean;
  timeUsed: number;
  scoreEarned: number;
  rewardEarned: string;
  answeredAt: number;
}

export interface GameplayRun {
  runId: string;
  modeId: string;
  currentLevel: number;
  maxLevel: number;
  status: GameplayRunStatus;
  score: number;
  totalReward: string;
  startedAt: number;
  lastUpdated: number;
  duration: number; // total seconds elapsed across answers
  answers: QuestionAnswerRecord[];
}

export interface GameplayCompletionRecord {
  runId: string;
  modeId: string;
  status: 'won' | 'lost' | 'abandoned';
  finalLevel: number;
  maxLevel: number;
  totalScore: number;
  finalReward: string;
  totalTimeUsed: number;
  startedAt: number;
  completedAt: number;
  answers: QuestionAnswerRecord[];
}

export const isGameplayRun = (value: unknown): value is GameplayRun => {
  if (value === null || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.runId === 'string' &&
    typeof record.modeId === 'string' &&
    typeof record.currentLevel === 'number' &&
    typeof record.maxLevel === 'number' &&
    typeof record.score === 'number' &&
    typeof record.totalReward === 'string' &&
    typeof record.startedAt === 'number' &&
    typeof record.status === 'string' &&
    ['in-progress', 'won', 'lost', 'abandoned'].includes(record.status as string) &&
    Array.isArray(record.answers)
  );
};
