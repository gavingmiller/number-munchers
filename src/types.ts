// ============================================================
// Shared types — NO Phaser imports. Used by both game/ and scenes/.
// ============================================================

export type GameMode = 'sums' | 'missing_addends' | 'even_odd' | 'multiples' | 'factors' | 'primes' | 'equalities' | 'differences' | 'missing_factors' | 'division';
export type GradeLevel = 1 | 2 | 3 | 4 | 5;
export type CharacterType = 'claude' | 'box' | 'axolotl' | 'electricmouse' | 'marshmallow' | 'robot' | 'nyancat' | 'pusheen' | 'mrpickle';
export type TroggleType = 'reggie' | 'fangs' | 'squirt' | 'ember' | 'bonehead';
export type CellState = 'filled' | 'blank';
export type Direction = 'up' | 'down' | 'left' | 'right';
export type GameStatus = 'playing' | 'life-lost' | 'level-complete' | 'game-over' | 'cutscene';

export interface Rule {
  mode: GameMode;
  target?: number; // used by multiples, factors, equalities, sums, missing_addends
  parity?: 'even' | 'odd'; // used by even_odd mode
  description: string; // e.g. "Multiples of 6"
}

export interface CellData {
  row: number;
  col: number;
  value: number | string;
  state: CellState;
  isCorrect: boolean;
}

export interface PlayerData {
  row: number;
  col: number;
  lives: number;
}

export interface TroggleData {
  id: string;
  type: TroggleType;
  row: number;
  col: number;
  moveTimer: number;    // ticks until next move
  moveInterval: number; // ticks between moves
  direction: Direction; // current facing (for Reggie/Worker)
  playerMovesUntilEntry: number; // -1 = already active; >=0 = absolute move count to activate
  ticksUntilEntry: number;       // -1 = don't use tick-based entry; >=0 = absolute tick count to activate
}

export interface ScoreData {
  current: number;
  extraLifeThresholds: number[]; // remaining thresholds to trigger
  pointsPerCorrect: number;
}

export interface GameDeath {
  level: number;
  cause: 'wrong_answer' | 'troggle';
  detail: string;
}

export interface ProblemResult {
  level: number;
  value: string | number;
  rule: string;
  correct: boolean;
}

export interface GameState {
  mode: GameMode;
  grade: GradeLevel;
  level: number;
  status: GameStatus;
  score: ScoreData;
  lives: number;
  rule: Rule;
  grid: CellData[];        // 30 elements; index = row*COLS + col
  player: PlayerData;
  troggles: TroggleData[];
  correctCellsRemaining: number;
  tickCount: number;
  playerMoveCount: number; // total player moves taken this level
  starsEarned: number;     // correct answers this game session
  deaths: GameDeath[];     // death events this game session
  problems: ProblemResult[]; // all problem attempts this game session
}

export interface LevelConfig {
  level: number;
  troggleCount: number;
  troggleMoveInterval: number; // ticks between troggle moves (lower = faster)
  numberRangeMin: number;
  numberRangeMax: number;
  pointsPerCorrect: number;
}

// Grid constants
export const ROWS = 6;
export const COLS = 5;
export const TOTAL_CELLS = ROWS * COLS; // 30

export function cellIndex(row: number, col: number): number {
  return row * COLS + col;
}
