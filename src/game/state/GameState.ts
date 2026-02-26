import type {
  GameState,
  GameMode,
  ScoreData,
  Direction,
  TroggleType,
  TroggleData,
} from '../../types.ts';
import { ROWS, COLS, cellIndex } from '../../types.ts';
import { getLevelConfig } from '../logic/DifficultyTable.ts';
import { generateRule } from '../logic/RuleEngine.ts';
import { generateGrid } from '../logic/GridGenerator.ts';
import { createPlayer, movePlayer } from '../entities/Player.ts';
import {
  createTroggle,
  tickTroggle,
  isTroggleDue,
  resetTroggleTimer,
} from '../entities/Troggle.ts';
import { nextMove } from '../logic/TroggleAI.ts';
import { randomInt } from '../logic/MathUtils.ts';
import { createScore, addPoints, updatePointsPerCorrect } from './ScoreTracker.ts';

const TROGGLE_TYPES: TroggleType[] = [
  'reggie',
  'smartie',
  'bashful',
  'helper',
  'worker',
];

// Edge positions used when a troggle activates and enters the grid
const EDGE_POSITIONS: Array<{ row: number; col: number }> = [
  ...Array.from({ length: COLS }, (_, c) => ({ row: 0, col: c })),
  ...Array.from({ length: COLS }, (_, c) => ({ row: ROWS - 1, col: c })),
  ...Array.from({ length: ROWS }, (_, r) => ({ row: r, col: 0 })),
  ...Array.from({ length: ROWS }, (_, r) => ({ row: r, col: COLS - 1 })),
];

function activateTroggle(t: TroggleData): TroggleData {
  const pos = EDGE_POSITIONS[Math.floor(Math.random() * EDGE_POSITIONS.length)];
  return { ...t, row: pos.row, col: pos.col, playerMovesUntilEntry: -1 };
}

export function createLevelState(
  mode: GameMode,
  level: number,
  previousScore?: ScoreData,
): GameState {
  const config = getLevelConfig(level);
  const rule = generateRule(mode, level);
  const grid = generateGrid(rule, {
    numberRangeMin: config.numberRangeMin,
    numberRangeMax: config.numberRangeMax,
  });

  const player = createPlayer();

  const troggles = [];
  for (let i = 0; i < config.troggleCount; i++) {
    const type = TROGGLE_TYPES[i % TROGGLE_TYPES.length];
    troggles.push(
      createTroggle(
        `troggle-${i}`,
        type,
        -1, // off-screen until activated
        -1,
        config.troggleMoveInterval,
        randomInt(5 + i * 5, 10 + i * 5), // staggered: troggle 0→5-10, 1→10-15, etc.
      ),
    );
  }

  const correctCellsRemaining = grid.filter((c) => c.isCorrect).length;

  const score = previousScore
    ? updatePointsPerCorrect(previousScore, level)
    : updatePointsPerCorrect(createScore(), level);

  return {
    mode,
    level,
    status: 'playing',
    score,
    lives: player.lives,
    rule,
    grid,
    player,
    troggles,
    correctCellsRemaining,
    tickCount: 0,
    playerMoveCount: 0,
  };
}

export function applyMove(state: GameState, dir: Direction): GameState {
  const player = movePlayer(state.player, dir, { rows: ROWS, cols: COLS });
  const newMoveCount = state.playerMoveCount + 1;

  const troggles = state.troggles.map((t) => {
    if (t.row === -1 && t.playerMovesUntilEntry >= 0 && newMoveCount >= t.playerMovesUntilEntry) {
      return activateTroggle(t);
    }
    return t;
  });

  return { ...state, player, playerMoveCount: newMoveCount, troggles };
}

export function applyMunch(state: GameState): GameState {
  const idx = cellIndex(state.player.row, state.player.col);
  const cell = state.grid[idx];

  if (cell.state !== 'filled') return state;

  if (cell.isCorrect) {
    const newGrid = [...state.grid];
    newGrid[idx] = { ...cell, state: 'blank' };

    const { score, lifeEarned } = addPoints(
      state.score,
      state.score.pointsPerCorrect,
    );

    const newRemaining = state.correctCellsRemaining - 1;
    const newLives = lifeEarned ? state.lives + 1 : state.lives;
    const newStatus = newRemaining <= 0 ? 'level-complete' : state.status;

    return {
      ...state,
      grid: newGrid,
      score,
      lives: newLives,
      correctCellsRemaining: newRemaining,
      status: newStatus,
    };
  }

  // Wrong cell
  return {
    ...state,
    status: 'life-lost',
    lives: state.lives - 1,
  };
}

export function applyTroggleHit(state: GameState): GameState {
  const newLives = state.lives - 1;
  const newStatus = newLives <= 0 ? 'game-over' : 'life-lost';
  return { ...state, lives: newLives, status: newStatus };
}

export function applyTroggleTick(state: GameState): GameState {
  let troggles = state.troggles.map((t) => {
    if (t.row === -1) return t; // skip inactive troggles
    return tickTroggle(t);
  });

  troggles = troggles.map((t) => {
    if (t.row === -1) return t; // skip inactive troggles
    if (isTroggleDue(t)) {
      const dir = nextMove(t, state.player, state.grid);
      const reset = resetTroggleTimer(t);

      let newRow = reset.row;
      let newCol = reset.col;
      switch (dir) {
        case 'up':
          newRow = Math.max(0, newRow - 1);
          break;
        case 'down':
          newRow = Math.min(ROWS - 1, newRow + 1);
          break;
        case 'left':
          newCol = Math.max(0, newCol - 1);
          break;
        case 'right':
          newCol = Math.min(COLS - 1, newCol + 1);
          break;
      }

      return { ...reset, row: newRow, col: newCol, direction: dir };
    }
    return t;
  });

  return { ...state, troggles, tickCount: state.tickCount + 1 };
}
