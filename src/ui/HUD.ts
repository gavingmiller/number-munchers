import Phaser from 'phaser';
import type { GameState } from '../types';
import { HUD_Y, HUD_H, CANVAS_WIDTH, COLOR_HUD_TEXT } from '../constants';

export class HUD {
  private scene: Phaser.Scene;
  private scoreTxt!: Phaser.GameObjects.Text;
  private livesTxt?: Phaser.GameObjects.Text;
  private levelTxt!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(state: GameState, showLives = true): void {
    // Background bar
    this.scene.add.rectangle(CANVAS_WIDTH / 2, HUD_Y + HUD_H / 2, CANVAS_WIDTH, HUD_H, 0x0d1117)
      .setScrollFactor(0)
      .setDepth(8);

    // Stars on left
    this.scoreTxt = this.scene.add.text(20, HUD_Y + HUD_H / 2, `\u2B50 ${state.starsEarned}`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: COLOR_HUD_TEXT,
    }).setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(9);

    // Level in center
    this.levelTxt = this.scene.add.text(CANVAS_WIDTH / 2, HUD_Y + HUD_H / 2, `Lv ${state.level}`, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
    }).setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(9);

    // Lives on right (omitted in debug mode)
    if (showLives) {
      const hearts = this.heartsString(state.lives);
      this.livesTxt = this.scene.add.text(CANVAS_WIDTH - 20, HUD_Y + HUD_H / 2, hearts, {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#ff4444',
      }).setOrigin(1, 0.5)
        .setScrollFactor(0)
        .setDepth(9);
    }
  }

  update(state: GameState): void {
    this.scoreTxt.setText(`\u2B50 ${state.starsEarned}`);
    this.levelTxt.setText(`Lv ${state.level}`);
    this.livesTxt?.setText(this.heartsString(state.lives));
  }

  private formatScore(n: number): string {
    return n.toLocaleString('en-US');
  }

  private heartsString(lives: number): string {
    const filled = Math.max(0, lives);
    return Array.from({ length: filled }, () => '\u2665').join(' ');
  }
}
