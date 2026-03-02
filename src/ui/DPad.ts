import Phaser from 'phaser';
import type { Direction } from '../types';
import { DPAD_Y, DPAD_BTN_SIZE, CANVAS_WIDTH } from '../constants';

interface DPadButton {
  bg: Phaser.GameObjects.Rectangle;
  label: Phaser.GameObjects.Text;
}

export class DPad {
  private scene: Phaser.Scene;
  private onDirection: (dir: Direction) => void;
  private buttons: DPadButton[] = [];
  private munchBtn?: DPadButton;

  constructor(scene: Phaser.Scene, onDirection: (dir: Direction) => void) {
    this.scene = scene;
    this.onDirection = onDirection;
  }

  create(onMunch: () => void, showMunch = true): void {
    const cx = CANVAS_WIDTH / 2;
    const sz = DPAD_BTN_SIZE;
    const centerY = DPAD_Y + DPAD_BTN_SIZE * 2;

    const btnDefs: { dir: Direction; arrow: string; x: number; y: number }[] = [
      { dir: 'up',    arrow: '\u25B2', x: cx,           y: centerY - sz },
      { dir: 'down',  arrow: '\u25BC', x: cx,           y: centerY + sz },
      { dir: 'left',  arrow: '\u25C4', x: cx - sz,      y: centerY },
      { dir: 'right', arrow: '\u25BA', x: cx + sz,      y: centerY },
    ];

    for (const def of btnDefs) {
      const bg = this.scene.add.rectangle(def.x, def.y, sz - 8, sz - 8, 0x2a2a4a, 0.7)
        .setStrokeStyle(2, 0x444466)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .setDepth(10);

      const label = this.scene.add.text(def.x, def.y, def.arrow, {
        fontSize: '40px',
        fontFamily: 'Arial',
        color: '#cccccc',
      }).setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(11);

      bg.on('pointerdown', () => {
        bg.setFillStyle(0x444466);
        this.onDirection(def.dir);
      });
      bg.on('pointerup', () => {
        bg.setFillStyle(0x2a2a4a, 0.7);
      });
      bg.on('pointerout', () => {
        bg.setFillStyle(0x2a2a4a, 0.7);
      });

      this.buttons.push({ bg, label });
    }

    if (showMunch) {
      // Munch button in center of d-pad
      const munchBg = this.scene.add.rectangle(cx, centerY, sz - 16, sz - 16, 0x3a5a2a, 0.8)
        .setStrokeStyle(2, 0x44cc44)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .setDepth(10);

      const munchLabel = this.scene.add.text(cx, centerY, 'MUNCH', {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: '#44cc44',
        fontStyle: 'bold',
      }).setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(11);

      munchBg.on('pointerdown', () => {
        munchBg.setFillStyle(0x44cc44, 0.5);
        onMunch();
      });
      munchBg.on('pointerup', () => {
        munchBg.setFillStyle(0x3a5a2a, 0.8);
      });
      munchBg.on('pointerout', () => {
        munchBg.setFillStyle(0x3a5a2a, 0.8);
      });

      this.munchBtn = { bg: munchBg, label: munchLabel };
    }
  }

  destroy(): void {
    for (const btn of this.buttons) {
      btn.bg.destroy();
      btn.label.destroy();
    }
    this.buttons = [];
    if (this.munchBtn) {
      this.munchBtn.bg.destroy();
      this.munchBtn.label.destroy();
      this.munchBtn = undefined;
    }
  }
}
