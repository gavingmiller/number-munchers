import Phaser from 'phaser';
import type { GameState } from '../types';
import { RULE_BANNER_Y, RULE_BANNER_H, CANVAS_WIDTH, COLOR_RULE_TEXT } from '../constants';

export class RuleBanner {
  private scene: Phaser.Scene;
  private ruleTxt!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  create(state: GameState): void {
    // Background
    this.scene.add.rectangle(CANVAS_WIDTH / 2, RULE_BANNER_Y + RULE_BANNER_H / 2, CANVAS_WIDTH, RULE_BANNER_H, 0x0d1117)
      .setScrollFactor(0)
      .setDepth(8);

    // Rule text
    this.ruleTxt = this.scene.add.text(
      CANVAS_WIDTH / 2,
      RULE_BANNER_Y + RULE_BANNER_H / 2,
      state.rule.description,
      {
        fontSize: '32px',
        fontFamily: 'Arial',
        color: COLOR_RULE_TEXT,
        fontStyle: 'bold',
        align: 'center',
      },
    ).setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(9);
  }

  update(state: GameState): void {
    this.ruleTxt.setText(state.rule.description);
  }
}
