import type { LevelConfig, GameMode, GradeLevel } from '../../types.ts';

/** Board number range caps for Factors mode, indexed by level (1-based). */
export const FACTORS_BOARD_RANGE: Record<number, number> = {
  1: 12,
  2: 18,
  3: 28,
  4: 40,
  5: 55,
  6: 70,
  7: 85,
  8: 100,
};

/** Grade-based max number range caps. */
const GRADE_RANGE_CAP: Record<GradeLevel, number> = {
  1: 20,
  2: 100,
  3: 100,
  4: 100,
  5: 200,
};

export function getLevelConfig(level: number, mode?: GameMode, grade?: GradeLevel): LevelConfig {
  let troggleCount: number;
  let troggleMoveInterval: number;

  if (level <= 3) {
    troggleCount = 1;
    troggleMoveInterval = 30;
  } else if (level <= 7) {
    troggleCount = 2;
    troggleMoveInterval = 25;
  } else {
    troggleCount = 3;
    troggleMoveInterval = 20;
  }

  const pointsPerCorrect = Math.min(5 + (level - 1) * 5, 75);
  const numberRangeMin = 1;

  let numberRangeMax: number;
  if (mode === 'factors') {
    const maxRangeLevel = Math.max(...Object.keys(FACTORS_BOARD_RANGE).map(Number));
    const rangeLevel = Math.min(level, maxRangeLevel);
    numberRangeMax = FACTORS_BOARD_RANGE[rangeLevel];
  } else {
    const defaultCap = 100;
    numberRangeMax = Math.min(12 + level * 4, defaultCap);
  }

  // Apply grade-based cap if provided
  if (grade) {
    const gradeCap = GRADE_RANGE_CAP[grade];
    numberRangeMax = Math.min(numberRangeMax, gradeCap);
  }

  return {
    level,
    troggleCount,
    troggleMoveInterval,
    numberRangeMin,
    numberRangeMax,
    pointsPerCorrect,
  };
}
