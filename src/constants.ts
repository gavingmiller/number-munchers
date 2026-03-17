// ============================================================
// Visual constants — used by Phaser scenes only.
// Keep game logic constants in src/types.ts
//
// RULE: All views must be fully navigable with d-pad (arrow keys)
// + space bar. A mouse/touch is never required on any screen.
// ============================================================

// Canvas
export const CANVAS_WIDTH = 768;
export const CANVAS_HEIGHT = 1024;

// Layout zones (y start, height)
export const RULE_BANNER_Y = 0;
export const RULE_BANNER_H = 80;
export const HUD_Y = 80;
export const HUD_H = 60;
export const GRID_Y = 160;
export const GRID_H = 480;
export const DPAD_Y = 660;
export const DPAD_H = 364;

// Grid cell size
export const CELL_W = CANVAS_WIDTH / 5;   // 153.6 → we'll use 150 + margins
export const CELL_H = GRID_H / 6;         // 80

// D-Pad
export const DPAD_BTN_SIZE = 120;

// Colors
export const COLOR_BG = 0x1a1a2e;
export const COLOR_CELL = 0x16213e;
export const COLOR_CELL_BORDER = 0x2a2a4a;
export const COLOR_PLAYER = 0x44cc44;
export const COLOR_CORRECT_FLASH = 0x00ff88;
export const COLOR_WRONG_FLASH = 0xff0000;
export const COLOR_RULE_TEXT = '#ffd700';
export const COLOR_HUD_TEXT = '#ffffff';
export const COLOR_CELL_TEXT = '#e0e0e0';

// Troggle colors
export const TROGGLE_COLORS: Record<string, number> = {
  reggie: 0xcc4444,
  fangs: 0x44aacc,
  squirt: 0x3b7bbf,
  ember: 0xf48c06,
  bonehead: 0x6b6b7a,
};

// Player move interval (ms between auto-repeat)
export const PLAYER_MOVE_MS = 200;

// Flash duration (ms)
export const FLASH_CORRECT_MS = 200;
export const FLASH_WRONG_MS = 400;
