import Phaser from 'phaser';
import { CANVAS_WIDTH } from '../constants';
import { getAvailableStars } from '../game/state/Persistence';

interface HiScoreData {
  starsEarned: number;
}

export class HiScoreScene extends Phaser.Scene {
  private starsEarned = 0;
  private spaceKey?: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'HiScore' });
  }

  init(data: HiScoreData): void {
    this.starsEarned = data.starsEarned ?? 0;
  }

  create(): void {
    const cx = CANVAS_WIDTH / 2;

    // Header
    this.add.text(cx, 180, 'GAME OVER', {
      fontSize: '64px',
      fontFamily: 'Arial',
      color: '#ff4444',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Stars earned this game
    this.add.text(cx, 300, `\u2B50 ${this.starsEarned} stars earned!`, {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Total star balance
    const totalAvailable = getAvailableStars();
    this.add.text(cx, 370, `Total stars: ${totalAvailable}`, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    // Encouragement
    let message = 'Keep trying!';
    if (this.starsEarned >= 50) message = 'Incredible munching!';
    else if (this.starsEarned >= 30) message = 'Great job, number muncher!';
    else if (this.starsEarned >= 15) message = 'Not bad at all!';

    this.add.text(cx, 430, message, {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Play Again button
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
