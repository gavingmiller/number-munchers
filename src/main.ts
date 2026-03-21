import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { GradeSelectScene } from './scenes/GradeSelectScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { CutsceneScene } from './scenes/CutsceneScene';
import { HiScoreScene } from './scenes/HiScoreScene';
import { CharacterSelectScene } from './scenes/CharacterSelectScene';
import { DebugScene } from './scenes/DebugScene';
import { LevelCompleteScene } from './scenes/LevelCompleteScene';
import { CANVAS_WIDTH, CANVAS_HEIGHT, COLOR_BG } from './constants';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  backgroundColor: COLOR_BG,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, GradeSelectScene, MainMenuScene, CharacterSelectScene, GameScene, GameOverScene, LevelCompleteScene, CutsceneScene, HiScoreScene, DebugScene],
  input: {
    activePointers: 4,
  },
};

new Phaser.Game(config);
