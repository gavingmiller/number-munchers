import { describe, it, expect } from 'vitest';

/**
 * GridRenderer visual contract tests.
 *
 * GridRenderer uses Phaser scene objects, so we test the visibility logic
 * by simulating the update algorithm it follows (see GridRenderer.update).
 */

interface MockText {
  visible: boolean;
  setVisible(v: boolean): void;
}

function makeMockText(): MockText {
  return {
    visible: true,
    setVisible(v: boolean) {
      this.visible = v;
    },
  };
}

/**
 * Replicate the visibility logic from GridRenderer.update:
 *  1. All cell texts set visible
 *  2. Cell text at player position hidden
 *  3. Cell text at each active troggle position hidden
 */
function applyVisibilityLogic(
  cellTexts: MockText[][],
  player: { row: number; col: number },
  troggles: Array<{ row: number; col: number }>,
) {
  // Step 1: show all
  for (const row of cellTexts) {
    for (const t of row) {
      t.setVisible(true);
    }
  }

  // Step 2: hide under player
  cellTexts[player.row]?.[player.col]?.setVisible(false);

  // Step 3: hide under troggles
  for (const trog of troggles) {
    if (trog.row >= 0 && trog.col >= 0) {
      cellTexts[trog.row]?.[trog.col]?.setVisible(false);
    }
  }
}

describe('GridRenderer visibility contract', () => {
  const ROWS = 6;
  const COLS = 5;

  function makeGrid(): MockText[][] {
    return Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => makeMockText()),
    );
  }

  it('hides cell text under the player character', () => {
    const grid = makeGrid();
    const player = { row: 2, col: 3 };

    applyVisibilityLogic(grid, player, []);

    expect(grid[2][3].visible).toBe(false);
  });

  it('does NOT show text through the player on any cell', () => {
    const grid = makeGrid();

    // Test every possible player position
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        // Reset
        for (const row of grid) for (const t of row) t.setVisible(true);

        applyVisibilityLogic(grid, { row: r, col: c }, []);

        expect(grid[r][c].visible).toBe(false);
      }
    }
  });

  it('hides cell text under active troggles', () => {
    const grid = makeGrid();
    const player = { row: 0, col: 0 };
    const troggles = [
      { row: 1, col: 2 },
      { row: 4, col: 3 },
    ];

    applyVisibilityLogic(grid, player, troggles);

    expect(grid[1][2].visible).toBe(false);
    expect(grid[4][3].visible).toBe(false);
  });

  it('shows text on cells not occupied by player or troggle', () => {
    const grid = makeGrid();
    const player = { row: 0, col: 0 };
    const troggles = [{ row: 5, col: 4 }];

    applyVisibilityLogic(grid, player, troggles);

    // Spot-check a few unoccupied cells
    expect(grid[2][2].visible).toBe(true);
    expect(grid[3][1].visible).toBe(true);
    expect(grid[4][4].visible).toBe(true);
  });

  it('ignores inactive troggles (off-screen at row -1)', () => {
    const grid = makeGrid();
    const player = { row: 0, col: 0 };
    const troggles = [{ row: -1, col: -1 }];

    applyVisibilityLogic(grid, player, troggles);

    // All cells except player should be visible
    let hiddenCount = 0;
    for (const row of grid) {
      for (const t of row) {
        if (!t.visible) hiddenCount++;
      }
    }
    expect(hiddenCount).toBe(1); // only the player cell
  });
});
