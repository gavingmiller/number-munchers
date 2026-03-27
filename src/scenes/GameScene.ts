import Phaser from 'phaser';
import type { GameState, Direction, GameMode, GradeLevel, ScoreData, CharacterType, GameDeath, ProblemResult } from '../types';
import { createLevelState, applyMove, applyMunch, applyTroggleHit, applyTroggleTick } from '../game/state/GameState';
import type { SessionCarry } from '../game/state/GameState';
import { addGameRecord } from '../game/state/Persistence';
import type { GameRecord } from '../game/state/Persistence';
import { checkPlayerCell, checkPlayerTroggles } from '../game/logic/CollisionSystem';
import { getWrongExplanation } from '../game/logic/RuleEngine';
import { GridRenderer } from '../ui/GridRenderer';
import { HUD } from '../ui/HUD';
import { DPad } from '../ui/DPad';
import { RuleBanner } from '../ui/RuleBanner';
import { DebugOverlay } from '../ui/DebugOverlay';
import { drawHomeIcon } from '../ui/CharacterSprites';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
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
  character?: CharacterType;
  grade?: GradeLevel;
  carry?: SessionCarry;
  previousLives?: number;
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
  private confirmOverlay: Phaser.GameObjects.GameObject[] = [];
  private paused = false;

  constructor() {
    super({ key: 'Game' });
  }

  init(data: GameSceneData): void {
    this.sceneData = {
      mode: data.mode ?? 'multiples',
      level: data.level ?? 1,
      score: data.score,
      character: data.character ?? 'box',
      grade: data.grade ?? ((Number(localStorage.getItem('numberMunchers_grade')) || 4) as GradeLevel),
      carry: data.carry,
      previousLives: data.previousLives,
    };
  }

  create(): void {
    const { mode, level, score, grade, carry, previousLives } = this.sceneData;
    this.state = createLevelState(mode, level ?? 1, score, grade, carry, previousLives);
    this.moveTimer = 0;
    this.gameTickTimer = 0;
    this.paused = false;
    this.confirmOverlay = [];

    // Create UI components
    this.ruleBanner = new RuleBanner(this);
    this.ruleBanner.create(this.state);

    this.hud = new HUD(this);
    this.hud.create(this.state);

    this.gridRenderer = new GridRenderer(this, this.sceneData.character ?? 'box');
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

    // Home button (top-left corner) — pixel art house sprite
    const homeContainer = this.add.container(36, 36);
    drawHomeIcon(this, homeContainer, 4);
    homeContainer.setDepth(20).setScrollFactor(0).setAlpha(0.55);
    homeContainer.setSize(48, 48).setInteractive({ useHandCursor: true });
    homeContainer.on('pointerdown', () => this.showExitConfirmation());

    // ESC key also triggers exit
    if (this.input.keyboard) {
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
        .on('down', () => this.showExitConfirmation());
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
    if (this.paused) return;
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
        const troggle = this.state.troggles.find(t => t.id === troggleResult.troggleId);
        const name = troggle ? troggle.type.charAt(0).toUpperCase() + troggle.type.slice(1) : 'a Troggle';
        this.triggerLifeLost(undefined, name);
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
      const troggle = this.state.troggles.find(t => t.id === troggleResult.troggleId);
      const name = troggle ? troggle.type.charAt(0).toUpperCase() + troggle.type.slice(1) : 'a Troggle';
      this.triggerLifeLost(undefined, name);
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
      const explanation = getWrongExplanation(cellResult.cell.value, this.state.rule);
      this.triggerLifeLost(explanation);
    }
    // 'empty' type: do nothing
  }

  private triggerLifeLost(explanation?: string, caughtBy?: string): void {
    // Track the death event
    const death: GameDeath = {
      level: this.state.level,
      cause: caughtBy ? 'troggle' : 'wrong_answer',
      detail: caughtBy ?? explanation ?? 'Unknown',
    };
    this.state = { ...this.state, deaths: [...this.state.deaths, death] };

    this.state = applyTroggleHit(this.state);

    if (this.state.lives <= 0) {
      this.state.status = 'game-over';
      this.saveGameRecord();
      this.scene.stop();
      this.scene.start('HiScore', { starsEarned: this.state.starsEarned });
      return;
    }

    this.state.status = 'life-lost';
    this.hud.update(this.state);
    this.scene.pause();
    this.scene.launch('GameOver', { lives: this.state.lives, explanation, caughtBy });
  }

  private saveGameRecord(): void {
    const record: GameRecord = {
      id: `game-${Date.now()}`,
      date: new Date().toISOString(),
      grade: this.state.grade,
      mode: this.state.mode,
      character: this.sceneData.character ?? 'claude',
      levelReached: this.state.level,
      starsEarned: this.state.starsEarned,
      totalAnswers: this.state.problems.length,
      correctAnswers: this.state.problems.filter((p) => p.correct).length,
      wrongAnswers: this.state.problems.filter((p) => !p.correct).length,
      deaths: this.state.deaths,
      problems: this.state.problems,
    };
    addGameRecord(record);
  }

  private handleLevelComplete(): void {
    const nextLevel = this.state.level + 1;
    const level = this.state.level;

    this.state.status = 'cutscene';
    this.scene.pause();

    const afterLevelComplete = () => {
      // Every 3 levels: show cutscene before advancing
      if (level % 3 === 0) {
        this.scene.launch('Cutscene', {
          level,
          onComplete: () => {
            this.advanceLevel(nextLevel);
          },
        });
      } else {
        this.advanceLevel(nextLevel);
      }
    };

    this.scene.launch('LevelComplete', {
      level,
      onComplete: afterLevelComplete,
    });
  }

  private advanceLevel(nextLevel: number): void {
    this.scene.restart({
      mode: this.state.mode,
      level: nextLevel,
      score: this.state.score,
      character: this.sceneData.character,
      grade: this.sceneData.grade,
      carry: {
        starsEarned: this.state.starsEarned,
        deaths: this.state.deaths,
        problems: this.state.problems,
      },
      previousLives: this.state.lives,
    });
  }

  private showExitConfirmation(): void {
    if (this.paused) return;
    this.paused = true;

    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;

    // Dark overlay
    const bg = this.add.rectangle(cx, cy, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.8)
      .setScrollFactor(0).setDepth(100).setInteractive();

    // Dialog box
    const dialog = this.add.rectangle(cx, cy, 400, 220, 0x1a1a2e)
      .setStrokeStyle(2, 0xffd700)
      .setScrollFactor(0).setDepth(101);

    const title = this.add.text(cx, cy - 50, 'Exit Level?', {
      fontSize: '36px', fontFamily: 'Arial', color: '#ffd700', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(102);

    // Yes button
    const yesBg = this.add.rectangle(cx - 80, cy + 30, 120, 50, 0x3a5a2a)
      .setStrokeStyle(2, 0x44cc44)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0).setDepth(102);
    const yesText = this.add.text(cx - 80, cy + 30, 'Yes', {
      fontSize: '24px', fontFamily: 'Arial', color: '#44cc44', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(103);

    // No button
    const noBg = this.add.rectangle(cx + 80, cy + 30, 120, 50, 0x5a2a2a)
      .setStrokeStyle(2, 0xff4444)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0).setDepth(102);
    const noText = this.add.text(cx + 80, cy + 30, 'No', {
      fontSize: '24px', fontFamily: 'Arial', color: '#ff4444', fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(103);

    this.confirmOverlay = [bg, dialog, title, yesBg, yesText, noBg, noText];

    yesBg.on('pointerdown', () => {
      this.scene.start('MainMenu');
    });

    noBg.on('pointerdown', () => {
      this.dismissExitConfirmation();
    });
  }

  private dismissExitConfirmation(): void {
    for (const obj of this.confirmOverlay) {
      obj.destroy();
    }
    this.confirmOverlay = [];
    this.paused = false;
  }
}
