import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    // No assets to preload — all graphics are programmatic
  }

  create(): void {
    this.scene.start('MainMenu');
  }
}
