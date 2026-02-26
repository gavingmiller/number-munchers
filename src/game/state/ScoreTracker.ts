import type { ScoreData } from '../../types.ts';
import { getLevelConfig } from '../logic/DifficultyTable.ts';

export function createScore(): ScoreData {
  return {
    current: 0,
    extraLifeThresholds: [1000, 10000],
    pointsPerCorrect: 5,
  };
}

export function addPoints(
  score: ScoreData,
  points: number,
): { score: ScoreData; lifeEarned: boolean } {
  const newCurrent = score.current + points;
  let lifeEarned = false;
  const remainingThresholds: number[] = [];

  for (const threshold of score.extraLifeThresholds) {
    if (score.current < threshold && newCurrent >= threshold) {
      lifeEarned = true;
    } else {
      remainingThresholds.push(threshold);
    }
  }

  return {
    score: {
      ...score,
      current: newCurrent,
      extraLifeThresholds: remainingThresholds,
    },
    lifeEarned,
  };
}

export function updatePointsPerCorrect(
  score: ScoreData,
  level: number,
): ScoreData {
  const config = getLevelConfig(level);
  return { ...score, pointsPerCorrect: config.pointsPerCorrect };
}
