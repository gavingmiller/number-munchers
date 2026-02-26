import type { Rule, GameMode } from '../../types.ts';
import { isPrime } from './PrimeUtils.ts';
import { isFactorOf, getFactors } from './FactorUtils.ts';
import { isMultipleOf, randomInt } from './MathUtils.ts';

export function isCorrect(value: number | string, rule: Rule): boolean {
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) return false;

  switch (rule.mode) {
    case 'multiples':
      return isMultipleOf(num, rule.target!);
    case 'factors':
      return isFactorOf(num, rule.target!);
    case 'primes':
      return isPrime(num);
    case 'equalities':
      return num === rule.target!;
    default:
      return false;
  }
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
      return { mode, target, description: `Equal to ${target}` };
    }
  }
}
