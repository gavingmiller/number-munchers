import Phaser from 'phaser';
import {
  CANVAS_WIDTH, CANVAS_HEIGHT,
  GRID_Y, CELL_W, CELL_H,
  TROGGLE_COLORS,
  COLOR_CELL, COLOR_CELL_BORDER,
} from '../constants';
import { ROWS, COLS } from '../types';
import { randomInt } from '../game/logic/MathUtils';

// One-line behavior descriptions for the legend
const TROGGLE_INFO: Array<{ type: string; color: number; desc: string }> = [
  { type: 'reggie',  color: TROGGLE_COLORS.reggie,  desc: 'Straight line, exits edge, re-enters later' },
  { type: 'smartie', color: TROGGLE_COLORS.smartie,  desc: 'Chases player (row-first priority)' },
  { type: 'bashful', color: TROGGLE_COLORS.bashful,  desc: 'Flees player when within distance 3' },
  { type: 'helper',  color: TROGGLE_COLORS.helper,   desc: 'Moves randomly each tick' },
  { type: 'worker',  color: TROGGLE_COLORS.worker,   desc: 'Enters at T:1000 — fastest, seeks closest cell' },
];

interface DebugTroggle {
  type: string;
  color: number;
  row: number;
  col: number;
  sprite: Phaser.GameObjects.Rectangle;
  entryTick: number; // absolute tick when it will enter
  active: boolean;
}

export class DebugScene extends Phaser.Scene {
  private tick = 0;
  private scoreTxt!: Phaser.GameObjects.Text;
  private tickTxt!: Phaser.GameObjects.Text;
  private troggles: DebugTroggle[] = [];
  private troggleTimer!: Phaser.Time.TimerEvent;
  private statusLines: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'Debug' });
  }

  create(): void {
    // Background grid
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        this.add.rectangle(
          c * CELL_W + CELL_W / 2,
          GRID_Y + r * CELL_H + CELL_H / 2,
          CELL_W - 2, CELL_H - 2,
          COLOR_CELL,
        ).setStrokeStyle(1, COLOR_CELL_BORDER);
      }
    }

    // Header
    this.add.text(CANVAS_WIDTH / 2, 16, 'DEBUG MODE', {
      fontSize: '22px', fontFamily: 'Arial', color: '#ff4444', fontStyle: 'bold',
    }).setOrigin(0.5, 0);

    this.add.text(CANVAS_WIDTH / 2, 44, 'SPACE to exit', {
      fontSize: '14px', fontFamily: 'Arial', color: '#888888',
    }).setOrigin(0.5, 0);

    // Score + tick display
    this.scoreTxt = this.add.text(16, 16, 'Score: 0', {
      fontSize: '16px', fontFamily: 'monospace', color: '#00ff99',
    });
    this.tickTxt = this.add.text(16, 36, 'T: 0', {
      fontSize: '16px', fontFamily: 'monospace', color: '#00ff99',
    });

    // Legend (below grid)
    const legendY = GRID_Y + ROWS * CELL_H + 16;
    this.add.text(16, legendY, 'TROGGLES:', {
      fontSize: '13px', fontFamily: 'monospace', color: '#ffd700',
    });

    TROGGLE_INFO.forEach((info, i) => {
      const y = legendY + 20 + i * 28;
      this.add.rectangle(24, y + 10, 18, 18, info.color, 0.9)
        .setStrokeStyle(1, info.color);
      this.add.text(40, y, `${info.type}`, {
        fontSize: '13px', fontFamily: 'monospace', color: '#ffffff', fontStyle: 'bold',
      });
      this.add.text(40, y + 14, info.desc, {
        fontSize: '11px', fontFamily: 'monospace', color: '#aaaaaa',
      });
    });

    // Status panel (right side) for entry countdowns
    const statusX = CANVAS_WIDTH - 8;
    for (let i = 0; i < TROGGLE_INFO.length; i++) {
      const txt = this.add.text(statusX, GRID_Y + i * 18, '', {
        fontSize: '11px', fontFamily: 'monospace', color: '#00ff99',
      }).setOrigin(1, 0).setDepth(10);
      this.statusLines.push(txt);
    }

    // Build debug troggles — stagger entry ticks
    TROGGLE_INFO.forEach((info, i) => {
      const entryTick = info.type === 'worker' ? 1000 : randomInt(30 + i * 20, 60 + i * 20);
      const sprite = this.add.rectangle(-100, -100, CELL_W - 16, CELL_H - 16, info.color, 0.8)
        .setStrokeStyle(2, info.color)
        .setDepth(4)
        .setVisible(false);

      this.troggles.push({
        type: info.type,
        color: info.color,
        row: -1,
        col: -1,
        sprite,
        entryTick,
        active: false,
      });
    });

    // Space to exit
    if (this.input.keyboard) {
      this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', () => {
        this.troggleTimer.remove();
        this.scene.start('MainMenu');
      });
    }

    // Main game loop timer
    this.troggleTimer = this.time.addEvent({
      delay: 100,
      loop: true,
      callback: this.gameTick,
      callbackScope: this,
    });
  }

  private gameTick(): void {
    this.tick++;
    const score = this.tick * 10;

    this.scoreTxt.setText(`Score: ${score}`);
    this.tickTxt.setText(`T: ${this.tick}`);

    // Activate troggles whose entry tick has been reached
    this.troggles.forEach((t) => {
      if (!t.active && this.tick >= t.entryTick) {
        const edgePos = this.randomEdge();
        t.row = edgePos.row;
        t.col = edgePos.col;
        t.active = true;
        t.sprite.setVisible(true);
        t.sprite.setPosition(this.cellX(t.col), this.cellY(t.row));
      }
    });

    // Update status lines
    this.troggles.forEach((t, i) => {
      if (!t.active) {
        const remaining = t.entryTick - this.tick;
        this.statusLines[i].setText(`${t.type.slice(0,4)} WAIT ${remaining}t`);
      } else {
        this.statusLines[i].setText(`${t.type.slice(0,4)} @(${t.row},${t.col})`);
      }
    });
  }

  private randomEdge(): { row: number; col: number } {
    const side = Math.floor(Math.random() * 4);
    if (side === 0) return { row: 0,        col: Math.floor(Math.random() * COLS) };
    if (side === 1) return { row: ROWS - 1,  col: Math.floor(Math.random() * COLS) };
    if (side === 2) return { row: Math.floor(Math.random() * ROWS), col: 0 };
    return              { row: Math.floor(Math.random() * ROWS), col: COLS - 1 };
  }

  private cellX(col: number): number { return col * CELL_W + CELL_W / 2; }
  private cellY(row: number): number { return GRID_Y + row * CELL_H + CELL_H / 2; }
}
