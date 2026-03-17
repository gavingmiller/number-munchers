import type {
  GameState,
  GameMode,
  GradeLevel,
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
  'fangs',
  'squirt',
  'ember',
  'bonehead',
];

// Edge positions used when a troggle activates and enters the grid
const EDGE_POSITIONS: Array<{ row: number; col: number }> = [
  ...Array.from({ length: COLS }, (_, c) => ({ row: 0, col: c })),
  ...Array.from({ length: COLS }, (_, c) => ({ row: ROWS - 1, col: c })),
  ...Array.from({ length: ROWS }, (_, r) => ({ row: r, col: 0 })),
  ...Array.from({ length: ROWS }, (_, r) => ({ row: r, col: COLS - 1 })),
];

/** Pick a traversal direction for Reggie based on which edge it entered from. */
function reggieEntryDirection(row: number, col: number): Direction {
  const onTop    = row === 0;
  const onBottom = row === ROWS - 1;
  const onLeft   = col === 0;
  const onRight  = col === COLS - 1;

  // Pure edges: return the one unambiguous inward direction
  if (onTop    && !onLeft && !onRight) return 'down';
  if (onBottom && !onLeft && !onRight) return 'up';
  if (onLeft   && !onTop  && !onBottom) return 'right';
  if (onRight  && !onTop  && !onBottom) return 'left';

  // Corners: randomly pick one of the two valid inward directions
  if (onTop    && onLeft)  return Math.random() < 0.5 ? 'down'  : 'right';
  if (onTop    && onRight) return Math.random() < 0.5 ? 'down'  : 'left';
  if (onBottom && onLeft)  return Math.random() < 0.5 ? 'up'    : 'right';
  return                          Math.random() < 0.5 ? 'up'    : 'left'; // bottom-right
}

function activateTroggle(t: TroggleData): TroggleData {
  const pos = EDGE_POSITIONS[Math.floor(Math.random() * EDGE_POSITIONS.length)];
  const direction = t.type === 'reggie'
    ? reggieEntryDirection(pos.row, pos.col)
    : t.direction;
  return { ...t, row: pos.row, col: pos.col, direction, playerMovesUntilEntry: -1, ticksUntilEntry: -1 };
}

/** True when Reggie's current direction points off the grid boundary. */
function isReggieAtEdge(t: TroggleData): boolean {
  return (
    (t.direction === 'up' && t.row === 0) ||
    (t.direction === 'down' && t.row === ROWS - 1) ||
    (t.direction === 'left' && t.col === 0) ||
    (t.direction === 'right' && t.col === COLS - 1)
  );
}

/** Deactivate a troggle that has walked off the edge, with re-armed entry timers. */
function deactivateTroggleOnExit(
  t: TroggleData,
  currentTick: number,
  currentMoves: number,
): TroggleData {
  return {
    ...t,
    row: -1,
    col: -1,
    moveTimer: t.moveInterval,
    playerMovesUntilEntry: currentMoves + randomInt(5, 10),
    ticksUntilEntry: currentTick + randomInt(80, 120),
  };
}

export function createLevelState(
  mode: GameMode,
  level: number,
  previousScore?: ScoreData,
  grade?: GradeLevel,
): GameState {
  const effectiveGrade = grade ?? 4;
  const config = getLevelConfig(level, mode, effectiveGrade);
  const rule = generateRule(mode, level, effectiveGrade);
  const grid = generateGrid(rule, {
    numberRangeMin: config.numberRangeMin,
    numberRangeMax: config.numberRangeMax,
  }, effectiveGrade);

  const player = createPlayer();

  const troggles = [];
  for (let i = 0; i < config.troggleCount; i++) {
    const type = TROGGLE_TYPES[i % TROGGLE_TYPES.length];
    const isBonehead = type === 'bonehead';
    // Worker: 50% faster, enters only after 1000 ticks (never via move count)
    const moveInterval = isBonehead
      ? Math.max(1, Math.floor(config.troggleMoveInterval * 0.5))
      : config.troggleMoveInterval;
    const movesEntry = isBonehead ? 9999 : randomInt(5 + i * 5, 10 + i * 5);
    const tickEntry  = isBonehead ? 1000 : randomInt(80 + i * 40, 120 + i * 40);

    troggles.push(
      createTroggle(
        `troggle-${i}`,
        type,
        -1,
        -1,
        moveInterval,
        movesEntry,
        tickEntry,
      ),
    );
  }

  const correctCellsRemaining = grid.filter((c) => c.isCorrect).length;

  const score = previousScore
    ? updatePointsPerCorrect(previousScore, level)
    : updatePointsPerCorrect(createScore(), level);

  return {
    mode,
    grade: effectiveGrade,
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

  // Reset player to center
  const player = { ...state.player, row: 2, col: 2 };

  // Send all troggles back off-screen with fresh re-armed entry timers
  const troggles = state.troggles.map((t, i) => ({
    ...t,
    row: -1,
    col: -1,
    playerMovesUntilEntry: state.playerMoveCount + randomInt(5 + i * 5, 10 + i * 5),
    ticksUntilEntry: state.tickCount + randomInt(80 + i * 40, 120 + i * 40),
  }));

  return { ...state, lives: newLives, status: newStatus, player, troggles };
}

export function applyTroggleTick(state: GameState): GameState {
  const nextTickCount = state.tickCount + 1;

  // Activate any inactive troggle whose tick threshold has been reached
  let troggles = state.troggles.map((t) => {
    if (t.row === -1 && t.ticksUntilEntry >= 0 && nextTickCount >= t.ticksUntilEntry) {
      return activateTroggle(t);
    }
    return t;
  });

  troggles = troggles.map((t) => {
    if (t.row === -1) return t; // skip inactive troggles
    return tickTroggle(t);
  });

  troggles = troggles.map((t) => {
    if (t.row === -1) return t; // skip inactive troggles
    if (isTroggleDue(t)) {
      // Reggie exits the grid instead of bouncing when reaching an edge
      if (t.type === 'reggie' && isReggieAtEdge(t)) {
        return deactivateTroggleOnExit(t, nextTickCount, state.playerMoveCount);
      }

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

  return { ...state, troggles, tickCount: nextTickCount };
}
