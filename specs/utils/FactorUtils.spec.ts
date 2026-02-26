import { describe, it, expect } from 'vitest';
import { getFactors, isFactorOf } from '../../src/game/logic/FactorUtils.ts';

describe('getFactors', () => {
  it('returns factors of 12 sorted', () => {
    expect(getFactors(12)).toEqual([1, 2, 3, 4, 6, 12]);
  });

  it('returns [1] for 1', () => {
    expect(getFactors(1)).toEqual([1]);
  });

  it('returns [1, n] for primes', () => {
    expect(getFactors(7)).toEqual([1, 7]);
  });
});

describe('isFactorOf', () => {
  it('returns true when candidate is a factor', () => {
    expect(isFactorOf(3, 12)).toBe(true);
    expect(isFactorOf(1, 12)).toBe(true);
    expect(isFactorOf(12, 12)).toBe(true);
  });

  it('returns false when candidate is not a factor', () => {
    expect(isFactorOf(5, 12)).toBe(false);
    expect(isFactorOf(7, 12)).toBe(false);
  });

  it('returns false for 0 candidate', () => {
    expect(isFactorOf(0, 12)).toBe(false);
  });
});
