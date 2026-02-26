import type { TroggleData, PlayerData, CellData, Direction } from '../../types.ts';
import { ROWS, COLS } from '../../types.ts';

export function getValidDirections(
  row: number,
  col: number,
  rows: number,
  cols: number,
): Direction[] {
  const dirs: Direction[] = [];
  if (row > 0) dirs.push('up');
  if (row < rows - 1) dirs.push('down');
  if (col > 0) dirs.push('left');
  if (col < cols - 1) dirs.push('right');
  return dirs;
}

function randomDirection(dirs: Direction[]): Direction {
  return dirs[Math.floor(Math.random() * dirs.length)];
}

function oppositeDirection(dir: Direction): Direction {
  switch (dir) {
    case 'up': return 'down';
    case 'down': return 'up';
    case 'left': return 'right';
    case 'right': return 'left';
  }
}

function distanceBetween(
  r1: number,
  c1: number,
  r2: number,
  c2: number,
): number {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

export function nextMove(
  troggle: TroggleData,
  player: PlayerData,
  _grid: CellData[],
): Direction {
  const valid = getValidDirections(troggle.row, troggle.col, ROWS, COLS);

  switch (troggle.type) {
    case 'reggie': {
      // Continue current direction; reverse if hitting wall
      if (valid.includes(troggle.direction)) {
        return troggle.direction;
      }
      const opposite = oppositeDirection(troggle.direction);
      if (valid.includes(opposite)) {
        return opposite;
      }
      return randomDirection(valid);
    }

    case 'smartie': {
      // Move toward player, reduce max of |drow|, |dcol|; row first on tie
      const drow = player.row - troggle.row;
      const dcol = player.col - troggle.col;

      if (Math.abs(drow) >= Math.abs(dcol)) {
        // Row first
        const rowDir: Direction = drow > 0 ? 'down' : 'up';
        if (drow !== 0 && valid.includes(rowDir)) return rowDir;
        const colDir: Direction = dcol > 0 ? 'right' : 'left';
        if (dcol !== 0 && valid.includes(colDir)) return colDir;
      } else {
        const colDir: Direction = dcol > 0 ? 'right' : 'left';
        if (dcol !== 0 && valid.includes(colDir)) return colDir;
        const rowDir: Direction = drow > 0 ? 'down' : 'up';
        if (drow !== 0 && valid.includes(rowDir)) return rowDir;
      }
      return randomDirection(valid);
    }

    case 'bashful': {
      // Move away if close (distance < 3), otherwise random
      const dist = distanceBetween(
        troggle.row,
        troggle.col,
        player.row,
        player.col,
      );
      if (dist < 3) {
        // Move away from player
        const drow = troggle.row - player.row;
        const dcol = troggle.col - player.col;

        const candidates: Direction[] = [];
        if (drow > 0 && valid.includes('down')) candidates.push('down');
        if (drow < 0 && valid.includes('up')) candidates.push('up');
        if (dcol > 0 && valid.includes('right')) candidates.push('right');
        if (dcol < 0 && valid.includes('left')) candidates.push('left');

        if (candidates.length > 0) return randomDirection(candidates);
      }
      return randomDirection(valid);
    }

    case 'helper':
    case 'worker':
      return randomDirection(valid);
  }
}
