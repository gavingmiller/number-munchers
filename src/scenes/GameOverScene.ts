import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

interface GameOverData {
  lives: number;
  explanation?: string;
  caughtBy?: string;
}

export class GameOverScene extends Phaser.Scene {
  private lives = 0;
  private explanation?: string;
  private caughtBy?: string;

  constructor() {
    super({ key: 'GameOver' });
  }

  init(data: GameOverData): void {
    this.lives = data.lives ?? 0;
    this.explanation = data.explanation;
    this.caughtBy = data.caughtBy;
  }

  create(): void {
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;

    // Semi-transparent dark overlay
    this.add.rectangle(cx, cy, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.8)
      .setDepth(0);

    if (this.lives > 0 && this.explanation) {
      // Wrong munch — show explanation, require interaction to continue
      this.add.text(cx, cy - 80, 'OOPS!', {
        fontSize: '64px',
        fontFamily: 'Arial',
        color: '#ff4444',
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(1);

      this.add.text(cx, cy + 10, this.explanation, {
        fontSize: '26px',
        fontFamily: 'Arial',
        color: '#ffffff',
        align: 'center',
        wordWrap: { width: CANVAS_WIDTH - 80 },
      }).setOrigin(0.5).setDepth(1);

      const prompt = this.add.text(cx, cy + 80, 'Tap to continue', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#aaaaaa',
      }).setOrigin(0.5).setDepth(1);

      this.tweens.add({
        targets: prompt,
        alpha: { from: 1, to: 0.3 },
        duration: 700,
        yoyo: true,
        repeat: -1,
      });

      // Brief delay to prevent accidental skip
      this.time.delayedCall(400, () => {
        if (this.input.keyboard) {
          this.input.keyboard.once('keydown', () => this.resume());
        }
        this.input.once('pointerdown', () => this.resume());
      });
    } else if (this.lives > 0) {
      // Troggle hit — show which troggle caught the player
      const heading = this.caughtBy
        ? `${this.caughtBy} caught you!`
        : 'A Troggle caught you!';

      this.add.text(cx, cy - 60, heading, {
        fontSize: '40px',
        fontFamily: 'Arial',
        color: '#ff4444',
        fontStyle: 'bold',
        align: 'center',
        wordWrap: { width: CANVAS_WIDTH - 80 },
      }).setOrigin(0.5).setDepth(1);

      const prompt = this.add.text(cx, cy + 40, 'Tap to continue', {
        fontSize: '20px',
        fontFamily: 'Arial',
        color: '#aaaaaa',
      }).setOrigin(0.5).setDepth(1);

      this.tweens.add({
        targets: prompt,
        alpha: { from: 1, to: 0.3 },
        duration: 700,
        yoyo: true,
        repeat: -1,
      });

      // Brief delay to prevent accidental skip
      this.time.delayedCall(400, () => {
        if (this.input.keyboard) {
          this.input.keyboard.once('keydown', () => this.resume());
        }
        this.input.once('pointerdown', () => this.resume());
      });
    } else {
      // No lives left — fallback
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

  private resume(): void {
    this.scene.stop();
    this.scene.resume('Game');
  }
}
