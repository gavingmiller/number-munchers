import Phaser from 'phaser';
import type { GradeLevel } from '../types';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    // No assets to preload — all graphics are programmatic
  }

  create(): void {
    const savedGrade = localStorage.getItem('numberMunchers_grade');
    if (savedGrade) {
      const grade = Number(savedGrade) as GradeLevel;
      this.scene.start('MainMenu', { grade });
    } else {
      this.scene.start('GradeSelect');
    }
  }
}
