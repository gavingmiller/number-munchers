import { describe, it, expect } from 'vitest';
import { getValidDirections, nextMove } from '../../src/game/logic/TroggleAI.ts';
import { createTroggle } from '../../src/game/entities/Troggle.ts';
import type { PlayerData, CellData } from '../../src/types.ts';

describe('getValidDirections', () => {
  it('returns 2 directions at top-left corner', () => {
    const dirs = getValidDirections(0, 0, 6, 5);
    expect(dirs).toHaveLength(2);
    expect(dirs).toContain('down');
    expect(dirs).toContain('right');
  });

  it('returns 2 directions at bottom-right corner', () => {
    const dirs = getValidDirections(5, 4, 6, 5);
    expect(dirs).toHaveLength(2);
    expect(dirs).toContain('up');
    expect(dirs).toContain('left');
  });

  it('returns 4 directions in center', () => {
    const dirs = getValidDirections(3, 2, 6, 5);
    expect(dirs).toHaveLength(4);
  });

  it('returns 3 directions on edge', () => {
    const dirs = getValidDirections(0, 2, 6, 5);
    expect(dirs).toHaveLength(3);
    expect(dirs).not.toContain('up');
  });
});

describe('nextMove', () => {
  const emptyGrid: CellData[] = [];
  const player: PlayerData = { row: 3, col: 3, lives: 3 };

  it('fangs moves toward player when player is directly right', () => {
    const troggle = createTroggle('t1', 'fangs', 3, 0, 10);
    const dir = nextMove(troggle, player, emptyGrid);
    expect(dir).toBe('right');
  });

  it('fangs moves toward player when player is directly below', () => {
    const troggle = createTroggle('t1', 'fangs', 0, 3, 10);
    const dir = nextMove(troggle, player, emptyGrid);
    expect(dir).toBe('down');
  });

  it('reggie continues in same direction when valid', () => {
    const troggle = { ...createTroggle('t1', 'reggie', 3, 2, 10), direction: 'right' as const };
    const dir = nextMove(troggle, player, emptyGrid);
    expect(dir).toBe('right');
  });

  it('reggie reverses when hitting wall', () => {
    const troggle = { ...createTroggle('t1', 'reggie', 3, 4, 10), direction: 'right' as const };
    const dir = nextMove(troggle, player, emptyGrid);
    expect(dir).toBe('left');
  });

  it('bonehead moves toward adjacent cell closest to player', () => {
    // Player at (3,3), bonehead at (0,0) — right and down both reduce distance equally
    const troggle = createTroggle('t1', 'bonehead', 0, 0, 5);
    const dir = nextMove(troggle, player, emptyGrid);
    expect(['right', 'down']).toContain(dir);
  });

  it('bonehead picks single best direction when unambiguous', () => {
    // Bonehead directly left of player on same row — only 'right' closes distance
    const troggle = createTroggle('t1', 'bonehead', 3, 1, 5); // player at (3,3)
    const dir = nextMove(troggle, player, emptyGrid);
    expect(dir).toBe('right');
  });

  it('squirt moves away from player when distance < 3', () => {
    // Squirt at (3,2), player at (3,3) — distance 1, should move left (away)
    const troggle = createTroggle('t1', 'squirt', 3, 2, 10);
    const dir = nextMove(troggle, player, emptyGrid);
    expect(dir).toBe('left');
  });

  it('squirt moves away when adjacent diagonally', () => {
    // Squirt at (2,2), player at (3,3) — distance 2, should flee (up or left)
    const troggle = createTroggle('t1', 'squirt', 2, 2, 10);
    const dir = nextMove(troggle, player, emptyGrid);
    expect(['up', 'left']).toContain(dir);
  });

  it('squirt moves randomly when far from player', () => {
    // Squirt at (0,0), player at (3,3) — distance 6, random move
    const troggle = createTroggle('t1', 'squirt', 0, 0, 10);
    const dir = nextMove(troggle, player, emptyGrid);
    // At (0,0) only valid dirs are down and right
    expect(['down', 'right']).toContain(dir);
  });

  it('ember returns a valid direction', () => {
    const troggle = createTroggle('t1', 'ember', 3, 2, 10);
    const dir = nextMove(troggle, player, emptyGrid);
    expect(['up', 'down', 'left', 'right']).toContain(dir);
  });

  it('ember at corner only returns valid directions', () => {
    const troggle = createTroggle('t1', 'ember', 0, 0, 10);
    const dir = nextMove(troggle, player, emptyGrid);
    expect(['down', 'right']).toContain(dir);
  });
});
