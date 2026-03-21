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

/** Grade-appropriate example for each mode, shown under the button label. */
const MODE_EXAMPLES: Record<GameMode, Partial<Record<GradeLevel, string>> & { default: string }> = {
  sums:            { 1: 'Which ones equal 12?  7+5  3+8  4+9', 2: 'Which ones equal 47?  23+24  19+28', default: 'Which ones equal 12?  7+5  3+8' },
  missing_addends: { 1: '_ + 3 = 10  What is the missing number?', 2: '25 + _ = 61  What is the missing number?', default: '_ + 3 = 10  What is the missing number?' },
  even_odd:        { default: 'Find the even numbers: 2, 7, 14, 9' },
  multiples:       { 3: 'Multiples of 5: find 10, 15, 20...', default: 'Multiples of 7: find 14, 21, 28...' },
  factors:         { default: 'Factors of 24: find 1, 2, 3, 4, 6...' },
  primes:          { default: 'Find the primes: 2, 3, 5, 7, 11...' },
  equalities:      { 3: 'Which ones equal 9?  3+6  2×5  12-3', 5: 'Which ones equal 15?  3×5  20-5  7+8', default: 'Which ones equal 9?  3+6  2×5  12-3' },
};

export function getModeExample(mode: GameMode, grade: GradeLevel): string {
  const examples = MODE_EXAMPLES[mode];
  return examples[grade] ?? examples.default;
}
