import Phaser from 'phaser';
import type { GameState, TroggleType, Direction } from '../types';
import { createLevelState, applyMove, applyTroggleTick } from '../game/state/GameState';
import { checkPlayerTroggles } from '../game/logic/CollisionSystem';
import { createTroggle } from '../game/entities/Troggle';
import { GridRenderer } from '../ui/GridRenderer';
import { HUD } from '../ui/HUD';
import { RuleBanner } from '../ui/RuleBanner';
import { DebugOverlay } from '../ui/DebugOverlay';
import { drawTroggle } from '../ui/TroggleSprites';
import { CANVAS_WIDTH, GRID_Y, GRID_H, HUD_Y, HUD_H, TROGGLE_COLORS, PLAYER_MOVE_MS } from '../constants';

// Match production speed (100ms per tick)
const DEBUG_TICK_MS = 100;

interface TroggleSpec {
  type: TroggleType;
  desc: string;
}

const TROGGLE_SPECS: TroggleSpec[] = [
  { type: 'reggie',  desc: 'Straight line, exits edge, re-enters later' },
  { type: 'fangs',     desc: 'Chases player (row-first priority)' },
  { type: 'squirt',    desc: 'Flees player when within distance 3' },
  { type: 'ember',     desc: 'Drifts randomly each tick' },
  { type: 'bonehead',  desc: 'Fastest — seeks closest cell to player' },
];

export class DebugScene extends Phaser.Scene {
  private state!: GameState;
  private gridRenderer!: GridRenderer;
  private hud!: HUD;
  private ruleBanner!: RuleBanner;
  private debugOverlay!: DebugOverlay;
  private hitText!: Phaser.GameObjects.Text;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private moveTimer = 0;
  private hitTimer = 0;
  private gameTickTimer = 0;
  private readonly HIT_DISPLAY_MS = 300;

  constructor() {
    super({ key: 'Debug' });
  }

  create(): void {
    // Use real game state (level 10 has full troggle roster + real grid/rule)
    const base = createLevelState('multiples', 10);
    const baseInterval = base.troggles[0]?.moveInterval ?? 10;
    const boneheadInterval = Math.max(1, Math.floor(baseInterval * 0.5));

    // Replace troggles: one of every type, all start on-screen immediately
    // Spread across the grid so they're all visible from the start
    const startPositions = [
      { row: 0, col: 0 }, // reggie top-left
      { row: 0, col: 4 }, // fangs top-right
      { row: 5, col: 0 }, // squirt bottom-left
      { row: 5, col: 4 }, // ember bottom-right
      { row: 3, col: 2 }, // bonehead center
    ];
    this.state = {
      ...base,
      troggles: TROGGLE_SPECS.map((spec, i) => {
        const pos = startPositions[i] ?? { row: 0, col: 0 };
        const t = createTroggle(
          `debug-${spec.type}`,
          spec.type,
          pos.row, pos.col,
          spec.type === 'bonehead' ? boneheadInterval : baseInterval,
          -1, // already active
          -1, // already active
        );
        return { ...t, playerMovesUntilEntry: -1, ticksUntilEntry: -1 };
      }),
    };

    // Real UI stack — identical to GameScene
    this.ruleBanner = new RuleBanner(this);
    this.ruleBanner.create(this.state);

    this.hud = new HUD(this);
    this.hud.create(this.state, false); // no hearts in debug

    this.gridRenderer = new GridRenderer(this);
    this.gridRenderer.create(this.state);

    this.debugOverlay = new DebugOverlay(this);
    this.debugOverlay.create(this.state);

    // Keyboard: cursor keys move player, SPACE exits
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.input.keyboard
        .addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        .on('down', () => { this.scene.start('MainMenu'); });
    }

    // HIT flash text — sits where hearts would be in the HUD
    this.hitText = this.add.text(CANVAS_WIDTH - 20, HUD_Y + HUD_H / 2, 'HIT', {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ff2222',
      fontStyle: 'bold',
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(20).setVisible(false);

    // Legend below grid
    this.buildLegend();
  }

  update(_time: number, delta: number): void {
    // HIT flash countdown
    if (this.hitTimer > 0) {
      this.hitTimer -= delta;
      if (this.hitTimer <= 0) {
        this.hitText.setVisible(false);
      }
    }

    // Keyboard movement with throttle (no munch)
    this.moveTimer += delta;
    if (this.moveTimer >= PLAYER_MOVE_MS) {
      const dir = this.readKeyboardDirection();
      if (dir) {
        this.state = applyMove(this.state, dir);
        this.gridRenderer.update(this.state);
        this.hud.update(this.state);
        this.debugOverlay.update(this.state);
        this.moveTimer = 0;
        this.checkHit();
      }
    }

    this.gameTickTimer += delta;
    if (this.gameTickTimer >= DEBUG_TICK_MS) {
      this.gameTickTimer -= DEBUG_TICK_MS;

      this.state = applyTroggleTick(this.state);

      // Random stars 1–100 per tick (tests HUD formatting)
      const pts = Math.floor(Math.random() * 100) + 1;
      this.state = {
        ...this.state,
        starsEarned: this.state.starsEarned + pts,
        score: { ...this.state.score, current: this.state.score.current + pts },
      };

      this.gridRenderer.update(this.state);
      this.hud.update(this.state);
      this.debugOverlay.update(this.state);
      this.checkHit();
    }
  }

  private checkHit(): void {
    const result = checkPlayerTroggles(this.state);
    if (result.type === 'troggle-hit') {
      this.hitText.setVisible(true);
      this.hitTimer = this.HIT_DISPLAY_MS;
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

  private buildLegend(): void {
    const legendY = GRID_Y + GRID_H + 16;
    const rowH = 52;

    // Header
    this.add.text(CANVAS_WIDTH / 2, legendY, 'DEBUG MODE  ·  SPACE to exit', {
      fontSize: '15px',
      fontFamily: 'monospace',
      color: '#ff4444',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    TROGGLE_SPECS.forEach((spec, i) => {
      const y = legendY + 26 + i * rowH;

      // Troggle sprite (idle)
      const container = this.add.container(28, y + rowH / 2 - 4);
      drawTroggle(this, container, spec.type, 2);
      // Scale up PNG sprites which render too small at P=2
      if (this.textures.exists(spec.type)) {
        container.setScale(2);
      }

      // Type name
      this.add.text(56, y + 4, spec.type, {
        fontSize: '15px',
        fontFamily: 'monospace',
        color: '#ffffff',
        fontStyle: 'bold',
      });

      // Behavior description
      this.add.text(56, y + 24, spec.desc, {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#aaaaaa',
      });
    });
  }
}
