import Phaser from 'phaser';
import type { GameMode, GradeLevel } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLOR_CELL } from '../constants';
import { getModesForGrade, MODE_LABELS, GRADE_CONFIG } from '../game/logic/GradeConfig';

interface ModeOption {
  label: string;
  mode: GameMode;
}

interface MainMenuData {
  grade?: GradeLevel;
}

export class MainMenuScene extends Phaser.Scene {
  private selectedIndex = 0;
  private modes: ModeOption[] = [];
  private grade: GradeLevel = 4;
  private btnBgs: Phaser.GameObjects.Rectangle[] = [];
  private btnLabels: Phaser.GameObjects.Text[] = [];
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private moveTimer = 0;
  private readonly MOVE_MS = 200;

  constructor() {
    super({ key: 'MainMenu' });
  }

  init(data: MainMenuData): void {
    this.grade = data.grade ?? ((Number(localStorage.getItem('numberMunchers_grade')) || 4) as GradeLevel);
    this.modes = getModesForGrade(this.grade).map((mode) => ({
      label: MODE_LABELS[mode],
      mode,
    }));
  }

  create(): void {
    this.selectedIndex = 0;
    this.btnBgs = [];
    this.btnLabels = [];

    const centerX = CANVAS_WIDTH / 2;

    // Title
    this.add.text(centerX, 140, 'NUMBER\nMUNCHERS', {
      fontSize: '72px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // Grade indicator + subtitle
    this.add.text(centerX, 280, `${GRADE_CONFIG[this.grade].label} — Choose a game mode`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    // Mode buttons
    const btnW = 360;
    const btnH = 64;
    const startY = 370;
    const gap = 80;

    for (let i = 0; i < this.modes.length; i++) {
      const opt = this.modes[i];
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

    // Change Grade button
    const changeGradeY = startY + this.modes.length * gap + 10;
    const changeGradeBg = this.add.rectangle(centerX, changeGradeY, btnW, btnH * 0.75, 0x1a1a1a)
      .setStrokeStyle(1, 0xffd700)
      .setInteractive({ useHandCursor: true });
    const changeGradeLabel = this.add.text(centerX, changeGradeY, 'Change Grade', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    this.btnBgs.push(changeGradeBg);
    this.btnLabels.push(changeGradeLabel);

    const changeGradeIdx = this.modes.length;
    changeGradeBg.on('pointerover', () => {
      this.selectedIndex = changeGradeIdx;
      this.updateHighlight();
    });
    changeGradeBg.on('pointerdown', () => {
      this.selectedIndex = changeGradeIdx;
      this.confirmSelection();
    });

    // Debug button
    const debugY = changeGradeY + gap * 0.75;
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

    const debugIdx = this.modes.length + 1;
    debugBg.on('pointerover', () => {
      this.selectedIndex = debugIdx;
      this.updateHighlight();
    });
    debugBg.on('pointerdown', () => {
      this.selectedIndex = debugIdx;
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

    const totalItems = this.modes.length + 2; // modes + change grade + debug

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
    const changeGradeIdx = this.modes.length;
    const debugIdx = this.modes.length + 1;

    for (let i = 0; i < this.btnBgs.length; i++) {
      const isSpecial = i >= changeGradeIdx;
      const isDebug = i === debugIdx;
      if (i === this.selectedIndex) {
        this.btnBgs[i].setFillStyle(0x1e3a5f);
        this.btnBgs[i].setStrokeStyle(isDebug ? 1 : 2, 0x00ff88);
        this.btnLabels[i].setColor('#ffd700');
      } else {
        this.btnBgs[i].setFillStyle(isSpecial ? 0x1a1a1a : COLOR_CELL);
        this.btnBgs[i].setStrokeStyle(isDebug ? 1 : 2, isDebug ? 0x555555 : 0xffd700);
        this.btnLabels[i].setColor(isSpecial ? (isDebug ? '#555555' : '#aaaaaa') : '#ffffff');
      }
    }
  }

  private confirmSelection(): void {
    const changeGradeIdx = this.modes.length;

    if (this.selectedIndex < changeGradeIdx) {
      this.scene.start('CharacterSelect', { mode: this.modes[this.selectedIndex].mode, grade: this.grade });
    } else if (this.selectedIndex === changeGradeIdx) {
      this.scene.start('GradeSelect');
    } else {
      this.scene.start('Debug');
    }
  }
}
