import type { TroggleData, TroggleType } from '../../types.ts';

export function createTroggle(
  id: string,
  type: TroggleType,
  row: number,
  col: number,
  moveInterval: number,
  playerMovesUntilEntry = -1,
  ticksUntilEntry = -1,
): TroggleData {
  return {
    id,
    type,
    row,
    col,
    moveTimer: moveInterval,
    moveInterval,
    direction: 'right',
    playerMovesUntilEntry,
    ticksUntilEntry,
  };
}

export function tickTroggle(troggle: TroggleData): TroggleData {
  return { ...troggle, moveTimer: troggle.moveTimer - 1 };
}

export function isTroggleDue(troggle: TroggleData): boolean {
  return troggle.moveTimer <= 0;
}

export function resetTroggleTimer(troggle: TroggleData): TroggleData {
  return { ...troggle, moveTimer: troggle.moveInterval };
}
