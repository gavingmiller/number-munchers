import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

interface GameOverData {
  lives: number;
}

export class GameOverScene extends Phaser.Scene {
  private lives = 0;

  constructor() {
    super({ key: 'GameOver' });
  }

  init(data: GameOverData): void {
    this.lives = data.lives ?? 0;
  }

  create(): void {
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;

    // Semi-transparent dark overlay
    this.add.rectangle(cx, cy, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.8)
      .setDepth(0);

    if (this.lives > 0) {
      // Life lost but still alive -- show countdown
      this.add.text(cx, cy - 60, 'OOPS!', {
        fontSize: '64px',
        fontFamily: 'Arial',
        color: '#ff4444',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(1);

      const countdownText = this.add.text(cx, cy + 40, 'Get Ready...', {
        fontSize: '36px',
        fontFamily: 'Arial',
        color: '#ffffff',
      }).setOrigin(0.5).setDepth(1);

      // Countdown: 3, 2, 1
      this.time.delayedCall(800, () => {
        countdownText.setText('3');
      });

      this.time.delayedCall(1600, () => {
        countdownText.setText('2');
      });

      this.time.delayedCall(2400, () => {
        countdownText.setText('1');
      });

      this.time.delayedCall(3200, () => {
        this.scene.stop();
        this.scene.resume('Game');
      });
    } else {
      // No lives left -- this shouldn't normally be reached since GameScene
      // goes directly to HiScore on 0 lives, but handle as fallback
      this.add.text(cx, cy, 'GAME OVER', {
        fontSize: '56px',
        fontFamily: 'Arial',
        color: '#ff4444',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(1);

      this.time.delayedCall(2000, () => {
        this.scene.stop();
      });
    }
  }
}
