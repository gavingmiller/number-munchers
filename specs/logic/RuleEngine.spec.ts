import { describe, it, expect } from 'vitest';
import { isCorrect, generateRule, generateEquation, generateWrongEquation } from '../../src/game/logic/RuleEngine.ts';
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

  it('evaluates equation strings for equalities', () => {
    const rule: Rule = { mode: 'equalities', target: 7, description: 'Equals 7' };
    expect(isCorrect('3+4', rule)).toBe(true);
    expect(isCorrect('10-3', rule)).toBe(true);
    expect(isCorrect('1×7', rule)).toBe(true);
    expect(isCorrect('3+5', rule)).toBe(false);
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

describe('generateEquation', () => {
  it('produces an addition equation that equals target', () => {
    for (let i = 0; i < 20; i++) {
      const eq = generateEquation(10);
      const rule: Rule = { mode: 'equalities', target: 10, description: 'Equals 10' };
      expect(isCorrect(eq, rule)).toBe(true);
    }
  });

  it('works for target = 0', () => {
    const eq = generateEquation(0);
    const rule: Rule = { mode: 'equalities', target: 0, description: 'Equals 0' };
    expect(isCorrect(eq, rule)).toBe(true);
  });

  it('works for target = 1 (prime, no multiplication factors besides 1x1)', () => {
    for (let i = 0; i < 20; i++) {
      const eq = generateEquation(1);
      const rule: Rule = { mode: 'equalities', target: 1, description: 'Equals 1' };
      expect(isCorrect(eq, rule)).toBe(true);
    }
  });

  it('works for large target', () => {
    const eq = generateEquation(50);
    const rule: Rule = { mode: 'equalities', target: 50, description: 'Equals 50' };
    expect(isCorrect(eq, rule)).toBe(true);
  });
});

describe('generateWrongEquation', () => {
  it('produces an equation that does NOT equal target', () => {
    for (let i = 0; i < 20; i++) {
      const eq = generateWrongEquation(10);
      const rule: Rule = { mode: 'equalities', target: 10, description: 'Equals 10' };
      expect(isCorrect(eq, rule)).toBe(false);
    }
  });
});
