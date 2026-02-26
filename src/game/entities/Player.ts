import type { PlayerData, Direction } from '../../types.ts';

export function createPlayer(): PlayerData {
  return { row: 2, col: 2, lives: 3 };
}

export function movePlayer(
  player: PlayerData,
  dir: Direction,
  grid: { rows: number; cols: number },
): PlayerData {
  let { row, col } = player;

  switch (dir) {
    case 'up':
      row = Math.max(0, row - 1);
      break;
    case 'down':
      row = Math.min(grid.rows - 1, row + 1);
      break;
    case 'left':
      col = Math.max(0, col - 1);
      break;
    case 'right':
      col = Math.min(grid.cols - 1, col + 1);
      break;
  }

  return { ...player, row, col };
}
