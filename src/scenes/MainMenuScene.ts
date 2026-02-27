import Phaser from 'phaser';
import type { GameMode } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLOR_CELL } from '../constants';

interface ModeOption {
  label: string;
  mode: GameMode;
}

const MODES: ModeOption[] = [
  { label: 'Multiples', mode: 'multiples' },
  { label: 'Factors', mode: 'factors' },
  { label: 'Prime Numbers', mode: 'primes' },
  { label: 'Equalities', mode: 'equalities' },
];

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenu' });
  }

  create(): void {
    const centerX = CANVAS_WIDTH / 2;

    // Title
    this.add.text(centerX, 180, 'NUMBER\nMUNCHERS', {
      fontSize: '72px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, 310, 'Choose a game mode', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    // Mode buttons
    const btnW = 360;
    const btnH = 64;
    const startY = 400;
    const gap = 80;

    for (let i = 0; i < MODES.length; i++) {
      const opt = MODES[i];
      const y = startY + i * gap;

      const bg = this.add.rectangle(centerX, y, btnW, btnH, COLOR_CELL)
        .setStrokeStyle(2, 0xffd700)
        .setInteractive({ useHandCursor: true });

      const label = this.add.text(centerX, y, opt.label, {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#ffffff',
        align: 'center',
      }).setOrigin(0.5);

      bg.on('pointerover', () => {
        bg.setFillStyle(0x1e3a5f);
        label.setColor('#ffd700');
      });

      bg.on('pointerout', () => {
        bg.setFillStyle(COLOR_CELL);
        label.setColor('#ffffff');
      });

      bg.on('pointerdown', () => {
        this.scene.start('Game', { mode: opt.mode });
      });
    }

    // Debug button
    const debugY = startY + MODES.length * gap + 20;
    const debugBg = this.add.rectangle(centerX, debugY, btnW, btnH * 0.75, 0x1a1a1a)
      .setStrokeStyle(1, 0x555555)
      .setInteractive({ useHandCursor: true });
    const debugLabel = this.add.text(centerX, debugY, 'Debug Mode', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#555555',
    }).setOrigin(0.5);
    debugBg.on('pointerover', () => { debugBg.setStrokeStyle(1, 0xff4444); debugLabel.setColor('#ff4444'); });
    debugBg.on('pointerout',  () => { debugBg.setStrokeStyle(1, 0x555555); debugLabel.setColor('#555555'); });
    debugBg.on('pointerdown', () => { this.scene.start('Debug'); });

    // Footer
    this.add.text(centerX, CANVAS_HEIGHT - 60, 'Tap a mode to begin', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#888888',
    }).setOrigin(0.5);
  }
}
