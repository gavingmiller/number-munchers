import Phaser from 'phaser';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLOR_CELL } from '../constants';
import { drawCharacter } from '../ui/CharacterSprites';
import { getRecentGames } from '../game/state/Persistence';
import { MODE_LABELS } from '../game/logic/GradeConfig';
import type { GameRecord } from '../game/state/Persistence';

export class HistoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'History' });
  }

  create(): void {
    const cx = CANVAS_WIDTH / 2;
    const games = getRecentGames(10);

    // Title
    this.add.text(cx, 40, 'GAME HISTORY', {
      fontSize: '36px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    if (games.length === 0) {
      this.add.text(cx, CANVAS_HEIGHT / 2, 'No games played yet!\nGo play some math!', {
        fontSize: '24px',
        fontFamily: 'Arial',
        color: '#aaaaaa',
        align: 'center',
      }).setOrigin(0.5);
    } else {
      // Show games newest first
      const reversed = [...games].reverse();
      const rowH = 68;
      const startY = 90;

      for (let i = 0; i < reversed.length; i++) {
        this.createHistoryRow(reversed[i], startY + i * rowH, i);
      }
    }

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

  private createHistoryRow(game: GameRecord, y: number, _index: number): void {
    const rowW = CANVAS_WIDTH - 40;
    const rowX = CANVAS_WIDTH / 2;

    // Row background
    this.add.rectangle(rowX, y + 25, rowW, 60, COLOR_CELL, 0.8)
      .setStrokeStyle(1, 0x333333);

    // Character icon (small)
    const charContainer = this.add.container(50, y + 25);
    drawCharacter(this, charContainer, game.character, 2);

    // Mode & Grade
    const modeLabel = MODE_LABELS[game.mode] ?? game.mode;
    this.add.text(90, y + 10, `Grade ${game.grade} ${modeLabel}`, {
      fontSize: '16px',
      fontFamily: 'Arial',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    // Date
    const dateStr = new Date(game.date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric',
    });
    this.add.text(90, y + 30, `${dateStr} \u2022 Level ${game.levelReached}`, {
      fontSize: '13px',
      fontFamily: 'Arial',
      color: '#888888',
    });

    // Stars earned
    this.add.text(350, y + 12, `\u2B50 ${game.starsEarned}`, {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffd700',
      fontStyle: 'bold',
    });

    // Correct / Wrong
    this.add.text(350, y + 34, `\u2714 ${game.correctAnswers}  \u2718 ${game.wrongAnswers}`, {
      fontSize: '13px',
      fontFamily: 'Arial',
      color: '#aaaaaa',
    });

    // Deaths summary
    const troggleDeaths = game.deaths.filter((d) => d.cause === 'troggle').length;
    const wrongDeaths = game.deaths.filter((d) => d.cause === 'wrong_answer').length;
    const deathParts: string[] = [];
    if (troggleDeaths > 0) deathParts.push(`${troggleDeaths} troggle`);
    if (wrongDeaths > 0) deathParts.push(`${wrongDeaths} wrong`);
    const deathStr = deathParts.length > 0 ? deathParts.join(', ') : 'no deaths';

    this.add.text(500, y + 12, `Deaths: ${deathStr}`, {
      fontSize: '13px',
      fontFamily: 'Arial',
      color: troggleDeaths + wrongDeaths > 0 ? '#ff6666' : '#66ff66',
    });
  }
}
