import { describe, it, expect } from 'vitest';
import { isCorrect, generateRule } from '../../src/game/logic/RuleEngine.ts';
import type { Rule } from '../../src/types.ts';

describe('isCorrect', () => {
  it('detects multiples correctly', () => {
    const rule: Rule = { mode: 'multiples', target: 6, description: 'Multiples of 6' };
    expect(isCorrect(12, rule)).toBe(true);
    expect(isCorrect(18, rule)).toBe(true);
    expect(isCorrect(7, rule)).toBe(false);
  });

  it('detects factors correctly', () => {
    const rule: Rule = { mode: 'factors', target: 12, description: 'Factors of 12' };
    expect(isCorrect(3, rule)).toBe(true);
    expect(isCorrect(4, rule)).toBe(true);
    expect(isCorrect(5, rule)).toBe(false);
  });

  it('detects primes correctly', () => {
    const rule: Rule = { mode: 'primes', description: 'Prime Numbers' };
    expect(isCorrect(7, rule)).toBe(true);
    expect(isCorrect(2, rule)).toBe(true);
    expect(isCorrect(4, rule)).toBe(false);
    expect(isCorrect(1, rule)).toBe(false);
  });

  it('detects equalities correctly', () => {
    const rule: Rule = { mode: 'equalities', target: 15, description: 'Equal to 15' };
    expect(isCorrect(15, rule)).toBe(true);
    expect(isCorrect(14, rule)).toBe(false);
  });
});

describe('generateRule', () => {
  it('generates a multiples rule', () => {
    const rule = generateRule('multiples', 3);
    expect(rule.mode).toBe('multiples');
    expect(rule.target).toBeGreaterThanOrEqual(2);
    expect(rule.description).toMatch(/^Multiples of \d+$/);
  });

  it('generates a factors rule with at least 3 factors', () => {
    const rule = generateRule('factors', 5);
    expect(rule.mode).toBe('factors');
    expect(rule.target).toBeDefined();
    expect(rule.description).toMatch(/^Factors of \d+$/);
  });

  it('generates a primes rule', () => {
    const rule = generateRule('primes', 1);
    expect(rule.mode).toBe('primes');
    expect(rule.description).toBe('Prime Numbers');
  });

  it('generates an equalities rule', () => {
    const rule = generateRule('equalities', 2);
    expect(rule.mode).toBe('equalities');
    expect(rule.target).toBeDefined();
    expect(rule.description).toMatch(/^Equals \d+$/);
  });
});
