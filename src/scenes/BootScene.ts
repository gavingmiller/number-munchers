import Phaser from 'phaser';
import type { GradeLevel } from '../types';
import type { SpriteManifest } from '../sprites/SpriteRegistry';
import { setManifest, registerAnimations } from '../sprites/SpriteRegistry';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'Boot' });
  }

  preload(): void {
    // Load sprite manifest -- drives all PNG sprite sheet loading
    this.load.json('sprite-manifest', 'sprites/sprites.json');

    // When manifest JSON arrives, queue spritesheet loads in same preload cycle
    this.load.on('filecomplete-json-sprite-manifest', (_key: string, _type: string, data: SpriteManifest) => {
      for (const [name, entry] of Object.entries(data)) {
        if (entry) {
          this.load.spritesheet(name, `sprites/${entry.sheet}`, {
            frameWidth: entry.frameWidth,
            frameHeight: entry.frameHeight,
          });
        }
      }
      // Store manifest for create() to use
      this.registry.set('sprite-manifest', data);
    });

    // Log load errors for debugging (non-fatal -- characters fall back to programmatic)
    this.load.on('loaderror', (file: { key: string; url: string }) => {
      console.warn(`[SpriteSystem] Failed to load: ${file.key} (${file.url})`);
    });
  }

  create(): void {
    // Register sprite animations from loaded manifest
    const manifest = this.registry.get('sprite-manifest') as SpriteManifest | undefined;
    if (manifest) {
      setManifest(manifest);
      registerAnimations(this, manifest);
    }

    // Existing scene routing -- unchanged
    const savedGrade = localStorage.getItem('numberMunchers_grade');
    if (savedGrade) {
      const grade = Number(savedGrade) as GradeLevel;
      this.scene.start('MainMenu', { grade });
    } else {
      this.scene.start('GradeSelect');
    }
  }
}
