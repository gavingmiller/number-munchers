import Phaser from 'phaser';
import type { GameState } from '../types';
import { CANVAS_WIDTH, RULE_BANNER_H } from '../constants';

// Sits in the right half of the rule banner so it never overlaps the centered rule text
const RIGHT_X = CANVAS_WIDTH - 8;   // right-align anchor
const TOP_Y = 5;                     // top padding inside banner
const LINE_H = 14;                   // px per line at 11px font
const FONT = { fontSize: '11px', fontFamily: 'monospace', color: '#00ff99' };

export class DebugOverlay {
  private scene: Phaser.Scene;
  private lines: Phaser.GameObjects.Text[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(state: GameState): void {
    this.update(state);
  }

  update(state: GameState): void {
    const textLines = this.buildLines(state);

    // Clamp to banner height — never overflow
    const maxLines = Math.floor((RULE_BANNER_H - TOP_Y * 2) / LINE_H);
    const visible = textLines.slice(0, maxLines);

    // Grow / shrink Phaser text objects to match
    while (this.lines.length < visible.length) {
      this.lines.push(
        this.scene.add.text(0, 0, '', FONT)
          .setOrigin(1, 0)   // right-aligned
          .setDepth(10),
      );
    }
    while (this.lines.length > visible.length) {
      this.lines.pop()!.destroy();
    }

    visible.forEach((line, i) => {
      this.lines[i].setText(line);
      this.lines[i].setPosition(RIGHT_X, TOP_Y + i * LINE_H);
    });
  }

  private buildLines(state: GameState): string[] {
    const lines: string[] = [`T:${state.tickCount}`];

    state.troggles.forEach((t, i) => {
      if (t.row === -1) {
        const tl = t.ticksUntilEntry >= 0
          ? String(Math.max(0, t.ticksUntilEntry - state.tickCount))
          : '—';
        const ml = t.playerMovesUntilEntry >= 0
          ? String(Math.max(0, t.playerMovesUntilEntry - state.playerMoveCount))
          : '—';
        lines.push(`T${i}[${t.type.slice(0, 4)}] WAIT ${tl}t/${ml}mv`);
      } else {
        lines.push(`T${i}[${t.type.slice(0, 4)}] @(${t.row},${t.col}) mv:${t.moveTimer}t`);
      }
    });

    return lines;
  }
}
