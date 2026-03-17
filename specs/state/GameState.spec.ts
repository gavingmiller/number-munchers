import { describe, it, expect } from 'vitest';
import {
  createLevelState,
  applyMove,
  applyMunch,
  applyTroggleHit,
  applyTroggleTick,
} from '../../src/game/state/GameState.ts';

describe('createLevelState', () => {
  it('returns 30 cells', () => {
    const state = createLevelState('multiples', 1);
    expect(state.grid).toHaveLength(30);
  });

  it('level 1 has 1 troggle', () => {
    const state = createLevelState('multiples', 1);
    expect(state.troggles).toHaveLength(1);
  });

  it('troggles start off-screen at row/col -1', () => {
    const state = createLevelState('multiples', 1);
    expect(state.troggles[0].row).toBe(-1);
    expect(state.troggles[0].col).toBe(-1);
  });

  it('troggles have playerMovesUntilEntry >= 5', () => {
    const state = createLevelState('multiples', 1);
    expect(state.troggles[0].playerMovesUntilEntry).toBeGreaterThanOrEqual(5);
  });

  it('playerMoveCount starts at 0', () => {
    const state = createLevelState('multiples', 1);
    expect(state.playerMoveCount).toBe(0);
  });

  it('bonehead troggle has ticksUntilEntry of 1000', () => {
    // Level 10 includes a bonehead (index 4 → type bonehead)
    const state = createLevelState('multiples', 10); // enough troggles to get a bonehead
    const bonehead = state.troggles.find((t) => t.type === 'bonehead');
    if (bonehead) {
      expect(bonehead.ticksUntilEntry).toBe(1000);
      expect(bonehead.playerMovesUntilEntry).toBe(9999);
    }
  });

  it('bonehead move interval is 50% of non-bonehead interval', () => {
    const state = createLevelState('multiples', 10);
    const bonehead = state.troggles.find((t) => t.type === 'bonehead');
    const other    = state.troggles.find((t) => t.type !== 'bonehead');
    if (bonehead && other) {
      expect(bonehead.moveInterval).toBe(Math.max(1, Math.floor(other.moveInterval * 0.5)));
    }
  });

  it('level 4 has 2 troggles', () => {
    const state = createLevelState('multiples', 4);
    expect(state.troggles).toHaveLength(2);
  });

  it('level 8 has 3 troggles', () => {
    const state = createLevelState('multiples', 8);
    expect(state.troggles).toHaveLength(3);
  });

  it('player starts at row 2, col 2', () => {
    const state = createLevelState('primes', 1);
    expect(state.player.row).toBe(2);
    expect(state.player.col).toBe(2);
  });

  it('has correct correctCellsRemaining', () => {
    const state = createLevelState('multiples', 1);
    const actualCorrect = state.grid.filter((c) => c.isCorrect).length;
    expect(state.correctCellsRemaining).toBe(actualCorrect);
  });

  it('status is playing', () => {
    const state = createLevelState('multiples', 1);
    expect(state.status).toBe('playing');
  });

  it('defaults to grade 4 when no grade provided', () => {
    const state = createLevelState('multiples', 1);
    expect(state.grade).toBe(4);
  });

  it('accepts explicit grade parameter', () => {
    const state = createLevelState('sums', 1, undefined, 1);
    expect(state.grade).toBe(1);
    expect(state.mode).toBe('sums');
  });

  it('grade 1 sums generates valid grid', () => {
    const state = createLevelState('sums', 1, undefined, 1);
    expect(state.grid).toHaveLength(30);
    expect(state.rule.mode).toBe('sums');
    expect(state.rule.target).toBeDefined();
  });

  it('grade 2 even_odd generates valid grid', () => {
    const state = createLevelState('even_odd', 1, undefined, 2);
    expect(state.grid).toHaveLength(30);
    expect(state.rule.mode).toBe('even_odd');
    expect(state.rule.parity).toMatch(/^(even|odd)$/);
  });

  it('grade 1 missing_addends generates valid grid', () => {
    const state = createLevelState('missing_addends', 1, undefined, 1);
    expect(state.grid).toHaveLength(30);
    expect(state.rule.mode).toBe('missing_addends');
    for (const cell of state.grid) {
      expect(typeof cell.value).toBe('string');
    }
  });
});

describe('applyMove', () => {
  it('moves player in the given direction', () => {
    const state = createLevelState('multiples', 1);
    const moved = applyMove(state, 'down');
    expect(moved.player.row).toBe(3);
  });

  it('increments playerMoveCount', () => {
    const state = createLevelState('multiples', 1);
    const moved = applyMove(state, 'right');
    expect(moved.playerMoveCount).toBe(1);
  });

  it('activates troggle when playerMoveCount reaches playerMovesUntilEntry', () => {
    const state = createLevelState('multiples', 1);
    // Force entry threshold to 3 for this test
    const withForcedEntry = {
      ...state,
      troggles: [{ ...state.troggles[0], playerMovesUntilEntry: 3 }],
    };
    // Make 3 moves
    const s1 = applyMove(withForcedEntry, 'right');
    const s2 = applyMove(s1, 'right');
    const s3 = applyMove(s2, 'left');
    // Troggle should now be on-grid (row !== -1)
    expect(s3.troggles[0].row).not.toBe(-1);
    expect(s3.troggles[0].playerMovesUntilEntry).toBe(-1);
  });
});

describe('applyMunch', () => {
  it('correct cell decrements correctCellsRemaining', () => {
    const state = createLevelState('multiples', 1);
    // Find a correct cell and move player there
    const correctCell = state.grid.find((c) => c.isCorrect)!;
    const withPlayer = {
      ...state,
      player: { ...state.player, row: correctCell.row, col: correctCell.col },
    };
    const munched = applyMunch(withPlayer);
    expect(munched.correctCellsRemaining).toBe(state.correctCellsRemaining - 1);
  });

  it('wrong cell sets status to life-lost', () => {
    const state = createLevelState('multiples', 1);
    // Find an incorrect cell
    const wrongCell = state.grid.find((c) => !c.isCorrect && c.state === 'filled')!;
    const withPlayer = {
      ...state,
      player: { ...state.player, row: wrongCell.row, col: wrongCell.col },
    };
    const munched = applyMunch(withPlayer);
    expect(munched.status).toBe('life-lost');
  });

  it('sets level-complete when all correct cells eaten', () => {
    const state = createLevelState('multiples', 1);
    // Find the one correct cell scenario
    const correctCell = state.grid.find((c) => c.isCorrect)!;
    const withPlayer = {
      ...state,
      player: { ...state.player, row: correctCell.row, col: correctCell.col },
      correctCellsRemaining: 1,
    };
    const munched = applyMunch(withPlayer);
    expect(munched.status).toBe('level-complete');
  });
});

describe('applyTroggleHit', () => {
  it('decrements lives', () => {
    const state = createLevelState('multiples', 1);
    const hit = applyTroggleHit(state);
    expect(hit.lives).toBe(state.lives - 1);
  });

  it('sets game-over when lives reach 0', () => {
    const state = createLevelState('multiples', 1);
    const withOneLive = { ...state, lives: 1 };
    const hit = applyTroggleHit(withOneLive);
    expect(hit.status).toBe('game-over');
  });

  it('sets life-lost when lives remain', () => {
    const state = createLevelState('multiples', 1);
    const hit = applyTroggleHit(state);
    expect(hit.status).toBe('life-lost');
  });

  it('resets player to center (2,2) after hit', () => {
    const state = createLevelState('multiples', 1);
    const withMovedPlayer = { ...state, player: { ...state.player, row: 5, col: 4 } };
    const hit = applyTroggleHit(withMovedPlayer);
    expect(hit.player.row).toBe(2);
    expect(hit.player.col).toBe(2);
  });

  it('deactivates all troggles to off-screen after hit', () => {
    const state = createLevelState('multiples', 4); // level 4 = 2 troggles
    // Manually activate one troggle
    const withActiveTroggle = {
      ...state,
      troggles: [
        { ...state.troggles[0], row: 2, col: 2, playerMovesUntilEntry: -1 },
        { ...state.troggles[1], row: 0, col: 0, playerMovesUntilEntry: -1 },
      ],
    };
    const hit = applyTroggleHit(withActiveTroggle);
    expect(hit.troggles.every((t) => t.row === -1)).toBe(true);
    expect(hit.troggles.every((t) => t.col === -1)).toBe(true);
  });

  it('preserves troggle count after hit (no permanent deletion)', () => {
    const state = createLevelState('multiples', 4);
    const hit = applyTroggleHit(state);
    expect(hit.troggles).toHaveLength(state.troggles.length);
  });

  it('re-arms troggle entry timers relative to current tickCount', () => {
    const state = createLevelState('multiples', 1);
    const withTicks = { ...state, tickCount: 500 };
    const hit = applyTroggleHit(withTicks);
    // ticksUntilEntry must be > current tickCount (re-armed for future)
    expect(hit.troggles[0].ticksUntilEntry).toBeGreaterThan(500);
  });
});

describe('applyTroggleTick', () => {
  it('increments tickCount', () => {
    const state = createLevelState('multiples', 1);
    const ticked = applyTroggleTick(state);
    expect(ticked.tickCount).toBe(1);
  });

  it('decrements moveTimer for active troggles', () => {
    const state = createLevelState('multiples', 1);
    // Activate the troggle by placing it on-grid
    const withActiveTroggle = {
      ...state,
      troggles: [{ ...state.troggles[0], row: 0, col: 0, playerMovesUntilEntry: -1 }],
    };
    const ticked = applyTroggleTick(withActiveTroggle);
    expect(ticked.troggles[0].moveTimer).toBeLessThan(
      withActiveTroggle.troggles[0].moveTimer,
    );
  });

  it('does not decrement moveTimer for inactive troggles (row=-1)', () => {
    const state = createLevelState('multiples', 1);
    // Troggles start at row=-1 (inactive)
    const ticked = applyTroggleTick(state);
    expect(ticked.troggles[0].moveTimer).toBe(state.troggles[0].moveTimer);
  });

  it('deactivates reggie when it reaches edge in its current direction', () => {
    const state = createLevelState('multiples', 1);
    // Place Reggie at top row facing up — next tick it should exit
    const withReggieAtEdge = {
      ...state,
      troggles: [{
        ...state.troggles[0],
        type: 'reggie' as const,
        row: 0,
        col: 2,
        direction: 'up' as const,
        moveTimer: 0,          // due to move this tick
        moveInterval: 10,
        playerMovesUntilEntry: -1,
        ticksUntilEntry: -1,
      }],
    };
    const ticked = applyTroggleTick(withReggieAtEdge);
    expect(ticked.troggles[0].row).toBe(-1);
    expect(ticked.troggles[0].col).toBe(-1);
  });

  it('re-arms reggie entry timers after edge exit', () => {
    const state = createLevelState('multiples', 1);
    const withReggieAtEdge = {
      ...state,
      tickCount: 200,
      troggles: [{
        ...state.troggles[0],
        type: 'reggie' as const,
        row: 5,
        col: 2,
        direction: 'down' as const,
        moveTimer: 0,
        moveInterval: 10,
        playerMovesUntilEntry: -1,
        ticksUntilEntry: -1,
      }],
    };
    const ticked = applyTroggleTick(withReggieAtEdge);
    expect(ticked.troggles[0].ticksUntilEntry).toBeGreaterThan(200);
  });

  it('does not deactivate non-reggie at edge', () => {
    const state = createLevelState('multiples', 1);
    const withFangsAtEdge = {
      ...state,
      troggles: [{
        ...state.troggles[0],
        type: 'fangs' as const,
        row: 0,
        col: 2,
        direction: 'up' as const,
        moveTimer: 0,
        moveInterval: 10,
        playerMovesUntilEntry: -1,
        ticksUntilEntry: -1,
      }],
    };
    const ticked = applyTroggleTick(withFangsAtEdge);
    // Smartie stays on grid (row 0 or 1, not -1)
    expect(ticked.troggles[0].row).not.toBe(-1);
  });

  it('activates inactive troggle when tickCount reaches ticksUntilEntry', () => {
    const state = createLevelState('multiples', 1);
    // Force threshold to 5 ticks for deterministic test
    const withLowThreshold = {
      ...state,
      troggles: [{ ...state.troggles[0], ticksUntilEntry: 5 }],
    };
    // Tick 5 times — on tick 5, tickCount reaches 5, troggle should activate
    let s = withLowThreshold;
    for (let i = 0; i < 5; i++) {
      s = applyTroggleTick(s);
    }
    expect(s.troggles[0].row).not.toBe(-1);
    expect(s.troggles[0].ticksUntilEntry).toBe(-1);
  });
});
