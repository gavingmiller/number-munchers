import type { CellData, Rule, GradeLevel } from '../../types.ts';
import { ROWS, COLS } from '../../types.ts';
import { isCorrect, generateEquation, generateWrongEquation, generateMissingAddendEquation, generateWrongMissingAddendEquation } from './RuleEngine.ts';
import { randomInt, shuffle } from './MathUtils.ts';

export function generateGrid(
  rule: Rule,
  config: { numberRangeMin: number; numberRangeMax: number },
  grade?: GradeLevel,
): CellData[] {
  const totalCells = ROWS * COLS; // 30

  // Target: 67-75% of cells are correct (20-22 out of 30)
  const correctPercent = randomInt(67, 75) / 100;
  const targetCorrectCount = Math.round(totalCells * correctPercent);

  if (rule.mode === 'missing_addends') {
    return generateMissingAddendsGrid(rule, totalCells, targetCorrectCount, grade);
  }

  if (rule.mode === 'equalities' || rule.mode === 'sums') {
    return generateEqualitiesGrid(rule, totalCells, targetCorrectCount, grade);
  }

  return generateNumberGrid(rule, config, totalCells, targetCorrectCount);
}

/** Generate grid for missing addends mode using equation strings with blanks. */
function generateMissingAddendsGrid(
  rule: Rule,
  totalCells: number,
  targetCorrectCount: number,
  grade?: GradeLevel,
): CellData[] {
  const target = rule.target!;

  const allValues: { value: string; isCorrect: boolean }[] = [];

  // Generate correct equations (blank = target)
  const usedCorrect = new Set<string>();
  for (let i = 0; i < targetCorrectCount; i++) {
    let eq = generateMissingAddendEquation(target, grade);
    let attempts = 0;
    while (usedCorrect.has(eq) && attempts < 10) {
      eq = generateMissingAddendEquation(target, grade);
      attempts++;
    }
    usedCorrect.add(eq);
    allValues.push({ value: eq, isCorrect: true });
  }

  // Generate incorrect equations (blank ≠ target)
  const incorrectCount = totalCells - targetCorrectCount;
  for (let i = 0; i < incorrectCount; i++) {
    allValues.push({ value: generateWrongMissingAddendEquation(target, grade), isCorrect: false });
  }

  const shuffled = shuffle(allValues);

  const cells: CellData[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const idx = row * COLS + col;
      const entry = shuffled[idx];
      cells.push({
        row,
        col,
        value: entry.value,
        state: 'filled',
        isCorrect: entry.isCorrect,
      });
    }
  }

  return cells;
}

/** Generate grid for equalities/sums mode using equation strings. */
function generateEqualitiesGrid(
  rule: Rule,
  totalCells: number,
  targetCorrectCount: number,
  grade?: GradeLevel,
): CellData[] {
  const target = rule.target!;

  const allValues: { value: string; isCorrect: boolean }[] = [];

  // Generate correct equations
  const usedCorrect = new Set<string>();
  for (let i = 0; i < targetCorrectCount; i++) {
    let eq = generateEquation(target, grade);
    // Try to avoid too many duplicates
    let attempts = 0;
    while (usedCorrect.has(eq) && attempts < 10) {
      eq = generateEquation(target, grade);
      attempts++;
    }
    usedCorrect.add(eq);
    allValues.push({ value: eq, isCorrect: true });
  }

  // Generate incorrect equations
  const incorrectCount = totalCells - targetCorrectCount;
  for (let i = 0; i < incorrectCount; i++) {
    allValues.push({ value: generateWrongEquation(target, grade), isCorrect: false });
  }

  const shuffled = shuffle(allValues);

  const cells: CellData[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const idx = row * COLS + col;
      const entry = shuffled[idx];
      cells.push({
        row,
        col,
        value: entry.value,
        state: 'filled',
        isCorrect: entry.isCorrect,
      });
    }
  }

  return cells;
}

/** Generate grid for number-based modes (multiples, factors, primes). */
function generateNumberGrid(
  rule: Rule,
  config: { numberRangeMin: number; numberRangeMax: number },
  totalCells: number,
  targetCorrectCount: number,
): CellData[] {
  const { numberRangeMin, numberRangeMax } = config;

  const correctCandidates: number[] = [];
  const incorrectCandidates: number[] = [];

  for (let v = numberRangeMin; v <= numberRangeMax; v++) {
    if (isCorrect(v, rule)) {
      correctCandidates.push(v);
    } else {
      incorrectCandidates.push(v);
    }
  }

  // Allow repeats to reach the target count; ranges expand via DifficultyTable at higher levels
  const correctCount = correctCandidates.length > 0 ? targetCorrectCount : 0;
  const shuffledCorrect = shuffle(correctCandidates);

  const chosenCorrect: number[] = [];
  for (let i = 0; i < correctCount; i++) {
    chosenCorrect.push(shuffledCorrect[i % shuffledCorrect.length]);
  }

  // Fill the rest with incorrect values
  const incorrectCount = totalCells - correctCount;
  const shuffledIncorrect = shuffle(incorrectCandidates);

  const chosenIncorrect: number[] = [];
  for (let i = 0; i < incorrectCount; i++) {
    chosenIncorrect.push(shuffledIncorrect[i % shuffledIncorrect.length]);
  }

  const allValues: { value: number; isCorrect: boolean }[] = [
    ...chosenCorrect.map((v) => ({ value: v, isCorrect: true })),
    ...chosenIncorrect.map((v) => ({ value: v, isCorrect: false })),
  ];

  const shuffledValues = shuffle(allValues);

  const cells: CellData[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const idx = row * COLS + col;
      const entry = shuffledValues[idx];
      cells.push({
        row,
        col,
        value: entry.value,
        state: 'filled',
        isCorrect: entry.isCorrect,
      });
    }
  }

  return cells;
}
