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

  it('even_odd grid has correct parity distribution', () => {
    const evenRule: Rule = { mode: 'even_odd', parity: 'even', description: 'Even Numbers' };
    const grid = generateGrid(evenRule, { numberRangeMin: 1, numberRangeMax: 100 });
    expect(grid).toHaveLength(30);
    const correctCells = grid.filter((c) => c.isCorrect);
    // 67-75% correct
    expect(correctCells.length).toBeGreaterThanOrEqual(19);
    expect(correctCells.length).toBeLessThanOrEqual(23);
    // All correct cells should be even numbers
    for (const cell of correctCells) {
      expect((cell.value as number) % 2).toBe(0);
    }
  });

  it('missing_addends grid produces equation strings with underscores', () => {
    const maRule: Rule = { mode: 'missing_addends', target: 5, description: 'Missing number is 5' };
    const grid = generateGrid(maRule, { numberRangeMin: 1, numberRangeMax: 20 }, 1);
    expect(grid).toHaveLength(30);
    for (const cell of grid) {
      expect(typeof cell.value).toBe('string');
      expect(cell.value as string).toContain('_');
    }
    const correctCells = grid.filter((c) => c.isCorrect);
    expect(correctCells.length).toBeGreaterThanOrEqual(19);
    expect(correctCells.length).toBeLessThanOrEqual(23);
  });

  it('sums grid produces equation strings', () => {
    const sumsRule: Rule = { mode: 'sums', target: 10, description: 'Equals 10' };
    const grid = generateGrid(sumsRule, { numberRangeMin: 1, numberRangeMax: 20 }, 1);
    expect(grid).toHaveLength(30);
    for (const cell of grid) {
      expect(typeof cell.value).toBe('string');
      expect(cell.value as string).toContain('+');
    }
  });

  it('differences grid produces subtraction equation strings', () => {
    const diffRule: Rule = { mode: 'differences', target: 5, description: 'Equals 5' };
    const grid = generateGrid(diffRule, { numberRangeMin: 1, numberRangeMax: 100 }, 2);
    expect(grid).toHaveLength(30);
    for (const cell of grid) {
      expect(typeof cell.value).toBe('string');
      expect(cell.value as string).toContain('-');
    }
    const correctCells = grid.filter((c) => c.isCorrect);
    expect(correctCells.length).toBeGreaterThanOrEqual(19);
    expect(correctCells.length).toBeLessThanOrEqual(23);
  });

  it('division grid produces division equation strings', () => {
    const divRule: Rule = { mode: 'division', target: 4, description: 'Equals 4' };
    const grid = generateGrid(divRule, { numberRangeMin: 1, numberRangeMax: 100 }, 4);
    expect(grid).toHaveLength(30);
    for (const cell of grid) {
      expect(typeof cell.value).toBe('string');
      expect(cell.value as string).toContain('÷');
    }
    const correctCells = grid.filter((c) => c.isCorrect);
    expect(correctCells.length).toBeGreaterThanOrEqual(19);
    expect(correctCells.length).toBeLessThanOrEqual(23);
  });

  it('missing_factors grid produces equation strings with underscore and multiplication', () => {
    const mfRule: Rule = { mode: 'missing_factors', target: 3, description: 'Missing number is 3' };
    const grid = generateGrid(mfRule, { numberRangeMin: 1, numberRangeMax: 100 }, 3);
    expect(grid).toHaveLength(30);
    for (const cell of grid) {
      expect(typeof cell.value).toBe('string');
      expect(cell.value as string).toContain('_');
      expect(cell.value as string).toContain('×');
    }
    const correctCells = grid.filter((c) => c.isCorrect);
    expect(correctCells.length).toBeGreaterThanOrEqual(19);
    expect(correctCells.length).toBeLessThanOrEqual(23);
  });
});
