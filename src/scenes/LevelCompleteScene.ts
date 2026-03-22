import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

interface LevelCompleteData {
  level: number;
  onComplete: () => void;
}

export class LevelCompleteScene extends Phaser.Scene {
  private level = 0;
  private onComplete?: () => void;

  constructor() {
    super({ key: 'LevelComplete' });
  }

  init(data: LevelCompleteData): void {
    this.level = data.level ?? 1;
    this.onComplete = data.onComplete;
  }

  create(): void {
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;

    // Semi-transparent overlay
    this.add.rectangle(cx, cy, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.85)
      .setDepth(0);

    // Level complete heading
    this.add.text(cx, cy - 60, `Level ${this.level}\nComplete!`, {
      fontSize: '56px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5).setDepth(1);

    // Prompt
    const prompt = this.add.text(cx, cy + 60, 'Tap to continue', {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
    }).setOrigin(0.5).setDepth(1);

    // Blink the prompt
    this.tweens.add({
      targets: prompt,
      alpha: { from: 1, to: 0.3 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    // Wait a brief moment before accepting input (prevent accidental skip)
    this.time.delayedCall(400, () => {
      // Keyboard
      if (this.input.keyboard) {
        this.input.keyboard.once('keydown', () => this.proceed());
      }

      // Pointer (mouse/touch)
      this.input.once('pointerdown', () => this.proceed());
    });
  }

  private proceed(): void {
    this.scene.stop();
    if (this.onComplete) {
      this.onComplete();
    }
  }
}
