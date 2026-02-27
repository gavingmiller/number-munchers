import Phaser from 'phaser';
import type { GameState, Direction, GameMode, ScoreData } from '../types';
import { createLevelState, applyMove, applyMunch, applyTroggleHit, applyTroggleTick } from '../game/state/GameState';
import { checkPlayerCell, checkPlayerTroggles } from '../game/logic/CollisionSystem';
import { GridRenderer } from '../ui/GridRenderer';
import { HUD } from '../ui/HUD';
import { DPad } from '../ui/DPad';
import { RuleBanner } from '../ui/RuleBanner';
import { DebugOverlay } from '../ui/DebugOverlay';
import {
  PLAYER_MOVE_MS,
  FLASH_CORRECT_MS,
  FLASH_WRONG_MS,
  COLOR_CORRECT_FLASH,
  COLOR_WRONG_FLASH,
} from '../constants';

interface GameSceneData {
  mode: GameMode;
  level?: number;
  score?: ScoreData;
}

export class GameScene extends Phaser.Scene {
  private state!: GameState;
  private gridRenderer!: GridRenderer;
  private hud!: HUD;
  private dpad!: DPad;
  private ruleBanner!: RuleBanner;
  private debugOverlay!: DebugOverlay;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private moveTimer = 0;
  private gameTickTimer = 0;
  private readonly GAME_TICK_MS = 100;
  private sceneData!: GameSceneData;

  constructor() {
    super({ key: 'Game' });
  }

  init(data: GameSceneData): void {
    this.sceneData = {
      mode: data.mode ?? 'multiples',
      level: data.level ?? 1,
      score: data.score,
    };
  }

  create(): void {
    const { mode, level, score } = this.sceneData;
    this.state = createLevelState(mode, level ?? 1, score);
    this.moveTimer = 0;
    this.gameTickTimer = 0;

    // Create UI components
    this.ruleBanner = new RuleBanner(this);
    this.ruleBanner.create(this.state);

    this.hud = new HUD(this);
    this.hud.create(this.state);

    this.gridRenderer = new GridRenderer(this);
    this.gridRenderer.create(this.state);

    this.debugOverlay = new DebugOverlay(this);
    this.debugOverlay.create(this.state);

    this.dpad = new DPad(this, (dir: Direction) => {
      this.handleMove(dir);
    });
    this.dpad.create(() => {
      this.handleMunch();
    });

    // Keyboard input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    // Listen for resume from overlay scenes
    this.events.on('resume', () => {
      // Reset timers and unblock update() after returning from overlay
      this.moveTimer = 0;
      this.gameTickTimer = 0;
      this.state = { ...this.state, status: 'playing' };
      this.gridRenderer.update(this.state);
      this.hud.update(this.state);
    });
  }

  update(_time: number, delta: number): void {
    if (this.state.status !== 'playing') return;

    // Handle keyboard movement with throttle
    this.moveTimer += delta;
    if (this.moveTimer >= PLAYER_MOVE_MS) {
      const dir = this.readKeyboardDirection();
      if (dir) {
        this.handleMove(dir);
        this.moveTimer = 0;
      }
    }

    // Check for munch via keyboard
    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.handleMunch();
    }

    // Troggle AI tick
    this.gameTickTimer += delta;
    if (this.gameTickTimer >= this.GAME_TICK_MS) {
      this.gameTickTimer -= this.GAME_TICK_MS;
      this.state = applyTroggleTick(this.state);

      // Check troggle collision
      const troggleResult = checkPlayerTroggles(this.state);
      if (troggleResult.type === 'troggle-hit') {
        this.triggerLifeLost();
        return;
      }

      this.gridRenderer.update(this.state);
      this.debugOverlay.update(this.state);
    }
  }

  private readKeyboardDirection(): Direction | null {
    if (!this.cursors) return null;
    if (this.cursors.up.isDown) return 'up';
    if (this.cursors.down.isDown) return 'down';
    if (this.cursors.left.isDown) return 'left';
    if (this.cursors.right.isDown) return 'right';
    return null;
  }

  private handleMove(dir: Direction): void {
    if (this.state.status !== 'playing') return;
    this.state = applyMove(this.state, dir);
    this.gridRenderer.update(this.state);
    this.hud.update(this.state);
    this.debugOverlay.update(this.state);

    // Check troggle collision after moving
    const troggleResult = checkPlayerTroggles(this.state);
    if (troggleResult.type === 'troggle-hit') {
      this.triggerLifeLost();
    }
  }

  private handleMunch(): void {
    if (this.state.status !== 'playing') return;

    const cellResult = checkPlayerCell(this.state);

    if (cellResult.type === 'correct') {
      this.state = applyMunch(this.state);
      this.gridRenderer.flashCell(
        this.state.player.row,
        this.state.player.col,
        COLOR_CORRECT_FLASH,
        FLASH_CORRECT_MS,
      );
      this.gridRenderer.update(this.state);
      this.hud.update(this.state);

      // Check level complete
      if (this.state.correctCellsRemaining <= 0) {
        this.handleLevelComplete();
      }
    } else if (cellResult.type === 'wrong') {
      this.gridRenderer.flashCell(
        this.state.player.row,
        this.state.player.col,
        COLOR_WRONG_FLASH,
        FLASH_WRONG_MS,
      );
      this.triggerLifeLost();
    }
    // 'empty' type: do nothing
  }

  private triggerLifeLost(): void {
    this.state = applyTroggleHit(this.state);

    if (this.state.lives <= 0) {
      this.state.status = 'game-over';
      this.scene.stop();
      this.scene.start('HiScore', { score: this.state.score.current });
      return;
    }

    this.state.status = 'life-lost';
    this.hud.update(this.state);
    this.scene.pause();
    this.scene.launch('GameOver', { lives: this.state.lives });
  }

  private handleLevelComplete(): void {
    const nextLevel = this.state.level + 1;

    // Every 3 levels: show cutscene
    if (this.state.level % 3 === 0) {
      this.state.status = 'cutscene';
      this.scene.pause();
      this.scene.launch('Cutscene', {
        level: this.state.level,
        onComplete: () => {
          this.advanceLevel(nextLevel);
        },
      });
    } else {
      this.advanceLevel(nextLevel);
    }
  }

  private advanceLevel(nextLevel: number): void {
    this.scene.restart({
      mode: this.state.mode,
      level: nextLevel,
      score: this.state.score,
    });
  }
}
