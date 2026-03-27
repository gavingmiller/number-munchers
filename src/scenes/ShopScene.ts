import Phaser from 'phaser';
import type { CharacterType } from '../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLOR_CELL } from '../constants';
import { drawCharacter } from '../ui/CharacterSprites';
import {
  CHARACTER_PRICES,
  CHARACTER_UNLOCK_ORDER,
  isCharacterUnlocked,
  unlockCharacter,
  getAvailableStars,
  formatStars,
} from '../game/state/Persistence';

const CHAR_LABELS: Record<CharacterType, string> = {
  claude: 'Claude',
  box: 'Box',
  axolotl: 'Axolotl',
  electricmouse: 'Elec Mouse',
  marshmallow: 'Marshmallow',
  robot: 'Robot',
  nyancat: 'Nyan Cat',
  pusheen: 'Pusheen',
  mrpickle: 'Mr Pickle',
};

const GRID_COLS = 3;

export class ShopScene extends Phaser.Scene {
  private starsTxt!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'Shop' });
  }

  create(): void {
    const cx = CANVAS_WIDTH / 2;

    // Title
    this.add.text(cx, 50, 'STAR SHOP', {
      fontSize: '42px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Star balance
    this.starsTxt = this.add.text(cx, 95, `\u2B50 ${formatStars(getAvailableStars())} stars available`, {
      fontSize: '22px',
      fontFamily: 'Arial',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Characters section header
    this.add.text(40, 135, 'Characters', {
      fontSize: '26px',
      fontFamily: 'Arial',
      color: '#00ff88',
      fontStyle: 'bold',
    });

    // Character grid
    const cardW = 200;
    const cardH = 170;
    const gapX = 20;
    const gapY = 14;
    const totalW = GRID_COLS * cardW + (GRID_COLS - 1) * gapX;
    const startX = (CANVAS_WIDTH - totalW) / 2 + cardW / 2;
    const startY = 250;

    for (let idx = 0; idx < CHARACTER_UNLOCK_ORDER.length; idx++) {
      const character = CHARACTER_UNLOCK_ORDER[idx];
      const r = Math.floor(idx / GRID_COLS);
      const c = idx % GRID_COLS;
      const x = startX + c * (cardW + gapX);
      const y = startY + r * (cardH + gapY);
      this.createShopCard(x, y, cardW, cardH, character);
    }

    // Placeholder sections
    const placeholderY = startY + Math.ceil(CHARACTER_UNLOCK_ORDER.length / GRID_COLS) * (cardH + gapY) + 20;
    this.add.text(40, placeholderY, 'Themes — Coming Soon', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#666666',
      fontStyle: 'italic',
    });
    this.add.text(40, placeholderY + 32, 'Music — Coming Soon', {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#666666',
      fontStyle: 'italic',
    });

    // Back button
    const backBg = this.add.rectangle(cx, CANVAS_HEIGHT - 70, 200, 50, 0x1e3a5f)
      .setStrokeStyle(2, 0xffd700)
      .setInteractive({ useHandCursor: true });
    this.add.text(cx, CANVAS_HEIGHT - 70, 'Back', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    backBg.on('pointerdown', () => {
      this.scene.start('MainMenu');
    });

    if (this.input.keyboard) {
      const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
      escKey.on('down', () => this.scene.start('MainMenu'));
    }
  }

  private createShopCard(
    cx: number, cy: number,
    w: number, h: number,
    character: CharacterType,
  ): void {
    const unlocked = isCharacterUnlocked(character);
    const price = CHARACTER_PRICES[character];
    const canAfford = getAvailableStars() >= price;

    const bg = this.add.rectangle(cx, cy, w, h, COLOR_CELL)
      .setStrokeStyle(2, unlocked ? 0x00ff88 : 0xffd700)
      .setInteractive({ useHandCursor: !unlocked && canAfford });

    // Name — hidden for locked characters
    this.add.text(cx, cy - h / 2 + 20, unlocked ? CHAR_LABELS[character] : '???', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    if (unlocked) {
      // Character sprite — only shown when unlocked
      const container = this.add.container(cx, cy + 5);
      drawCharacter(this, container, character, 3);
    } else {
      // Silhouette placeholder for locked characters
      this.add.rectangle(cx, cy + 5, 30, 36, 0x222222).setStrokeStyle(1, 0x444444);
      this.add.text(cx, cy + 5, '?', {
        fontSize: '28px',
        fontFamily: 'Arial',
        color: '#555555',
        fontStyle: 'bold',
      }).setOrigin(0.5);
    }

    if (unlocked) {
      // Checkmark
      this.add.text(cx, cy + h / 2 - 22, '\u2714 Unlocked', {
        fontSize: '16px',
        fontFamily: 'Arial',
        color: '#00ff88',
      }).setOrigin(0.5);
    } else {
      // Dim overlay
      this.add.rectangle(cx, cy, w, h, 0x000000, 0.4).setDepth(1);
      // Price
      const priceColor = canAfford ? '#ffd700' : '#ff4444';
      this.add.text(cx, cy + h / 2 - 22, `\u2B50 ${formatStars(price)}`, {
        fontSize: '18px',
        fontFamily: 'Arial',
        color: priceColor,
        fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(2);

      if (canAfford) {
        bg.on('pointerdown', () => {
          const success = unlockCharacter(character);
          if (success) {
            this.scene.restart(); // refresh the shop
          }
        });
      }
    }
  }
}
