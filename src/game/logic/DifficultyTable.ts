import type { LevelConfig } from '../../types.ts';

export function getLevelConfig(level: number): LevelConfig {
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
  const numberRangeMax = Math.min(12 + level * 4, 100);

  return {
    level,
    troggleCount,
    troggleMoveInterval,
    numberRangeMin,
    numberRangeMax,
    pointsPerCorrect,
  };
}
