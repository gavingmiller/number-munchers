import { describe, it, expect } from 'vitest';
import { isCorrect, generateRule, generateEquation, generateWrongEquation, extractBlankValue, generateMissingAddendEquation, generateWrongMissingAddendEquation, FACTORS_TARGET_POOLS } from '../../src/game/logic/RuleEngine.ts';
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

  it('generates a factors rule from curated pool for each level', () => {
    for (let level = 1; level <= 8; level++) {
      const maxPoolLevel = Math.max(...Object.keys(FACTORS_TARGET_POOLS).map(Number));
      const poolLevel = Math.min(level, maxPoolLevel);
      const pool = FACTORS_TARGET_POOLS[poolLevel];
      for (let i = 0; i < 20; i++) {
        const rule = generateRule('factors', level);
        expect(rule.mode).toBe('factors');
        expect(pool).toContain(rule.target);
        expect(rule.description).toMatch(/^Factors of \d+$/);
      }
    }
  });

  it('factors level beyond max pool uses highest pool', () => {
    const maxPool = FACTORS_TARGET_POOLS[8];
    for (let i = 0; i < 20; i++) {
      const rule = generateRule('factors', 12);
      expect(maxPool).toContain(rule.target);
    }
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

describe('isCorrect — sums mode', () => {
  it('evaluates equation strings like equalities', () => {
    const rule: Rule = { mode: 'sums', target: 12, description: 'Equals 12' };
    expect(isCorrect('7+5', rule)).toBe(true);
    expect(isCorrect('3+8', rule)).toBe(false);
  });
});

describe('isCorrect — even_odd mode', () => {
  it('detects even numbers', () => {
    const rule: Rule = { mode: 'even_odd', parity: 'even', description: 'Even Numbers' };
    expect(isCorrect(2, rule)).toBe(true);
    expect(isCorrect(4, rule)).toBe(true);
    expect(isCorrect(3, rule)).toBe(false);
    expect(isCorrect(7, rule)).toBe(false);
  });

  it('detects odd numbers', () => {
    const rule: Rule = { mode: 'even_odd', parity: 'odd', description: 'Odd Numbers' };
    expect(isCorrect(3, rule)).toBe(true);
    expect(isCorrect(7, rule)).toBe(true);
    expect(isCorrect(2, rule)).toBe(false);
    expect(isCorrect(8, rule)).toBe(false);
  });
});

describe('isCorrect — missing_addends mode', () => {
  it('evaluates blank value in equation string', () => {
    const rule: Rule = { mode: 'missing_addends', target: 7, description: 'Missing number is 7' };
    expect(isCorrect('_ + 3 = 10', rule)).toBe(true);
    expect(isCorrect('3 + _ = 10', rule)).toBe(true);
    expect(isCorrect('_ + 5 = 8', rule)).toBe(false); // blank = 3, not 7
  });
});

describe('extractBlankValue', () => {
  it('extracts blank from _ + a = b', () => {
    expect(extractBlankValue('_ + 3 = 10')).toBe(7);
    expect(extractBlankValue('_+5=12')).toBe(7);
  });

  it('extracts blank from a + _ = b', () => {
    expect(extractBlankValue('3 + _ = 10')).toBe(7);
    expect(extractBlankValue('5+_=12')).toBe(7);
  });
});

describe('generateMissingAddendEquation', () => {
  it('produces equation where blank equals target', () => {
    for (let i = 0; i < 20; i++) {
      const eq = generateMissingAddendEquation(5);
      const blank = extractBlankValue(eq);
      expect(blank).toBe(5);
    }
  });

  it('grade 1 stays within 20', () => {
    for (let i = 0; i < 50; i++) {
      const eq = generateMissingAddendEquation(5, 1);
      // Extract the sum (b in _ + a = b)
      const match = eq.replace(/\s/g, '').match(/=(\d+)$/);
      expect(match).not.toBeNull();
      expect(Number(match![1])).toBeLessThanOrEqual(20);
    }
  });
});

describe('generateWrongMissingAddendEquation', () => {
  it('produces equation where blank does NOT equal target', () => {
    for (let i = 0; i < 20; i++) {
      const eq = generateWrongMissingAddendEquation(5);
      const blank = extractBlankValue(eq);
      expect(blank).not.toBe(5);
    }
  });
});

describe('generateRule — new modes', () => {
  it('generates a sums rule', () => {
    const rule = generateRule('sums', 1, 1);
    expect(rule.mode).toBe('sums');
    expect(rule.target).toBeDefined();
    expect(rule.description).toMatch(/^Equals \d+$/);
  });

  it('generates a missing_addends rule', () => {
    const rule = generateRule('missing_addends', 1, 1);
    expect(rule.mode).toBe('missing_addends');
    expect(rule.target).toBeDefined();
    expect(rule.description).toMatch(/^Missing number is \d+$/);
  });

  it('generates an even_odd rule', () => {
    const rule = generateRule('even_odd', 1, 2);
    expect(rule.mode).toBe('even_odd');
    expect(rule.parity).toMatch(/^(even|odd)$/);
    expect(rule.description).toMatch(/^(Even|Odd) Numbers$/);
  });
});

describe('generateRule — grade-restricted multiples', () => {
  it('grade 3 multiples targets are from [2,3,4,5,10]', () => {
    const allowed = [2, 3, 4, 5, 10];
    for (let i = 0; i < 50; i++) {
      const rule = generateRule('multiples', 1, 3);
      expect(allowed).toContain(rule.target);
    }
  });

  it('grade 4 multiples targets can exceed the grade-3 pool', () => {
    // At level 8, maxTarget = min(10, 12) = 10, so targets 2-10 are possible
    const seenTargets = new Set<number>();
    for (let i = 0; i < 100; i++) {
      const rule = generateRule('multiples', 8, 4);
      seenTargets.add(rule.target!);
    }
    // Should see targets beyond [2,3,4,5,10], like 6,7,8,9
    expect(seenTargets.size).toBeGreaterThan(5);
  });
});

describe('generateEquation — grade restriction', () => {
  it('grade 2 equations use addition only', () => {
    for (let i = 0; i < 50; i++) {
      const eq = generateEquation(10, 2);
      // Should only contain + (no - or ×)
      expect(eq).not.toContain('-');
      expect(eq).not.toContain('×');
    }
  });

  it('grade 4 equations can use subtraction and multiplication', () => {
    const ops = new Set<string>();
    for (let i = 0; i < 100; i++) {
      const eq = generateEquation(12, 4);
      if (eq.includes('-')) ops.add('-');
      if (eq.includes('×')) ops.add('×');
      if (eq.includes('+')) ops.add('+');
    }
    // Should see more than just addition
    expect(ops.size).toBeGreaterThan(1);
  });
});
