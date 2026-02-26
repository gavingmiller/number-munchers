import { describe, it, expect } from 'vitest';
import {
  createScore,
  addPoints,
  updatePointsPerCorrect,
} from '../../src/game/state/ScoreTracker.ts';

describe('createScore', () => {
  it('starts at 0 with thresholds at 1000 and 10000', () => {
    const score = createScore();
    expect(score.current).toBe(0);
    expect(score.extraLifeThresholds).toEqual([1000, 10000]);
    expect(score.pointsPerCorrect).toBe(5);
  });
});

describe('addPoints', () => {
  it('adds points to current score', () => {
    const score = createScore();
    const result = addPoints(score, 50);
    expect(result.score.current).toBe(50);
  });

  it('earns life when crossing 1000 threshold', () => {
    const score = { ...createScore(), current: 990 };
    const result = addPoints(score, 20);
    expect(result.lifeEarned).toBe(true);
    expect(result.score.current).toBe(1010);
    expect(result.score.extraLifeThresholds).not.toContain(1000);
  });

  it('earns life when crossing 10000 threshold', () => {
    const score = {
      current: 9990,
      extraLifeThresholds: [10000],
      pointsPerCorrect: 25,
    };
    const result = addPoints(score, 20);
    expect(result.lifeEarned).toBe(true);
    expect(result.score.extraLifeThresholds).not.toContain(10000);
  });

  it('does not earn life below threshold', () => {
    const score = createScore();
    const result = addPoints(score, 50);
    expect(result.lifeEarned).toBe(false);
  });

  it('does not mutate original score', () => {
    const score = createScore();
    addPoints(score, 50);
    expect(score.current).toBe(0);
  });
});

describe('updatePointsPerCorrect', () => {
  it('updates based on level config', () => {
    const score = createScore();
    const updated = updatePointsPerCorrect(score, 5);
    expect(updated.pointsPerCorrect).toBe(25);
  });
});
