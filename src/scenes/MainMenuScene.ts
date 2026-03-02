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
  private selectedIndex = 0;
  private btnBgs: Phaser.GameObjects.Rectangle[] = [];
  private btnLabels: Phaser.GameObjects.Text[] = [];
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private moveTimer = 0;
  private readonly MOVE_MS = 200;

  constructor() {
    super({ key: 'MainMenu' });
  }

  create(): void {
    this.selectedIndex = 0;
    this.btnBgs = [];
    this.btnLabels = [];

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

      this.btnBgs.push(bg);
      this.btnLabels.push(label);

      bg.on('pointerover', () => {
        this.selectedIndex = i;
        this.updateHighlight();
      });

      bg.on('pointerdown', () => {
        this.selectedIndex = i;
        this.confirmSelection();
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

    this.btnBgs.push(debugBg);
    this.btnLabels.push(debugLabel);

    debugBg.on('pointerover', () => {
      this.selectedIndex = MODES.length;
      this.updateHighlight();
    });
    debugBg.on('pointerdown', () => {
      this.selectedIndex = MODES.length;
      this.confirmSelection();
    });

    // Footer
    this.add.text(centerX, CANVAS_HEIGHT - 60, 'Use arrows to select, space to confirm', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#888888',
    }).setOrigin(0.5);

    // Keyboard input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    this.updateHighlight();
  }

  update(_time: number, delta: number): void {
    this.moveTimer += delta;
    if (this.moveTimer < this.MOVE_MS) return;

    if (!this.cursors) return;

    const totalItems = MODES.length + 1; // modes + debug

    if (this.cursors.up.isDown) {
      this.moveTimer = 0;
      this.selectedIndex = (this.selectedIndex - 1 + totalItems) % totalItems;
      this.updateHighlight();
    } else if (this.cursors.down.isDown) {
      this.moveTimer = 0;
      this.selectedIndex = (this.selectedIndex + 1) % totalItems;
      this.updateHighlight();
    }

    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.confirmSelection();
    }
  }

  private updateHighlight(): void {
    for (let i = 0; i < this.btnBgs.length; i++) {
      const isDebug = i === MODES.length;
      if (i === this.selectedIndex) {
        this.btnBgs[i].setFillStyle(0x1e3a5f);
        this.btnBgs[i].setStrokeStyle(isDebug ? 1 : 2, 0x00ff88);
        this.btnLabels[i].setColor('#ffd700');
      } else {
        this.btnBgs[i].setFillStyle(isDebug ? 0x1a1a1a : COLOR_CELL);
        this.btnBgs[i].setStrokeStyle(isDebug ? 1 : 2, isDebug ? 0x555555 : 0xffd700);
        this.btnLabels[i].setColor(isDebug ? '#555555' : '#ffffff');
      }
    }
  }

  private confirmSelection(): void {
    if (this.selectedIndex < MODES.length) {
      this.scene.start('CharacterSelect', { mode: MODES[this.selectedIndex].mode });
    } else {
      this.scene.start('Debug');
    }
  }
}
