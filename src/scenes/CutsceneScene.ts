import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

const TROGGLE_FACTS = [
  'Troggles love to munch numbers too, but they are not very good at it.',
  'A wild Smartie can actually solve simple equations!',
  'Reggies always walk in straight lines. Not very creative.',
  'Bashful Troggles run away if you look at them... sometimes.',
  'Worker Troggles are the most dedicated. They never stop patrolling.',
  'Troggles have been munching numbers since 1990!',
  'The Troggle king lives deep inside the number grid.',
  'Some say Troggles dream of prime numbers.',
];

interface CutsceneData {
  level: number;
  onComplete?: () => void;
}

export class CutsceneScene extends Phaser.Scene {
  private level = 0;
  private onComplete?: () => void;

  constructor() {
    super({ key: 'Cutscene' });
  }

  init(data: CutsceneData): void {
    this.level = data.level ?? 1;
    this.onComplete = data.onComplete;
  }

  create(): void {
    const cx = CANVAS_WIDTH / 2;
    const cy = CANVAS_HEIGHT / 2;

    // Semi-transparent overlay
    this.add.rectangle(cx, cy, CANVAS_WIDTH, CANVAS_HEIGHT, 0x000000, 0.85)
      .setDepth(0);

    // Congratulations text
    this.add.text(cx, cy - 100, 'You ate all\nthe numbers!', {
      fontSize: '48px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold',
      align: 'center',
    }).setOrigin(0.5).setDepth(1);

    // Level info
    this.add.text(cx, cy, `Level ${this.level} Complete`, {
      fontSize: '28px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5).setDepth(1);

    // Fun troggle fact
    const factIndex = (this.level - 1) % TROGGLE_FACTS.length;
    const factText = this.add.text(cx, cy + 80, TROGGLE_FACTS[factIndex], {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
      align: 'center',
      wordWrap: { width: CANVAS_WIDTH - 80 },
    }).setOrigin(0.5).setDepth(1);

    // Subtle animation on the fact text
    this.tweens.add({
      targets: factText,
      alpha: { from: 0, to: 1 },
      duration: 800,
      ease: 'Power2',
    });

    // After 3 seconds, stop self and resume game
    this.time.delayedCall(3000, () => {
      this.scene.stop();
      if (this.onComplete) {
        this.onComplete();
      } else {
        this.scene.resume('Game');
      }
    });
  }
}
