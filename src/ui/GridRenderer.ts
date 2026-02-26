import Phaser from 'phaser';
import type { GameState, TroggleData } from '../types';
import { ROWS, COLS, cellIndex } from '../types';
import {
  GRID_Y, CELL_W, CELL_H,
  COLOR_CELL, COLOR_CELL_BORDER, COLOR_CELL_TEXT,
  COLOR_PLAYER, TROGGLE_COLORS,
} from '../constants';

export class GridRenderer {
  private scene: Phaser.Scene;
  private cellBgs: Phaser.GameObjects.Rectangle[][] = [];
  private cellTexts: Phaser.GameObjects.Text[][] = [];
  private playerSprite!: Phaser.GameObjects.Rectangle;
  private troggleSprites: Map<string, Phaser.GameObjects.Rectangle> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(state: GameState): void {
    // Draw grid cells
    for (let r = 0; r < ROWS; r++) {
      this.cellBgs[r] = [];
      this.cellTexts[r] = [];
      for (let c = 0; c < COLS; c++) {
        const cx = this.cellX(c);
        const cy = this.cellY(r);

        const bg = this.scene.add.rectangle(cx, cy, CELL_W - 2, CELL_H - 2, COLOR_CELL)
          .setStrokeStyle(2, COLOR_CELL_BORDER);
        this.cellBgs[r][c] = bg;

        const cell = state.grid[cellIndex(r, c)];
        const displayValue = cell.state === 'filled' ? String(cell.value) : '';
        const txt = this.scene.add.text(cx, cy, displayValue, {
          fontSize: '26px',
          fontFamily: 'Arial',
          color: COLOR_CELL_TEXT,
          align: 'center',
        }).setOrigin(0.5);
        this.cellTexts[r][c] = txt;
      }
    }

    // Player sprite
    const px = this.cellX(state.player.col);
    const py = this.cellY(state.player.row);
    this.playerSprite = this.scene.add.rectangle(px, py, CELL_W - 20, CELL_H - 20, COLOR_PLAYER, 0.6)
      .setStrokeStyle(2, COLOR_PLAYER);
    this.playerSprite.setDepth(5);

    // Troggle sprites
    this.syncTroggles(state.troggles);
  }

  update(state: GameState): void {
    // Update cell contents
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = state.grid[cellIndex(r, c)];
        const displayValue = cell.state === 'filled' ? String(cell.value) : '';
        this.cellTexts[r][c].setText(displayValue);
      }
    }

    // Update player position
    this.playerSprite.setPosition(
      this.cellX(state.player.col),
      this.cellY(state.player.row),
    );

    // Update troggles
    this.syncTroggles(state.troggles);
  }

  flashCell(row: number, col: number, color: number, durationMs: number): void {
    const bg = this.cellBgs[row]?.[col];
    if (!bg) return;

    const original = COLOR_CELL;
    bg.setFillStyle(color);

    this.scene.time.delayedCall(durationMs, () => {
      bg.setFillStyle(original);
    });
  }

  private syncTroggles(troggles: TroggleData[]): void {
    const activeIds = new Set<string>();

    for (const t of troggles) {
      activeIds.add(t.id);
      const sprite = this.troggleSprites.get(t.id);

      if (t.row === -1) {
        // Inactive troggle: hide existing sprite, don't create a new one
        if (sprite) sprite.setVisible(false);
        continue;
      }

      const tColor = TROGGLE_COLORS[t.type] ?? 0xcc4444;

      if (!sprite) {
        const newSprite = this.scene.add.rectangle(
          this.cellX(t.col), this.cellY(t.row),
          CELL_W - 16, CELL_H - 16,
          tColor, 0.8,
        ).setStrokeStyle(2, tColor);
        newSprite.setDepth(4);
        this.troggleSprites.set(t.id, newSprite);
      } else {
        sprite.setVisible(true);
        sprite.setPosition(this.cellX(t.col), this.cellY(t.row));
      }
    }

    // Remove sprites for troggles no longer in state
    for (const [id, sprite] of this.troggleSprites) {
      if (!activeIds.has(id)) {
        sprite.destroy();
        this.troggleSprites.delete(id);
      }
    }
  }

  cellX(col: number): number {
    return col * CELL_W + CELL_W / 2;
  }

  cellY(row: number): number {
    return GRID_Y + row * CELL_H + CELL_H / 2;
  }
}
