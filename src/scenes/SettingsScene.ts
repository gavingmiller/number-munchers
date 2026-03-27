import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLOR_CELL } from '../constants';
import { getSettings, saveSettings } from '../game/state/Persistence';
import type { ControlStyle } from '../game/state/Persistence';

interface StyleOption {
  label: string;
  style: ControlStyle;
  description: string;
}

const STYLES: StyleOption[] = [
  {
    label: 'Center Controls',
    style: 'center',
    description: 'D-pad centered with munch in middle\nOne-handed play',
  },
  {
    label: 'Two-Handed Controls',
    style: 'two-handed',
    description: 'D-pad on left, munch button on right\nTwo-thumbs play',
  },
];

export class SettingsScene extends Phaser.Scene {
  private currentStyle: ControlStyle = 'center';
  private optionBgs: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super({ key: 'Settings' });
  }

  create(): void {
    const cx = CANVAS_WIDTH / 2;
    this.currentStyle = getSettings().controlStyle;
    this.optionBgs = [];

    // Title
    this.add.text(cx, 80, 'SETTINGS', {
      fontSize: '42px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Controls section
    this.add.text(cx, 160, 'Control Style', {
      fontSize: '26px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const cardW = 320;
    const cardH = 280;
    const gap = 30;
    const totalW = STYLES.length * cardW + (STYLES.length - 1) * gap;
    const startX = (CANVAS_WIDTH - totalW) / 2 + cardW / 2;
    const cardY = 370;

    for (let i = 0; i < STYLES.length; i++) {
      const opt = STYLES[i];
      const x = startX + i * (cardW + gap);
      this.createStyleCard(x, cardY, cardW, cardH, opt);
    }

    // Back button
    const backBg = this.add.rectangle(cx, CANVAS_HEIGHT - 70, 200, 50, 0x1e3a5f)
      .setStrokeStyle(2, 0xffd700)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx, CANVAS_HEIGHT - 70, 'Back', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    backBg.on('pointerdown', () => this.scene.start('MainMenu'));

    if (this.input.keyboard) {
      const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      escKey.on('down', () => this.scene.start('MainMenu'));
    }
  }

  private createStyleCard(
    cx: number, cy: number,
    w: number, h: number,
    opt: StyleOption,
  ): void {
    const isActive = this.currentStyle === opt.style;

    const bg = this.add.rectangle(cx, cy, w, h, COLOR_CELL)
      .setStrokeStyle(isActive ? 4 : 2, isActive ? 0x00ff88 : 0xffd700)
      .setInteractive({ useHandCursor: true });

    this.optionBgs.push(bg);

    // Label
    this.add.text(cx, cy - h / 2 + 30, opt.label, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: isActive ? '#00ff88' : '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Visual preview
    if (opt.style === 'center') {
      this.drawCenterPreview(cx, cy);
    } else {
      this.drawTwoHandedPreview(cx, cy);
    }

    // Description
    this.add.text(cx, cy + h / 2 - 50, opt.description, {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      align: 'center',
    }).setOrigin(0.5);

    // Active indicator
    if (isActive) {
      this.add.text(cx, cy + h / 2 - 18, '\u2714 Active', {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#00ff88',
      }).setOrigin(0.5);
    }

    bg.on('pointerdown', () => {
      this.currentStyle = opt.style;
      saveSettings({ controlStyle: opt.style });
      this.scene.restart();
    });
  }

  private drawCenterPreview(cx: number, cy: number): void {
    const s = 18; // mini button size
    const py = cy - 10;
    // D-pad cross
    this.add.rectangle(cx, py - s, s, s, 0x2a2a4a).setStrokeStyle(1, 0x444466);
    this.add.rectangle(cx, py + s, s, s, 0x2a2a4a).setStrokeStyle(1, 0x444466);
    this.add.rectangle(cx - s, py, s, s, 0x2a2a4a).setStrokeStyle(1, 0x444466);
    this.add.rectangle(cx + s, py, s, s, 0x2a2a4a).setStrokeStyle(1, 0x444466);
    // Munch in center
    this.add.rectangle(cx, py, s - 4, s - 4, 0x3a5a2a).setStrokeStyle(1, 0x44cc44);
    this.add.text(cx, py, 'M', {
      fontSize: '10px',
      fontFamily: 'Arial',
      color: '#44cc44',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }

  private drawTwoHandedPreview(cx: number, cy: number): void {
    const s = 18;
    const py = cy - 10;
    const leftX = cx - 50;
    const rightX = cx + 50;
    // D-pad on left
    this.add.rectangle(leftX, py - s, s, s, 0x2a2a4a).setStrokeStyle(1, 0x444466);
    this.add.rectangle(leftX, py + s, s, s, 0x2a2a4a).setStrokeStyle(1, 0x444466);
    this.add.rectangle(leftX - s, py, s, s, 0x2a2a4a).setStrokeStyle(1, 0x444466);
    this.add.rectangle(leftX + s, py, s, s, 0x2a2a4a).setStrokeStyle(1, 0x444466);
    // Munch on right
    const munchSize = 30;
    this.add.rectangle(rightX, py, munchSize, munchSize, 0x3a5a2a).setStrokeStyle(1, 0x44cc44);
    this.add.text(rightX, py, 'M', {
      fontSize: '14px',
      fontFamily: 'Arial',
      color: '#44cc44',
      fontStyle: 'bold',
    }).setOrigin(0.5);
  }
}
