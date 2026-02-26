import type { CellData, Rule } from '../../types.ts';
import { ROWS, COLS } from '../../types.ts';
import { isCorrect } from './RuleEngine.ts';
import { shuffle } from './MathUtils.ts';

export function generateGrid(
  rule: Rule,
  config: { numberRangeMin: number; numberRangeMax: number },
): CellData[] {
  const { numberRangeMin, numberRangeMax } = config;

  // Collect all correct candidates in range
  const correctCandidates: number[] = [];
  const incorrectCandidates: number[] = [];

  for (let v = numberRangeMin; v <= numberRangeMax; v++) {
    if (isCorrect(v, rule)) {
      correctCandidates.push(v);
    } else {
      incorrectCandidates.push(v);
    }
  }

  // Pick 3-8 correct values
  const correctCount = Math.min(
    Math.max(3, Math.min(correctCandidates.length, 8)),
    correctCandidates.length,
  );
  const shuffledCorrect = shuffle(correctCandidates);
  const chosenCorrect = shuffledCorrect.slice(0, correctCount);

  // Fill the rest with incorrect values
  const incorrectCount = ROWS * COLS - correctCount;
  const shuffledIncorrect = shuffle(incorrectCandidates);

  const chosenIncorrect: number[] = [];
  for (let i = 0; i < incorrectCount; i++) {
    chosenIncorrect.push(shuffledIncorrect[i % shuffledIncorrect.length]);
  }

  // Build all values and shuffle positions
  const allValues: { value: number; isCorrect: boolean }[] = [
    ...chosenCorrect.map((v) => ({ value: v, isCorrect: true })),
    ...chosenIncorrect.map((v) => ({ value: v, isCorrect: false })),
  ];

  const shuffledValues = shuffle(allValues);

  // Assign to grid positions
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
