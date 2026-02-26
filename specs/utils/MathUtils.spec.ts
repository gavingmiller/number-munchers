import { describe, it, expect } from 'vitest';
import {
  isMultipleOf,
  getMultiplesInRange,
  randomInt,
  shuffle,
} from '../../src/game/logic/MathUtils.ts';

describe('isMultipleOf', () => {
  it('returns true for multiples', () => {
    expect(isMultipleOf(12, 6)).toBe(true);
    expect(isMultipleOf(15, 3)).toBe(true);
  });

  it('returns false for non-multiples', () => {
    expect(isMultipleOf(7, 3)).toBe(false);
    expect(isMultipleOf(10, 4)).toBe(false);
  });
});

describe('getMultiplesInRange', () => {
  it('returns multiples of 3 in range 1-20', () => {
    expect(getMultiplesInRange(3, 1, 20)).toEqual([3, 6, 9, 12, 15, 18]);
  });

  it('returns empty array when no multiples in range', () => {
    expect(getMultiplesInRange(100, 1, 10)).toEqual([]);
  });
});

describe('randomInt', () => {
  it('returns values within range', () => {
    for (let i = 0; i < 100; i++) {
      const val = randomInt(5, 10);
      expect(val).toBeGreaterThanOrEqual(5);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  it('returns the only value when min equals max', () => {
    expect(randomInt(7, 7)).toBe(7);
  });
});

describe('shuffle', () => {
  it('returns array with same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not mutate original array', () => {
    const arr = [1, 2, 3, 4, 5];
    shuffle(arr);
    expect(arr).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns same length', () => {
    const arr = [1, 2, 3];
    expect(shuffle(arr)).toHaveLength(3);
  });
});
