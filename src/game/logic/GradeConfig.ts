import type { GameMode, GradeLevel } from '../../types.ts';

export interface GradeModeConfig {
  modes: GameMode[];
  numberRange: { min: number; max: number };
  label: string;
}

export const GRADE_CONFIG: Record<GradeLevel, GradeModeConfig> = {
  1: { modes: ['sums', 'missing_addends'], numberRange: { min: 1, max: 20 }, label: 'Grade 1' },
  2: { modes: ['sums', 'missing_addends', 'even_odd'], numberRange: { min: 1, max: 100 }, label: 'Grade 2' },
  3: { modes: ['sums', 'even_odd', 'multiples', 'equalities'], numberRange: { min: 1, max: 100 }, label: 'Grade 3' },
  4: { modes: ['multiples', 'factors', 'primes', 'equalities'], numberRange: { min: 1, max: 100 }, label: 'Grade 4' },
  5: { modes: ['multiples', 'factors', 'primes', 'equalities'], numberRange: { min: 1, max: 200 }, label: 'Grade 5' },
};

export function getModesForGrade(grade: GradeLevel): GameMode[] {
  return GRADE_CONFIG[grade].modes;
}

export function getGradeNumberRange(grade: GradeLevel): { min: number; max: number } {
  return GRADE_CONFIG[grade].numberRange;
}

export const MODE_LABELS: Record<GameMode, string> = {
  sums: 'Sums',
  missing_addends: 'Missing Addends',
  even_odd: 'Even or Odd',
  multiples: 'Multiples',
  factors: 'Factors',
  primes: 'Prime Numbers',
  equalities: 'Equalities',
};
