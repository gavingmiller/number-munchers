import { describe, it, expect } from 'vitest';
import { isPrime, getPrimesInRange } from '../../src/game/logic/PrimeUtils.ts';

describe('isPrime', () => {
  it('returns false for n <= 1', () => {
    expect(isPrime(0)).toBe(false);
    expect(isPrime(1)).toBe(false);
    expect(isPrime(-3)).toBe(false);
  });

  it('returns true for 2', () => {
    expect(isPrime(2)).toBe(true);
  });

  it('returns true for 17', () => {
    expect(isPrime(17)).toBe(true);
  });

  it('returns false for 4', () => {
    expect(isPrime(4)).toBe(false);
  });

  it('returns true for 97', () => {
    expect(isPrime(97)).toBe(true);
  });

  it('returns false for composite numbers', () => {
    expect(isPrime(9)).toBe(false);
    expect(isPrime(15)).toBe(false);
    expect(isPrime(100)).toBe(false);
  });
});

describe('getPrimesInRange', () => {
  it('returns primes between 1 and 20', () => {
    expect(getPrimesInRange(1, 20)).toEqual([2, 3, 5, 7, 11, 13, 17, 19]);
  });

  it('returns empty array when no primes in range', () => {
    expect(getPrimesInRange(24, 28)).toEqual([]);
  });
});
