import Phaser from 'phaser';
import type { GameState, TroggleData, CharacterType, Direction } from '../types';
import { ROWS, COLS, cellIndex } from '../types';
import {
  GRID_Y, CELL_W, CELL_H,
  COLOR_CELL, COLOR_CELL_BORDER, COLOR_CELL_TEXT,
} from '../constants';
import { drawCharacter } from './CharacterSprites';
import { drawTroggle } from './TroggleSprites';
import { AnimationController, troggleAnimName } from './AnimationController';
import { animKey } from '../sprites/SpriteRegistry';

const TROGGLE_PIXEL_SIZE = 6;

export class GridRenderer {
  private scene: Phaser.Scene;
  private character: CharacterType;
  private cellBgs: Phaser.GameObjects.Rectangle[][] = [];
  private cellTexts: Phaser.GameObjects.Text[][] = [];
  private playerContainer!: Phaser.GameObjects.Container;
  private playerAnimController: AnimationController | null = null;
  private troggleData: Map<string, { container: Phaser.GameObjects.Container; sprite: Phaser.GameObjects.Sprite | null }> = new Map();

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
          padding: { top: 2, bottom: 4 },
        }).setOrigin(0.5).setResolution(2);
        this.cellTexts[r][c] = txt;
      }
    }

    // Player sprite
    const px = this.cellX(state.player.col);
    const py = this.cellY(state.player.row);
    this.playerContainer = this.createPlayerSprite(px, py);
    this.playerContainer.setDepth(5);

    // Pre-create troggle containers (hidden until activated)
    for (const t of state.troggles) {
      const container = this.scene.add.container(0, 0);
      drawTroggle(this.scene, container, t.type, TROGGLE_PIXEL_SIZE);
      container.setDepth(4);
      container.setVisible(false);

      // PNG branch for troggle
      let troggleSprite: Phaser.GameObjects.Sprite | null = null;
      if (this.scene.textures.exists(t.type)) {
        troggleSprite = this.scene.add.sprite(0, 0, t.type);
        troggleSprite.setDisplaySize(TROGGLE_PIXEL_SIZE * 12, TROGGLE_PIXEL_SIZE * 12);
        container.add(troggleSprite);
      }

      this.troggleData.set(t.id, { container, sprite: troggleSprite });
    }

    // Initial sync
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

    // Return to idle when stationary (no active walk/munch)
    if (this.playerAnimController) {
      const current = this.playerAnimController.getCurrentAnim();
      const idleKey = animKey(this.character, 'idle');
      const munchKey = animKey(this.character, 'munch');
      // Don't interrupt munch — it returns to idle via callback
      if (current !== idleKey && current !== munchKey && !current.startsWith(this.character + '-walk')) {
        this.playIdle();
      }
    }

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

  playWalk(dir: Direction): void {
    if (!this.playerAnimController) return;
    const dirMap: Record<Direction, string> = {
      up: 'walkUp', down: 'walkDown', left: 'walkLeft', right: 'walkRight',
    };
    const walkKey = animKey(this.character, dirMap[dir]);
    if (this.scene.anims.exists(walkKey)) {
      this.playerAnimController.play(walkKey);
    }
  }

  playMunch(): void {
    if (!this.playerAnimController) return;
    const munchKey = animKey(this.character, 'munch');
    if (!this.scene.anims.exists(munchKey)) return;
    this.playerAnimController.playOnce(munchKey, () => {
      const idleKey = animKey(this.character, 'idle');
      if (this.scene.anims.exists(idleKey)) {
        this.playerAnimController?.play(idleKey);
      }
    });
  }

  playIdle(): void {
    if (!this.playerAnimController) return;
    const idleKey = animKey(this.character, 'idle');
    if (this.scene.anims.exists(idleKey)) {
      this.playerAnimController.play(idleKey);
    }
  }

  private createPlayerSprite(x: number, y: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(x, y);

    // PNG branch: character has a loaded spritesheet texture
    if (this.scene.textures.exists(this.character)) {
      const sprite = this.scene.add.sprite(0, 0, this.character);
      sprite.setDisplaySize(4 * 12, 4 * 12);
      container.add(sprite);
      this.playerAnimController = new AnimationController(sprite);
      const idleKey = animKey(this.character, 'idle');
      if (this.scene.anims.exists(idleKey)) {
        this.playerAnimController.play(idleKey);
      }
    } else {
      // Programmatic fallback
      drawCharacter(this.scene, container, this.character, 4);
      this.playerAnimController = null;
    }

    return container;
  }

  private syncTroggles(troggles: TroggleData[]): void {
    for (const t of troggles) {
      const data = this.troggleData.get(t.id);
      if (!data) continue;

      const { container, sprite } = data;

      if (t.row === -1) {
        container.setVisible(false);
      } else {
        container.setVisible(true);
        container.setPosition(this.cellX(t.col), this.cellY(t.row));

        // Play troggle movement animation if sprite exists
        if (sprite) {
          const moveAnim = animKey(t.type, troggleAnimName(t.type));
          if (this.scene.anims.exists(moveAnim)) {
            if (sprite.anims.currentAnim?.key !== moveAnim) {
              sprite.play(moveAnim);
            }
          }
        }
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
