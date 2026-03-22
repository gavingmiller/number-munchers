import { describe, it, expect } from 'vitest';
import { getModesForGrade, getGradeNumberRange, GRADE_CONFIG, MODE_LABELS } from '../../src/game/logic/GradeConfig.ts';
import type { GradeLevel } from '../../src/types.ts';

describe('GRADE_CONFIG', () => {
  it('has entries for all 5 grades', () => {
    expect(Object.keys(GRADE_CONFIG)).toHaveLength(5);
    for (let g = 1; g <= 5; g++) {
      expect(GRADE_CONFIG[g as GradeLevel]).toBeDefined();
    }
  });

  it('grade 1 has sums, missing_addends, and even_odd', () => {
    expect(GRADE_CONFIG[1].modes).toEqual(['sums', 'missing_addends', 'even_odd']);
  });

  it('grade 2 has sums, missing_addends, and even_odd', () => {
    expect(GRADE_CONFIG[2].modes).toEqual(['sums', 'missing_addends', 'even_odd']);
  });

  it('grade 3 has sums, multiples, and equalities', () => {
    expect(GRADE_CONFIG[3].modes).toEqual(['sums', 'multiples', 'equalities']);
  });

  it('grade 4 has multiples, factors, primes, and equalities', () => {
    expect(GRADE_CONFIG[4].modes).toEqual(['multiples', 'factors', 'primes', 'equalities']);
  });

  it('grade 5 has same modes as grade 4', () => {
    expect(GRADE_CONFIG[5].modes).toEqual(GRADE_CONFIG[4].modes);
  });

  it('grade 1 does not include factors or primes', () => {
    expect(GRADE_CONFIG[1].modes).not.toContain('factors');
    expect(GRADE_CONFIG[1].modes).not.toContain('primes');
  });

  it('grade 1 number range is 1-20', () => {
    expect(GRADE_CONFIG[1].numberRange).toEqual({ min: 1, max: 20 });
  });

  it('grade 2 number range is 1-100', () => {
    expect(GRADE_CONFIG[2].numberRange).toEqual({ min: 1, max: 100 });
  });

  it('grade 5 number range is 1-200', () => {
    expect(GRADE_CONFIG[5].numberRange).toEqual({ min: 1, max: 200 });
  });
});

describe('getModesForGrade', () => {
  it('returns modes matching GRADE_CONFIG', () => {
    for (let g = 1; g <= 5; g++) {
      expect(getModesForGrade(g as GradeLevel)).toEqual(GRADE_CONFIG[g as GradeLevel].modes);
    }
  });
});

describe('getGradeNumberRange', () => {
  it('returns ranges matching GRADE_CONFIG', () => {
    for (let g = 1; g <= 5; g++) {
      expect(getGradeNumberRange(g as GradeLevel)).toEqual(GRADE_CONFIG[g as GradeLevel].numberRange);
    }
  });
});

describe('MODE_LABELS', () => {
  it('has labels for all 7 modes', () => {
    expect(MODE_LABELS.sums).toBe('Sums');
    expect(MODE_LABELS.missing_addends).toBe('Missing Addends');
    expect(MODE_LABELS.even_odd).toBe('Even or Odd');
    expect(MODE_LABELS.multiples).toBe('Multiples');
    expect(MODE_LABELS.factors).toBe('Factors');
    expect(MODE_LABELS.primes).toBe('Prime Numbers');
    expect(MODE_LABELS.equalities).toBe('Equalities');
  });
});
