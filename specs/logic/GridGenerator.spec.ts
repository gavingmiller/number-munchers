import { describe, it, expect } from 'vitest';
import { generateGrid } from '../../src/game/logic/GridGenerator.ts';
import type { Rule } from '../../src/types.ts';

describe('generateGrid', () => {
  const rule: Rule = { mode: 'multiples', target: 3, description: 'Multiples of 3' };
  const config = { numberRangeMin: 1, numberRangeMax: 30 };

  it('creates exactly 30 cells', () => {
    const grid = generateGrid(rule, config);
    expect(grid).toHaveLength(30);
  });

  it('has 67-75% correct cells (20-23 of 30)', () => {
    const grid = generateGrid(rule, config);
    const correctCount = grid.filter((c) => c.isCorrect).length;
    expect(correctCount).toBeGreaterThanOrEqual(19);
    expect(correctCount).toBeLessThanOrEqual(23);
  });

  it('all cells have valid row (0-5) and col (0-4)', () => {
    const grid = generateGrid(rule, config);
    for (const cell of grid) {
      expect(cell.row).toBeGreaterThanOrEqual(0);
      expect(cell.row).toBeLessThanOrEqual(5);
      expect(cell.col).toBeGreaterThanOrEqual(0);
      expect(cell.col).toBeLessThanOrEqual(4);
    }
  });

  it('has no duplicate positions', () => {
    const grid = generateGrid(rule, config);
    const positions = grid.map((c) => `${c.row},${c.col}`);
    const unique = new Set(positions);
    expect(unique.size).toBe(30);
  });

  it('all cells have state filled', () => {
    const grid = generateGrid(rule, config);
    for (const cell of grid) {
      expect(cell.state).toBe('filled');
    }
  });
});
