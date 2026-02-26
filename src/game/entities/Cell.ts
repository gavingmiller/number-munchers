import type { CellData } from '../../types.ts';

export function createCell(
  row: number,
  col: number,
  value: number,
  isCorrect: boolean,
): CellData {
  return { row, col, value, state: 'filled', isCorrect };
}

export function blankCell(cell: CellData): CellData {
  return { ...cell, state: 'blank' };
}
