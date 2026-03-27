import Phaser from 'phaser';
import type { GameMode, GradeLevel, CharacterType } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLOR_CELL } from '../constants';
import { drawCharacter } from '../ui/CharacterSprites';
import { isCharacterUnlocked } from '../game/state/Persistence';

interface CharSelectData {
  mode: GameMode;
  grade?: GradeLevel;
}

interface CharOption {
  label: string;
  type: CharacterType;
}

const CHARACTERS: CharOption[] = [
  { label: 'Claude', type: 'claude' },
  { label: 'Box', type: 'box' },
  { label: 'Axie', type: 'axolotl' },
  { label: 'Elec Mouse', type: 'electricmouse' },
  { label: 'Marshmallow', type: 'marshmallow' },
  { label: 'Bender', type: 'robot' },
  { label: 'Poptart', type: 'nyancat' },
  { label: 'Pusheen', type: 'pusheen' },
  { label: 'Mr Pickle', type: 'mrpickle' },
];

const GRID_COLS = 3;

export class CharacterSelectScene extends Phaser.Scene {
  private selectedMode!: GameMode;
  private selectedGrade!: GradeLevel;
  private selectedIndex = 0;
  private cardBgs: Phaser.GameObjects.Rectangle[] = [];
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private spaceKey?: Phaser.Input.Keyboard.Key;
  private moveTimer = 0;
  private readonly MOVE_MS = 200;
  private available: CharOption[] = [];

  constructor() {
    super({ key: 'CharacterSelect' });
  }

  init(data: CharSelectData): void {
    this.selectedMode = data.mode ?? 'multiples';
    this.selectedGrade = data.grade ?? ((Number(localStorage.getItem('numberMunchers_grade')) || 4) as GradeLevel);
    this.selectedIndex = 0;
    this.cardBgs = [];
    this.available = CHARACTERS.filter(c => isCharacterUnlocked(c.type));
  }

  create(): void {
    const centerX = CANVAS_WIDTH / 2;

    // Title
    this.add.text(centerX, 120, 'CHOOSE YOUR\nCHARACTER', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // Dynamic grid layout
    const cardW = 220;
    const cardH = 190;
    const gapX = 20;
    const gapY = 16;
    const totalW = GRID_COLS * cardW + (GRID_COLS - 1) * gapX;
    const startX = (CANVAS_WIDTH - totalW) / 2 + cardW / 2;
    const startY = 290;

    for (let idx = 0; idx < this.available.length; idx++) {
      const r = Math.floor(idx / GRID_COLS);
      const c = idx % GRID_COLS;
      const x = startX + c * (cardW + gapX);
      const y = startY + r * (cardH + gapY);
      const opt = this.available[idx];
      this.createCharacterCard(idx, x, y, cardW, cardH, opt.label, opt.type);
    }

    // Back button
    const backBg = this.add.rectangle(centerX, CANVAS_HEIGHT - 70, 200, 50, 0x1e3a5f)
      .setStrokeStyle(2, 0xffd700)
      .setInteractive({ useHandCursor: true });
    this.add.text(centerX, CANVAS_HEIGHT - 70, 'Back', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    backBg.on('pointerdown', () => this.scene.start('MainMenu'));

    // Keyboard input
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
      const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      escKey.on('down', () => this.scene.start('MainMenu'));
    }

    // Set initial highlight
    this.updateHighlight();
  }

  update(_time: number, delta: number): void {
    this.moveTimer += delta;
    if (this.moveTimer < this.MOVE_MS) return;

    const dir = this.readDirection();
    if (dir) {
      this.moveTimer = 0;
      const oldIndex = this.selectedIndex;
      const row = Math.floor(this.selectedIndex / GRID_COLS);
      const col = this.selectedIndex % GRID_COLS;
      const totalRows = Math.ceil(this.available.length / GRID_COLS);

      switch (dir) {
        case 'left':
          this.selectedIndex = col > 0 ? this.selectedIndex - 1 : this.selectedIndex;
          break;
        case 'right':
          if (col < GRID_COLS - 1 && this.selectedIndex + 1 < this.available.length) {
            this.selectedIndex++;
          }
          break;
        case 'up':
          if (row > 0) this.selectedIndex -= GRID_COLS;
          break;
        case 'down':
          if (row < totalRows - 1) {
            const next = this.selectedIndex + GRID_COLS;
            if (next < this.available.length) this.selectedIndex = next;
          }
          break;
      }

      if (this.selectedIndex !== oldIndex) {
        this.updateHighlight();
      }
    }

    // Space to confirm
    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.confirmSelection();
    }
  }

  private readDirection(): string | null {
    if (!this.cursors) return null;
    if (this.cursors.left.isDown) return 'left';
    if (this.cursors.right.isDown) return 'right';
    if (this.cursors.up.isDown) return 'up';
    if (this.cursors.down.isDown) return 'down';
    return null;
  }

  private updateHighlight(): void {
    for (let i = 0; i < this.cardBgs.length; i++) {
      if (i === this.selectedIndex) {
        this.cardBgs[i].setStrokeStyle(4, 0x00ff88);
        this.cardBgs[i].setFillStyle(0x1e3a5f);
      } else {
        this.cardBgs[i].setStrokeStyle(2, 0xffd700);
        this.cardBgs[i].setFillStyle(COLOR_CELL);
      }
    }
  }

  private confirmSelection(): void {
    const character = this.available[this.selectedIndex].type;
    this.scene.start('Game', { mode: this.selectedMode, character, grade: this.selectedGrade });
  }

  private createCharacterCard(
    index: number,
    cx: number, cy: number,
    w: number, h: number,
    label: string,
    character: CharacterType,
  ): void {
    const bg = this.add.rectangle(cx, cy, w, h, COLOR_CELL)
      .setStrokeStyle(2, 0xffd700)
      .setInteractive({ useHandCursor: true });

    this.cardBgs[index] = bg;

    // Character name
    this.add.text(cx, cy - h / 2 + 24, label, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5);

    // Character preview sprite
    const container = this.add.container(cx, cy + 15);
    drawCharacter(this, container, character, 4);

    bg.on('pointerover', () => {
      this.selectedIndex = index;
      this.updateHighlight();
    });

    bg.on('pointerout', () => {
      this.updateHighlight();
    });

    bg.on('pointerdown', () => {
      this.selectedIndex = index;
      this.confirmSelection();
    });
  }
}
