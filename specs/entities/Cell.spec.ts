import { describe, it, expect } from 'vitest';
import { createCell, blankCell } from '../../src/game/entities/Cell.ts';

describe('createCell', () => {
  it('returns correct fields', () => {
    const cell = createCell(2, 3, 42, true);
    expect(cell.row).toBe(2);
    expect(cell.col).toBe(3);
    expect(cell.value).toBe(42);
    expect(cell.isCorrect).toBe(true);
    expect(cell.state).toBe('filled');
  });
});

describe('blankCell', () => {
  it('returns state blank with same other fields', () => {
    const cell = createCell(1, 4, 7, false);
    const blanked = blankCell(cell);
    expect(blanked.state).toBe('blank');
    expect(blanked.row).toBe(1);
    expect(blanked.col).toBe(4);
    expect(blanked.value).toBe(7);
    expect(blanked.isCorrect).toBe(false);
  });

  it('does not mutate original cell', () => {
    const cell = createCell(0, 0, 1, true);
    blankCell(cell);
    expect(cell.state).toBe('filled');
  });
});
