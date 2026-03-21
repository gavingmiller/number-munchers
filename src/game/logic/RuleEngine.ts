import type { Rule, GameMode, GradeLevel } from '../../types.ts';
import { isPrime } from './PrimeUtils.ts';
import { isFactorOf } from './FactorUtils.ts';
import { isMultipleOf, randomInt } from './MathUtils.ts';

/** Curated target pools for Factors mode, indexed by level (1-based). */
export const FACTORS_TARGET_POOLS: Record<number, number[]> = {
  1: [4, 6, 8, 10],
  2: [9, 12, 14, 15],
  3: [16, 18, 20, 24],
  4: [25, 28, 30, 36],
  5: [40, 42, 48, 50],
  6: [54, 56, 60, 64],
  7: [72, 75, 80, 84],
  8: [90, 96, 100],
};

/** Evaluate a simple equation string like "3+4", "8-1", "2×5". */
function evaluateEquation(expr: string): number {
  const cleaned = expr.replace(/\s/g, '');
  let match = cleaned.match(/^(\d+)\+(\d+)$/);
  if (match) return Number(match[1]) + Number(match[2]);
  match = cleaned.match(/^(\d+)-(\d+)$/);
  if (match) return Number(match[1]) - Number(match[2]);
  match = cleaned.match(/^(\d+)[×x*](\d+)$/);
  if (match) return Number(match[1]) * Number(match[2]);
  return NaN;
}

export function isCorrect(value: number | string, rule: Rule): boolean {
  if (rule.mode === 'equalities' || rule.mode === 'sums') {
    if (typeof value === 'string') {
      const result = evaluateEquation(value);
      return !Number.isNaN(result) && result === rule.target!;
    }
    return value === rule.target!;
  }

  if (rule.mode === 'missing_addends') {
    // For missing addends, cells are equation strings; correctness is pre-computed by grid generator
    // But if called directly, evaluate the blank value
    if (typeof value === 'string') {
      const blank = extractBlankValue(value);
      return blank === rule.target!;
    }
    return value === rule.target!;
  }

  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return false;

  switch (rule.mode) {
    case 'even_odd':
      return rule.parity === 'even' ? num % 2 === 0 : num % 2 !== 0;
    case 'multiples':
      return isMultipleOf(num, rule.target!);
    case 'factors':
      return isFactorOf(num, rule.target!);
    case 'primes':
      return isPrime(num);
    default:
      return false;
  }
}

/** Extract the blank value from a missing addend equation like "_ + 3 = 10" → 7 */
export function extractBlankValue(expr: string): number {
  const cleaned = expr.replace(/\s/g, '');
  // Pattern: _+a=b or _-a=b or a+_=b or a-_=b
  let match = cleaned.match(/^_\+(\d+)=(\d+)$/);
  if (match) return Number(match[2]) - Number(match[1]);
  match = cleaned.match(/^_-(\d+)=(\d+)$/);
  if (match) return Number(match[2]) + Number(match[1]);
  match = cleaned.match(/^(\d+)\+_=(\d+)$/);
  if (match) return Number(match[2]) - Number(match[1]);
  match = cleaned.match(/^(\d+)-_=(\d+)$/);
  if (match) return Number(match[1]) - Number(match[2]);
  return NaN;
}

/** Generate a missing addend equation where the blank equals the target. */
export function generateMissingAddendEquation(target: number, grade?: GradeLevel): string {
  const maxSum = (grade && grade <= 1) ? 20 : 100;
  // _ + a = b, where blank = target
  const a = randomInt(1, Math.max(1, maxSum - target));
  const b = target + a;
  if (b > maxSum) {
    // Fallback: a + _ = b
    const fallbackA = randomInt(1, Math.max(1, target - 1));
    return `${fallbackA} + _ = ${fallbackA + target}`;
  }
  return Math.random() < 0.5 ? `_ + ${a} = ${b}` : `${a} + _ = ${b}`;
}

/** Generate a missing addend equation where the blank does NOT equal the target. */
export function generateWrongMissingAddendEquation(target: number, grade?: GradeLevel): string {
  let wrongTarget = target + randomInt(1, 5) * (Math.random() < 0.5 ? 1 : -1);
  if (wrongTarget < 1) wrongTarget = target + randomInt(1, 5);
  return generateMissingAddendEquation(wrongTarget, grade);
}

/** Generate a random equation string that equals the target. */
export function generateEquation(target: number, grade?: GradeLevel): string {
  const ops = (grade && grade <= 2) ? ['+'] : ['+', '-', '×'];
  const op = ops[randomInt(0, ops.length - 1)];

  switch (op) {
    case '+': {
      const a = randomInt(0, target);
      const b = target - a;
      return `${a}+${b}`;
    }
    case '-': {
      const a = randomInt(target, target + 12);
      const b = a - target;
      return `${a}-${b}`;
    }
    case '×': {
      // Find factor pairs
      const factors: [number, number][] = [];
      for (let i = 1; i <= Math.floor(Math.sqrt(Math.abs(target))); i++) {
        if (target % i === 0) {
          factors.push([i, target / i]);
        }
      }
      if (factors.length === 0) {
        // Fallback to addition
        const a = randomInt(0, target);
        return `${a}+${target - a}`;
      }
      const [a, b] = factors[randomInt(0, factors.length - 1)];
      return `${a}×${b}`;
    }
    default: {
      const a = randomInt(0, target);
      return `${a}+${target - a}`;
    }
  }
}

/** Generate a random equation string that does NOT equal the target. */
export function generateWrongEquation(target: number, grade?: GradeLevel): string {
  // Generate an equation for a nearby but different value
  let wrongTarget = target + randomInt(1, 5) * (Math.random() < 0.5 ? 1 : -1);
  if (wrongTarget < 0) wrongTarget = target + randomInt(1, 5);
  return generateEquation(wrongTarget, grade);
}

/** Build a kid-friendly explanation of why a munched cell was wrong. */
export function getWrongExplanation(value: number | string, rule: Rule): string {
  switch (rule.mode) {
    case 'multiples':
      return `${value} is not a multiple of ${rule.target}`;
    case 'factors':
      return `${value} is not a factor of ${rule.target}`;
    case 'primes':
      return `${value} is not a prime number`;
    case 'even_odd':
      return rule.parity === 'even'
        ? `${value} is not an even number`
        : `${value} is not an odd number`;
    case 'sums':
    case 'equalities': {
      if (typeof value === 'string') {
        const result = evaluateEquation(value);
        if (!Number.isNaN(result)) {
          return `${value} = ${result}, not ${rule.target}`;
        }
      }
      return `${value} does not equal ${rule.target}`;
    }
    case 'missing_addends': {
      if (typeof value === 'string') {
        const blank = extractBlankValue(value);
        if (!Number.isNaN(blank)) {
          return `The missing number is ${blank}, not ${rule.target}`;
        }
      }
      return `The missing number is not ${rule.target}`;
    }
    default:
      return `${value} is not correct`;
  }
}

export function generateRule(mode: GameMode, level: number, grade?: GradeLevel): Rule {
  switch (mode) {
    case 'sums': {
      const maxSum = (grade && grade <= 1) ? 20 : (grade && grade <= 2) ? 100 : 5 + level * 3;
      const target = randomInt(2, Math.min(maxSum, 5 + level * 3));
      return { mode, target, description: `Equals ${target}` };
    }
    case 'missing_addends': {
      const maxVal = (grade && grade <= 1) ? 20 : 100;
      const target = randomInt(1, Math.min(maxVal - 1, 5 + level * 2));
      return { mode, target, description: `Missing number is ${target}` };
    }
    case 'even_odd': {
      const parity: 'even' | 'odd' = Math.random() < 0.5 ? 'even' : 'odd';
      return { mode, parity, description: parity === 'even' ? 'Even Numbers' : 'Odd Numbers' };
    }
    case 'multiples': {
      if (grade === 3) {
        const pool = [2, 3, 4, 5, 10];
        const target = pool[randomInt(0, pool.length - 1)];
        return { mode, target, description: `Multiples of ${target}` };
      }
      const maxTarget = Math.min(2 + level, 12);
      const target = randomInt(2, maxTarget);
      return { mode, target, description: `Multiples of ${target}` };
    }
    case 'factors': {
      const maxPoolLevel = Math.max(...Object.keys(FACTORS_TARGET_POOLS).map(Number));
      const poolLevel = Math.min(level, maxPoolLevel);
      const pool = FACTORS_TARGET_POOLS[poolLevel];
      const target = pool[randomInt(0, pool.length - 1)];
      return { mode, target, description: `Factors of ${target}` };
    }
    case 'primes': {
      return { mode, description: 'Prime Numbers' };
    }
    case 'equalities': {
      const maxVal = 5 + level * 3;
      const target = randomInt(2, maxVal);
      return { mode, target, description: `Equals ${target}` };
    }
  }
}
