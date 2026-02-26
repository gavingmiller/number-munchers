import { describe, it, expect } from 'vitest';
import { createPlayer, movePlayer } from '../../src/game/entities/Player.ts';

describe('createPlayer', () => {
  it('starts at row=2, col=2, lives=3', () => {
    const player = createPlayer();
    expect(player.row).toBe(2);
    expect(player.col).toBe(2);
    expect(player.lives).toBe(3);
  });
});

describe('movePlayer', () => {
  const grid = { rows: 6, cols: 5 };

  it('moves down from row=2 to row=3', () => {
    const player = createPlayer();
    const moved = movePlayer(player, 'down', grid);
    expect(moved.row).toBe(3);
    expect(moved.col).toBe(2);
  });

  it('clamps up at row=0', () => {
    const player = { row: 0, col: 2, lives: 3 };
    const moved = movePlayer(player, 'up', grid);
    expect(moved.row).toBe(0);
  });

  it('clamps right at col=4', () => {
    const player = { row: 2, col: 4, lives: 3 };
    const moved = movePlayer(player, 'right', grid);
    expect(moved.col).toBe(4);
  });

  it('clamps left at col=0', () => {
    const player = { row: 2, col: 0, lives: 3 };
    const moved = movePlayer(player, 'left', grid);
    expect(moved.col).toBe(0);
  });

  it('clamps down at row=5', () => {
    const player = { row: 5, col: 2, lives: 3 };
    const moved = movePlayer(player, 'down', grid);
    expect(moved.row).toBe(5);
  });

  it('does not mutate original player', () => {
    const player = createPlayer();
    movePlayer(player, 'down', grid);
    expect(player.row).toBe(2);
  });
});
