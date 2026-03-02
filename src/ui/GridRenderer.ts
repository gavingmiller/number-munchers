import Phaser from 'phaser';
import type { GameState, TroggleData, CharacterType } from '../types';
import { ROWS, COLS, cellIndex } from '../types';
import {
  GRID_Y, CELL_W, CELL_H,
  COLOR_CELL, COLOR_CELL_BORDER, COLOR_CELL_TEXT,
} from '../constants';
import { drawCharacter } from './CharacterSprites';
import { drawTroggle } from './TroggleSprites';

export class GridRenderer {
  private scene: Phaser.Scene;
  private character: CharacterType;
  private cellBgs: Phaser.GameObjects.Rectangle[][] = [];
  private cellTexts: Phaser.GameObjects.Text[][] = [];
  private playerContainer!: Phaser.GameObjects.Container;
  private troggleSprites: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor(scene: Phaser.Scene, character: CharacterType = 'box') {
    this.scene = scene;
    this.character = character;
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
    this.playerContainer = this.createPlayerSprite(px, py);
    this.playerContainer.setDepth(5);

    // Troggle sprites
    this.syncTroggles(state.troggles);
  }

  update(state: GameState): void {
    // Update cell contents — show all first
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = state.grid[cellIndex(r, c)];
        const displayValue = cell.state === 'filled' ? String(cell.value) : '';
        this.cellTexts[r][c].setText(displayValue);
        this.cellTexts[r][c].setVisible(true);
      }
    }

    // Update player position
    this.playerContainer.setPosition(
      this.cellX(state.player.col),
      this.cellY(state.player.row),
    );

    // Update troggles
    this.syncTroggles(state.troggles);

    // Hide text under player
    this.cellTexts[state.player.row]?.[state.player.col]?.setVisible(false);

    // Hide text under active troggles
    for (const t of state.troggles) {
      if (t.row >= 0 && t.row < ROWS && t.col >= 0 && t.col < COLS) {
        this.cellTexts[t.row]?.[t.col]?.setVisible(false);
      }
    }
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

  private createPlayerSprite(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);
    drawCharacter(this.scene, container, this.character, 4);
    return container;
  }

  private syncTroggles(troggles: TroggleData[]): void {
    const activeIds = new Set<string>();

    for (const t of troggles) {
      activeIds.add(t.id);
      const sprite = this.troggleSprites.get(t.id);

      if (t.row === -1) {
        if (sprite) sprite.setVisible(false);
        continue;
      }

      if (!sprite) {
        const container = this.scene.add.container(
          this.cellX(t.col), this.cellY(t.row),
        );
        drawTroggle(this.scene, container, t.type, 4);
        container.setDepth(4);
        this.troggleSprites.set(t.id, container);
      } else {
        sprite.setVisible(true);
        sprite.setPosition(this.cellX(t.col), this.cellY(t.row));
      }
    }

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
