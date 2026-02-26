import { describe, it, expect } from 'vitest';
import { getLevelConfig } from '../../src/game/logic/DifficultyTable.ts';

describe('getLevelConfig', () => {
  it('level 1 has troggleCount=1 and moveInterval=30', () => {
    const config = getLevelConfig(1);
    expect(config.troggleCount).toBe(1);
    expect(config.troggleMoveInterval).toBe(30);
  });

  it('level 3 has troggleCount=1', () => {
    expect(getLevelConfig(3).troggleCount).toBe(1);
  });

  it('level 4 has troggleCount=2 and moveInterval=25', () => {
    const config = getLevelConfig(4);
    expect(config.troggleCount).toBe(2);
    expect(config.troggleMoveInterval).toBe(25);
  });

  it('level 8 has troggleCount=3 and moveInterval=20', () => {
    const config = getLevelConfig(8);
    expect(config.troggleCount).toBe(3);
    expect(config.troggleMoveInterval).toBe(20);
  });

  it('level 1 pointsPerCorrect=5', () => {
    expect(getLevelConfig(1).pointsPerCorrect).toBe(5);
  });

  it('level 11 pointsPerCorrect=55', () => {
    expect(getLevelConfig(11).pointsPerCorrect).toBe(55);
  });

  it('level 15 pointsPerCorrect capped at 75', () => {
    expect(getLevelConfig(15).pointsPerCorrect).toBe(75);
  });

  it('numberRangeMax increases with level', () => {
    expect(getLevelConfig(1).numberRangeMax).toBe(16);
    expect(getLevelConfig(5).numberRangeMax).toBe(32);
  });

  it('numberRangeMax capped at 100', () => {
    expect(getLevelConfig(50).numberRangeMax).toBe(100);
  });
});
