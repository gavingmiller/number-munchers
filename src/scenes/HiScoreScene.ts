import Phaser from 'phaser';
import { CANVAS_WIDTH, COLOR_CELL } from '../constants';

interface HiScoreData {
  score: number;
}

export class HiScoreScene extends Phaser.Scene {
  private finalScore = 0;
  private spaceKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'HiScore' });
  }

  init(data: HiScoreData): void {
    this.finalScore = data.score ?? 0;
  }

  create(): void {
    const cx = CANVAS_WIDTH / 2;

    // Header
    this.add.text(cx, 200, 'GAME OVER', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ff4444',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Score display
    this.add.text(cx, 340, `Score: ${this.finalScore}`, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Encouragement
    let message = 'Better luck next time!';
    if (this.finalScore >= 5000) message = 'Incredible munching!';
    else if (this.finalScore >= 2000) message = 'Great job, number muncher!';
    else if (this.finalScore >= 500) message = 'Not bad at all!';

    this.add.text(cx, 420, message, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Play Again button — highlighted by default
    const btnW = 280;
    const btnH = 64;
    const btnY = 550;

    const bg = this.add.rectangle(cx, btnY, btnW, btnH, 0x1e3a5f)
      .setStrokeStyle(2, 0x00ff88)
      .setInteractive({ useHandCursor: true });

    this.add.text(cx, btnY, 'Play Again', {
      fontSize: '30px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    bg.on('pointerdown', () => {
      this.scene.start('MainMenu');
    });

    // Footer
    this.add.text(cx, btnY + 60, 'Press space to continue', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#888888',
    }).setOrigin(0.5);

    // Keyboard
    if (this.input.keyboard) {
      this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
  }

  update(): void {
    if (this.spaceKey && Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.scene.start('MainMenu');
    }
  }
}
