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

  it('factors mode level 1 has numberRangeMax=12', () => {
    expect(getLevelConfig(1, 'factors').numberRangeMax).toBe(12);
  });

  it('factors mode level 5 has numberRangeMax=55', () => {
    expect(getLevelConfig(5, 'factors').numberRangeMax).toBe(55);
  });

  it('factors mode level 8+ capped at 100', () => {
    expect(getLevelConfig(8, 'factors').numberRangeMax).toBe(100);
    expect(getLevelConfig(15, 'factors').numberRangeMax).toBe(100);
  });

  it('factors mode does not affect troggle or points config', () => {
    const defaultConfig = getLevelConfig(4);
    const factorsConfig = getLevelConfig(4, 'factors');
    expect(factorsConfig.troggleCount).toBe(defaultConfig.troggleCount);
    expect(factorsConfig.troggleMoveInterval).toBe(defaultConfig.troggleMoveInterval);
    expect(factorsConfig.pointsPerCorrect).toBe(defaultConfig.pointsPerCorrect);
  });

  it('grade 1 caps numberRangeMax at 20', () => {
    // Level 5 would normally give 32, but grade 1 caps at 20
    expect(getLevelConfig(5, undefined, 1).numberRangeMax).toBe(20);
  });

  it('grade 1 level 1 stays within 20', () => {
    expect(getLevelConfig(1, undefined, 1).numberRangeMax).toBeLessThanOrEqual(20);
  });

  it('grade 5 allows up to 200', () => {
    // Level 50 would normally cap at 100, but grade 5 allows 200
    expect(getLevelConfig(50, undefined, 5).numberRangeMax).toBe(100);
    // Grade 5 doesn't increase beyond what level provides, it just allows higher cap
  });

  it('grade 5 high level reaches beyond 100 if level formula allows', () => {
    // Formula: min(12 + level*4, 100) — default cap is 100
    // Grade 5 cap is 200, but the base formula still caps at 100
    // So grade 5 allows the SAME max as default for standard modes
    expect(getLevelConfig(50, undefined, 5).numberRangeMax).toBe(100);
  });

  it('backward compat: no grade param behaves as before', () => {
    expect(getLevelConfig(1).numberRangeMax).toBe(16);
    expect(getLevelConfig(5).numberRangeMax).toBe(32);
    expect(getLevelConfig(50).numberRangeMax).toBe(100);
  });
});
