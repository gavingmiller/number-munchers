import Phaser from 'phaser';
import type { GameState, TroggleData, CharacterType, Direction } from '../types';
import { ROWS, COLS, cellIndex } from '../types';
import {
  GRID_Y, CELL_W, CELL_H,
  COLOR_CELL, COLOR_CELL_BORDER, COLOR_CELL_TEXT,
  PLAYER_MOVE_MS,
} from '../constants';
import { drawCharacter } from './CharacterSprites';
import { drawTroggle } from './TroggleSprites';
import { AnimationController } from './AnimationController';
import { animKey, getAnimDef } from '../sprites/SpriteRegistry';

const TROGGLE_PIXEL_SIZE = 6;
const TROGGLE_MOVE_DURATION = 500; // ms — one full walk cycle per cell move

export class GridRenderer {
  private scene: Phaser.Scene;
  private character: CharacterType;
  private cellBgs: Phaser.GameObjects.Rectangle[][] = [];
  private cellTexts: Phaser.GameObjects.Text[][] = [];
  private playerContainer!: Phaser.GameObjects.Container;
  private playerAnimController: AnimationController | null = null;
  private playerPrevRow = -1;
  private playerPrevCol = -1;
  private troggleData: Map<string, {
    container: Phaser.GameObjects.Container;
    sprite: Phaser.GameObjects.Sprite | null;
    prevRow: number;
    prevCol: number;
    tweening: boolean;
  }> = new Map();

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
    this.playerPrevRow = state.player.row;
    this.playerPrevCol = state.player.col;

    // Pre-create troggle containers (hidden until activated)
    for (const t of state.troggles) {
      const container = this.scene.add.container(0, 0);
      container.setDepth(4);
      container.setVisible(false);

      let troggleSprite: Phaser.GameObjects.Sprite | null = null;
      if (this.scene.textures.exists(t.type)) {
        // PNG path: create sprite directly, skip programmatic drawing
        troggleSprite = this.scene.add.sprite(0, 0, t.type);
        troggleSprite.setDisplaySize(TROGGLE_PIXEL_SIZE * 12, TROGGLE_PIXEL_SIZE * 12);
        container.add(troggleSprite);
      } else {
        // Programmatic fallback
        drawTroggle(this.scene, container, t.type, TROGGLE_PIXEL_SIZE);
      }

      this.troggleData.set(t.id, { container, sprite: troggleSprite, prevRow: -1, prevCol: -1, tweening: false });
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

    // Update player position with tween
    const newRow = state.player.row;
    const newCol = state.player.col;
    if (newRow !== this.playerPrevRow || newCol !== this.playerPrevCol) {
      this.scene.tweens.add({
        targets: this.playerContainer,
        x: this.cellX(newCol),
        y: this.cellY(newRow),
        duration: PLAYER_MOVE_MS,
        ease: 'Linear',
      });
      this.playerPrevRow = newRow;
      this.playerPrevCol = newCol;
    }

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

    // Hide text under active troggles based on visual overlap (tight threshold)
    for (const t of state.troggles) {
      const data = this.troggleData.get(t.id);
      if (!data || !data.container.visible) continue;
      // Only hide when troggle is within 50% of a cell center
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const cx = this.cellX(c);
          const cy = this.cellY(r);
          const dx = Math.abs(data.container.x - cx);
          const dy = Math.abs(data.container.y - cy);
          if (dx < CELL_W * 0.5 && dy < CELL_H * 0.5) {
            this.cellTexts[r]?.[c]?.setVisible(false);
          }
        }
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
    const animName = dirMap[dir];
    const walkKey = animKey(this.character, animName);
    if (this.scene.anims.exists(walkKey)) {
      const animDef = getAnimDef(this.character, animName);
      this.playerAnimController.play(walkKey, animDef?.flipX ?? false);
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
      this.playerAnimController.play(idleKey, false);
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
        data.prevRow = -1;
        data.prevCol = -1;
      } else {
        const justEntered = data.prevRow === -1;
        const moved = !justEntered && (t.row !== data.prevRow || t.col !== data.prevCol);

        container.setVisible(true);

        if (justEntered) {
          // Snap to position on entry
          container.setPosition(this.cellX(t.col), this.cellY(t.row));
          data.tweening = false;
        } else if (moved) {
          // Smooth tween to new position
          data.tweening = true;
          this.scene.tweens.add({
            targets: container,
            x: this.cellX(t.col),
            y: this.cellY(t.row),
            duration: TROGGLE_MOVE_DURATION,
            ease: 'Linear',
            onComplete: () => { data.tweening = false; },
          });
        }

        // Play directional animation if sprite exists
        if (sprite) {
          if (moved) {
            // Determine direction from position delta
            const dr = t.row - data.prevRow;
            const dc = t.col - data.prevCol;
            let dirAnimName = 'idle';
            if (Math.abs(dc) >= Math.abs(dr)) {
              dirAnimName = dc > 0 ? 'walkRight' : 'walkLeft';
            } else {
              dirAnimName = dr > 0 ? 'walkDown' : 'walkUp';
            }

            const dirKey = animKey(t.type, dirAnimName);
            if (this.scene.anims.exists(dirKey)) {
              const animDef = getAnimDef(t.type, dirAnimName);
              sprite.flipX = animDef?.flipX ?? false;
              sprite.flipY = animDef?.flipY ?? false;
              if (sprite.anims.currentAnim?.key !== dirKey) {
                sprite.play(dirKey);
              }
            }
          } else if (!data.tweening) {
            // Only return to idle when not mid-tween
            const idleKey = animKey(t.type, 'idle');
            if (this.scene.anims.exists(idleKey)) {
              sprite.flipX = false;
              sprite.flipY = false;
              if (sprite.anims.currentAnim?.key !== idleKey) {
                sprite.play(idleKey);
              }
            }
          }
        }

        data.prevRow = t.row;
        data.prevCol = t.col;
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
