import Phaser from 'phaser';
import type { GameState } from '../types';
import { CANVAS_WIDTH, GRID_Y } from '../constants';

const PAD_X = 8;
const PAD_Y = 6;
const LINE_H = 18;
const FONT = { fontSize: '13px', fontFamily: 'monospace', color: '#00ff99' };

export class DebugOverlay {
  private scene: Phaser.Scene;
  private bg!: Phaser.GameObjects.Rectangle;
  private lines: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(state: GameState): void {
    // Background panel — positioned top-right of grid
    this.bg = this.scene.add.rectangle(
      CANVAS_WIDTH - 1, GRID_Y + 1,
      1, 1,
      0x000000, 0.65,
    ).setOrigin(1, 0).setDepth(20);

    this.update(state);
  }

  update(state: GameState): void {
    const textLines = this.buildLines(state);

    // Grow/shrink line objects to match
    while (this.lines.length < textLines.length) {
      const idx = this.lines.length;
      const txt = this.scene.add.text(0, 0, '', FONT)
        .setDepth(21)
        .setOrigin(1, 0); // right-aligned
      this.lines.push(txt);
      // Position is set below
      void idx;
    }
    while (this.lines.length > textLines.length) {
      this.lines.pop()!.destroy();
    }

    const maxW = Math.max(...textLines.map((l) => this.approxWidth(l)));
    const panelW = maxW + PAD_X * 2;
    const panelH = textLines.length * LINE_H + PAD_Y * 2;

    this.bg.setSize(panelW, panelH);

    const rightX = CANVAS_WIDTH - PAD_X;
    textLines.forEach((line, i) => {
      this.lines[i].setText(line);
      this.lines[i].setPosition(rightX, GRID_Y + PAD_Y + i * LINE_H);
    });
  }

  private buildLines(state: GameState): string[] {
    const lines: string[] = [`TICK: ${state.tickCount}`];

    state.troggles.forEach((t, i) => {
      if (t.row === -1) {
        // Inactive — show countdown to entry
        const ticksLeft = t.ticksUntilEntry >= 0
          ? Math.max(0, t.ticksUntilEntry - state.tickCount)
          : '—';
        const movesLeft = t.playerMovesUntilEntry >= 0
          ? Math.max(0, t.playerMovesUntilEntry - state.playerMoveCount)
          : '—';
        lines.push(`T${i} ${t.type.slice(0, 4)} | WAIT ${ticksLeft}t / ${movesLeft}mv`);
      } else {
        // Active — show move timer and position
        lines.push(`T${i} ${t.type.slice(0, 4)} @(${t.row},${t.col}) | mv:${t.moveTimer}t`);
      }
    });

    return lines;
  }

  /** Rough character-width estimate for monospace font at 13px */
  private approxWidth(text: string): number {
    return text.length * 8;
  }
}
