import { describe, it, expect } from 'vitest';
import {
  checkPlayerCell,
  checkPlayerTroggles,
} from '../../src/game/logic/CollisionSystem.ts';
import type { GameState } from '../../src/types.ts';

function makeState(overrides: Partial<GameState> = {}): GameState {
  const grid = Array.from({ length: 30 }, (_, i) => ({
    row: Math.floor(i / 5),
    col: i % 5,
    value: i + 1,
    state: 'filled' as const,
    isCorrect: false,
  }));

  return {
    mode: 'multiples',
    grade: 4,
    level: 1,
    status: 'playing',
    score: { current: 0, extraLifeThresholds: [1000, 10000], pointsPerCorrect: 5 },
    lives: 3,
    rule: { mode: 'multiples', target: 3, description: 'Multiples of 3' },
    grid,
    player: { row: 0, col: 0, lives: 3 },
    troggles: [],
    correctCellsRemaining: 0,
    tickCount: 0,
    playerMoveCount: 0,
    ...overrides,
  };
}

describe('checkPlayerCell', () => {
  it('returns correct when cell is correct', () => {
    const state = makeState();
    state.grid[0] = { ...state.grid[0], isCorrect: true };
    const result = checkPlayerCell(state);
    expect(result.type).toBe('correct');
  });

  it('returns wrong when cell is incorrect', () => {
    const state = makeState();
    state.grid[0] = { ...state.grid[0], isCorrect: false };
    const result = checkPlayerCell(state);
    expect(result.type).toBe('wrong');
  });

  it('returns none when cell is blank', () => {
    const state = makeState();
    state.grid[0] = { ...state.grid[0], state: 'blank' };
    const result = checkPlayerCell(state);
    expect(result.type).toBe('none');
  });
});

describe('checkPlayerTroggles', () => {
  it('returns troggle-hit when troggle shares position', () => {
    const state = makeState({
      troggles: [
        {
          id: 't1',
          type: 'reggie',
          row: 0,
          col: 0,
          moveTimer: 10,
          moveInterval: 10,
          direction: 'right',
          playerMovesUntilEntry: -1,
          ticksUntilEntry: -1,
        },
      ],
    });
    const result = checkPlayerTroggles(state);
    expect(result.type).toBe('troggle-hit');
    if (result.type === 'troggle-hit') {
      expect(result.troggleId).toBe('t1');
    }
  });

  it('returns none when no troggle at player position', () => {
    const state = makeState({
      troggles: [
        {
          id: 't1',
          type: 'reggie',
          row: 5,
          col: 4,
          moveTimer: 10,
          moveInterval: 10,
          direction: 'right',
          playerMovesUntilEntry: -1,
          ticksUntilEntry: -1,
        },
      ],
    });
    const result = checkPlayerTroggles(state);
    expect(result.type).toBe('none');
  });

  it('returns none for inactive troggle at player position (row=-1)', () => {
    const state = makeState({
      troggles: [
        {
          id: 't1',
          type: 'reggie',
          row: -1,
          col: -1,
          moveTimer: 10,
          moveInterval: 10,
          direction: 'right',
          playerMovesUntilEntry: 5,
          ticksUntilEntry: 100,
        },
      ],
    });
    const result = checkPlayerTroggles(state);
    expect(result.type).toBe('none');
  });
});
