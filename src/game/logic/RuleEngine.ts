import type { Rule, GameMode } from '../../types.ts';
import { isPrime } from './PrimeUtils.ts';
import { isFactorOf, getFactors } from './FactorUtils.ts';
import { isMultipleOf, randomInt } from './MathUtils.ts';

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
  if (rule.mode === 'equalities') {
    if (typeof value === 'string') {
      const result = evaluateEquation(value);
      return !Number.isNaN(result) && result === rule.target!;
    }
    return value === rule.target!;
  }

  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return false;

  switch (rule.mode) {
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

/** Generate a random equation string that equals the target. */
export function generateEquation(target: number): string {
  const ops = ['+', '-', '×'];
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
export function generateWrongEquation(target: number): string {
  // Generate an equation for a nearby but different value
  let wrongTarget = target + randomInt(1, 5) * (Math.random() < 0.5 ? 1 : -1);
  if (wrongTarget < 0) wrongTarget = target + randomInt(1, 5);
  return generateEquation(wrongTarget);
}

export function generateRule(mode: GameMode, level: number): Rule {
  switch (mode) {
    case 'multiples': {
      const maxTarget = Math.min(2 + level, 12);
      const target = randomInt(2, maxTarget);
      return { mode, target, description: `Multiples of ${target}` };
    }
    case 'factors': {
      // Pick a target with at least 3 factors
      const minTarget = 12;
      const maxTarget = Math.min(12 + level * 10, 100);
      let target = randomInt(minTarget, maxTarget);
      // Ensure at least 3 factors
      while (getFactors(target).length < 3) {
        target = randomInt(minTarget, maxTarget);
      }
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
