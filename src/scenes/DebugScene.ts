import Phaser from 'phaser';
import type { GameState, TroggleType } from '../types';
import { createLevelState, applyTroggleTick } from '../game/state/GameState';
import { createTroggle } from '../game/entities/Troggle';
import { GridRenderer } from '../ui/GridRenderer';
import { HUD } from '../ui/HUD';
import { RuleBanner } from '../ui/RuleBanner';
import { DebugOverlay } from '../ui/DebugOverlay';
import { CANVAS_WIDTH, GRID_Y, GRID_H, TROGGLE_COLORS } from '../constants';

// Match production speed (100ms per tick)
const DEBUG_TICK_MS = 100;

interface TroggleSpec {
  type: TroggleType;
  desc: string;
}

const TROGGLE_SPECS: TroggleSpec[] = [
  { type: 'reggie',  desc: 'Straight line, exits edge, re-enters later' },
  { type: 'smartie', desc: 'Chases player (row-first priority)' },
  { type: 'bashful', desc: 'Flees player when within distance 3' },
  { type: 'helper',  desc: 'Moves randomly each tick' },
  { type: 'worker',  desc: 'Fastest — seeks closest cell to player' },
];

export class DebugScene extends Phaser.Scene {
  private state!: GameState;
  private gridRenderer!: GridRenderer;
  private hud!: HUD;
  private ruleBanner!: RuleBanner;
  private debugOverlay!: DebugOverlay;
  private gameTickTimer = 0;

  constructor() {
    super({ key: 'Debug' });
  }

  create(): void {
    // Use real game state (level 10 has full troggle roster + real grid/rule)
    const base = createLevelState('multiples', 10);
    const baseInterval = base.troggles[0]?.moveInterval ?? 10;
    const workerInterval = Math.max(1, Math.floor(baseInterval * 0.5));

    // Replace troggles: one of every type, low tick entry thresholds (20/40/60/80/100),
    // playerMovesUntilEntry=9999 so they only enter via ticks (not player moves)
    this.state = {
      ...base,
      troggles: TROGGLE_SPECS.map((spec, i) =>
        createTroggle(
          `debug-${spec.type}`,
          spec.type,
          -1, -1,
          spec.type === 'worker' ? workerInterval : baseInterval,
          9999,        // playerMovesUntilEntry: ignore in debug
          20 + i * 20, // ticksUntilEntry: 20, 40, 60, 80, 100
        )
      ),
    };

    // Real UI stack — identical to GameScene
    this.ruleBanner = new RuleBanner(this);
    this.ruleBanner.create(this.state);

    this.hud = new HUD(this);
    this.hud.create(this.state);

    this.gridRenderer = new GridRenderer(this);
    this.gridRenderer.create(this.state);

    this.debugOverlay = new DebugOverlay(this);
    this.debugOverlay.create(this.state);

    // Legend in the DPad zone (below grid) — no DPad in debug mode
    this.buildLegend();

    // SPACE exits to main menu
    if (this.input.keyboard) {
      this.input.keyboard
        .addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
        .on('down', () => { this.scene.start('MainMenu'); });
    }
  }

  update(_time: number, delta: number): void {
    this.gameTickTimer += delta;
    if (this.gameTickTimer >= DEBUG_TICK_MS) {
      this.gameTickTimer -= DEBUG_TICK_MS;

      this.state = applyTroggleTick(this.state);

      // Random score 1–100 per tick
      const pts = Math.floor(Math.random() * 100) + 1;
      this.state = {
        ...this.state,
        score: { ...this.state.score, current: this.state.score.current + pts },
      };

      this.gridRenderer.update(this.state);
      this.hud.update(this.state);
      this.debugOverlay.update(this.state);
    }
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
      const color = TROGGLE_COLORS[spec.type] ?? 0xffffff;

      // Color swatch
      this.add.rectangle(28, y + rowH / 2 - 4, 20, 20, color, 0.9)
        .setStrokeStyle(1, color);

      // Type name
      this.add.text(48, y + 4, spec.type, {
        fontSize: '15px',
        fontFamily: 'monospace',
        color: '#ffffff',
        fontStyle: 'bold',
      });

      // Behavior description
      this.add.text(48, y + 24, spec.desc, {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#aaaaaa',
      });
    });
  }
}
