import { describe, it, expect } from 'vitest';
import {
  createTroggle,
  tickTroggle,
  isTroggleDue,
  resetTroggleTimer,
} from '../../src/game/entities/Troggle.ts';

describe('createTroggle', () => {
  it('sets moveTimer equal to moveInterval', () => {
    const t = createTroggle('t1', 'reggie', 0, 0, 30);
    expect(t.moveTimer).toBe(30);
    expect(t.moveInterval).toBe(30);
  });

  it('sets all fields correctly', () => {
    const t = createTroggle('t2', 'smartie', 3, 4, 25);
    expect(t.id).toBe('t2');
    expect(t.type).toBe('smartie');
    expect(t.row).toBe(3);
    expect(t.col).toBe(4);
  });

  it('defaults playerMovesUntilEntry to -1 (active)', () => {
    const t = createTroggle('t1', 'reggie', 0, 0, 30);
    expect(t.playerMovesUntilEntry).toBe(-1);
  });

  it('accepts explicit playerMovesUntilEntry', () => {
    const t = createTroggle('t1', 'reggie', -1, -1, 30, 7);
    expect(t.playerMovesUntilEntry).toBe(7);
    expect(t.row).toBe(-1);
    expect(t.col).toBe(-1);
  });
});

describe('tickTroggle', () => {
  it('decrements moveTimer by 1', () => {
    const t = createTroggle('t1', 'reggie', 0, 0, 30);
    const ticked = tickTroggle(t);
    expect(ticked.moveTimer).toBe(29);
  });

  it('does not mutate original', () => {
    const t = createTroggle('t1', 'reggie', 0, 0, 30);
    tickTroggle(t);
    expect(t.moveTimer).toBe(30);
  });
});

describe('isTroggleDue', () => {
  it('returns true when moveTimer is 0', () => {
    const t = { ...createTroggle('t1', 'reggie', 0, 0, 30), moveTimer: 0 };
    expect(isTroggleDue(t)).toBe(true);
  });

  it('returns true when moveTimer is negative', () => {
    const t = { ...createTroggle('t1', 'reggie', 0, 0, 30), moveTimer: -1 };
    expect(isTroggleDue(t)).toBe(true);
  });

  it('returns false when moveTimer is positive', () => {
    const t = createTroggle('t1', 'reggie', 0, 0, 30);
    expect(isTroggleDue(t)).toBe(false);
  });
});

describe('resetTroggleTimer', () => {
  it('resets moveTimer to moveInterval', () => {
    const t = { ...createTroggle('t1', 'reggie', 0, 0, 30), moveTimer: 0 };
    const reset = resetTroggleTimer(t);
    expect(reset.moveTimer).toBe(30);
  });
});
