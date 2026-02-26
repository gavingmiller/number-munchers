import type { GameState, CellData } from '../../types.ts';
import { cellIndex } from '../../types.ts';

export type CollisionResult =
  | { type: 'correct'; cell: CellData }
  | { type: 'wrong'; cell: CellData }
  | { type: 'troggle-hit'; troggleId: string }
  | { type: 'none' };

export function checkPlayerCell(state: GameState): CollisionResult {
  const idx = cellIndex(state.player.row, state.player.col);
  const cell = state.grid[idx];

  if (cell.state !== 'filled') {
    return { type: 'none' };
  }

  if (cell.isCorrect) {
    return { type: 'correct', cell };
  }
  return { type: 'wrong', cell };
}

export function checkPlayerTroggles(state: GameState): CollisionResult {
  for (const troggle of state.troggles) {
    if (troggle.row === -1) continue; // inactive troggle
    if (troggle.row === state.player.row && troggle.col === state.player.col) {
      return { type: 'troggle-hit', troggleId: troggle.id };
    }
  }
  return { type: 'none' };
}
