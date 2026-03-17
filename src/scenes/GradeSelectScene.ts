import Phaser from 'phaser';
import type { GradeLevel } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLOR_CELL } from '../constants';

interface GradeOption {
  grade: GradeLevel;
  label: string;
  hint: string;
}

const GRADES: GradeOption[] = [
  { grade: 1, label: 'Grade 1', hint: 'Sums & Missing Addends (to 20)' },
  { grade: 2, label: 'Grade 2', hint: 'Sums, Missing Addends & Even/Odd' },
  { grade: 3, label: 'Grade 3', hint: 'Multiples, Equalities & More' },
  { grade: 4, label: 'Grade 4', hint: 'Factors, Primes & Equalities' },
  { grade: 5, label: 'Grade 5', hint: 'Advanced (numbers to 200)' },
];

export class GradeSelectScene extends Phaser.Scene {
  private selectedIndex = 0;
  private btnBgs: Phaser.GameObjects.Rectangle[] = [];
  private btnLabels: Phaser.GameObjects.Text[] = [];
  private btnHints: Phaser.GameObjects.Text[] = [];
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private moveTimer = 0;
  private readonly MOVE_MS = 200;

  constructor() {
    super({ key: 'GradeSelect' });
  }

  create(): void {
    this.selectedIndex = 0;
    this.btnBgs = [];
    this.btnLabels = [];
    this.btnHints = [];

    const centerX = CANVAS_WIDTH / 2;

    // Title
    this.add.text(centerX, 140, 'NUMBER\nMUNCHERS', {
      fontSize: '72px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(centerX, 280, 'Choose your grade level', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5);

    // Grade buttons
    const btnW = 480;
    const btnH = 80;
    const startY = 370;
    const gap = 95;

    for (let i = 0; i < GRADES.length; i++) {
      const opt = GRADES[i];
      const y = startY + i * gap;

      const bg = this.add.rectangle(centerX, y, btnW, btnH, COLOR_CELL)
        .setStrokeStyle(2, 0xffd700)
        .setInteractive({ useHandCursor: true });

      const label = this.add.text(centerX, y - 12, opt.label, {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#ffffff',
        fontStyle: 'bold',
        align: 'center',
      }).setOrigin(0.5);

      const hint = this.add.text(centerX, y + 18, opt.hint, {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#888888',
        align: 'center',
      }).setOrigin(0.5);

      this.btnBgs.push(bg);
      this.btnLabels.push(label);
      this.btnHints.push(hint);

      bg.on('pointerover', () => {
        this.selectedIndex = i;
        this.updateHighlight();
      });

      bg.on('pointerdown', () => {
        this.selectedIndex = i;
        this.confirmSelection();
      });
    }

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

    if (this.cursors.up.isDown) {
      this.moveTimer = 0;
      this.selectedIndex = (this.selectedIndex - 1 + GRADES.length) % GRADES.length;
      this.updateHighlight();
    } else if (this.cursors.down.isDown) {
      this.moveTimer = 0;
      this.selectedIndex = (this.selectedIndex + 1) % GRADES.length;
      this.updateHighlight();
    }

    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.confirmSelection();
    }
  }

  private updateHighlight(): void {
    for (let i = 0; i < this.btnBgs.length; i++) {
      if (i === this.selectedIndex) {
        this.btnBgs[i].setFillStyle(0x1e3a5f);
        this.btnBgs[i].setStrokeStyle(2, 0x00ff88);
        this.btnLabels[i].setColor('#ffd700');
        this.btnHints[i].setColor('#aaaaaa');
      } else {
        this.btnBgs[i].setFillStyle(COLOR_CELL);
        this.btnBgs[i].setStrokeStyle(2, 0xffd700);
        this.btnLabels[i].setColor('#ffffff');
        this.btnHints[i].setColor('#888888');
      }
    }
  }

  private confirmSelection(): void {
    const grade = GRADES[this.selectedIndex].grade;
    localStorage.setItem('numberMunchers_grade', String(grade));
    this.scene.start('MainMenu', { grade });
  }
}
