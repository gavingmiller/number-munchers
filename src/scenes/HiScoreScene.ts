import Phaser from 'phaser';
import { CANVAS_WIDTH, COLOR_CELL } from '../constants';

interface HiScoreData {
  score: number;
}

export class HiScoreScene extends Phaser.Scene {
  private finalScore = 0;

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

    // Play Again button
    const btnW = 280;
    const btnH = 64;
    const btnY = 550;

    const bg = this.add.rectangle(cx, btnY, btnW, btnH, COLOR_CELL)
      .setStrokeStyle(2, 0xffd700)
      .setInteractive({ useHandCursor: true });

    const label = this.add.text(cx, btnY, 'Play Again', {
      fontSize: '30px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
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
      this.scene.start('MainMenu');
    });
  }
}
