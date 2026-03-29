import Phaser from 'phaser';
import type { CharacterType, TroggleType } from '../types';
import type { SpriteManifest } from '../sprites/SpriteRegistry';
import { setManifest, registerAnimations, getEntry } from '../sprites/SpriteRegistry';
import { drawCharacter } from '../ui/CharacterSprites';
import { drawTroggle } from '../ui/TroggleSprites';

interface SpriteMetadata {
  name: string;
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
}

export class ViewerScene extends Phaser.Scene {
  private largeContainer: Phaser.GameObjects.Container | null = null;
  private smallContainer: Phaser.GameObjects.Container | null = null;
  private largeLabelText: Phaser.GameObjects.Text | null = null;
  private smallLabelText: Phaser.GameObjects.Text | null = null;
  private placeholderText: Phaser.GameObjects.Text | null = null;
  private currentSprite: Phaser.GameObjects.Sprite | null = null;
  private currentName: string | null = null;
  private currentMeta: SpriteMetadata | null = null;

  constructor() {
    super({ key: 'Viewer' });
  }

  preload(): void {
    // Load sprite manifest
    this.load.json('sprite-manifest', 'sprites/sprites.json');

    // When manifest JSON arrives, queue spritesheet loads (same pattern as BootScene)
    this.load.on('filecomplete-json-sprite-manifest', (_key: string, _type: string, data: SpriteManifest) => {
      for (const [name, entry] of Object.entries(data)) {
        if (entry) {
          this.load.spritesheet(name, `sprites/${entry.sheet}`, {
            frameWidth: entry.frameWidth,
            frameHeight: entry.frameHeight,
          });
        }
      }
      this.registry.set('sprite-manifest', data);
    });

    // Log load errors (non-fatal — falls back to programmatic)
    this.load.on('loaderror', (file: { key: string; url: string }) => {
      console.warn(`[ViewerScene] Failed to load: ${file.key} (${file.url})`);
    });
  }

  create(): void {
    const manifest = this.registry.get('sprite-manifest') as SpriteManifest | undefined;
    if (manifest) {
      setManifest(manifest);
      registerAnimations(this, manifest);
    }

    // Placeholder text shown until a sprite is selected
    this.placeholderText = this.add.text(300, 300, 'Select a sprite from the sidebar', {
      fontSize: '16px',
      color: '#888888',
      align: 'center',
    }).setOrigin(0.5, 0.5);
  }

  /**
   * Show a character or troggle with dual-scale preview.
   * Large preview (pixelSize 6) centered, game-scale preview (pixelSize 3) in corner.
   */
  showCharacter(name: string, type: 'character' | 'troggle'): void {
    this._clearPreviews();

    // Large preview container at center
    this.largeContainer = this.add.container(300, 250);
    // Small game-scale container at bottom-right corner
    this.smallContainer = this.add.container(520, 520);

    if (type === 'character') {
      drawCharacter(this, this.largeContainer, name as CharacterType, 6);
      drawCharacter(this, this.smallContainer, name as CharacterType, 3);
    } else {
      drawTroggle(this, this.largeContainer, name as TroggleType, 6);
      drawTroggle(this, this.smallContainer, name as TroggleType, 3);
    }

    // Labels
    this.largeLabelText = this.add.text(300, 150, 'Preview (4x)', {
      fontSize: '14px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    this.smallLabelText = this.add.text(520, 480, 'Game Scale', {
      fontSize: '12px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    // Build metadata
    const entry = getEntry(name);
    const frameCount = entry
      ? (this.textures.exists(name)
        ? this.textures.get(name).frameTotal - 1  // Phaser adds a __BASE frame
        : Object.values(entry.animations).reduce((max, anim) => {
            const end = anim.frames[1];
            return end > max ? end : max;
          }, 0) + 1)
      : 0;

    this.currentName = name;
    this.currentMeta = {
      name,
      frameCount,
      frameWidth: entry?.frameWidth ?? 0,
      frameHeight: entry?.frameHeight ?? 0,
    };
  }

  /**
   * Show a sprite from a loaded texture key with dual-scale preview.
   * Stores sprite references for animation control (Plan 02).
   */
  showSpritesheet(key: string, frameWidth: number, frameHeight: number): void {
    this._clearPreviews();

    if (!this.textures.exists(key)) {
      console.warn(`[ViewerScene] Texture '${key}' not found`);
      return;
    }

    const texture = this.textures.get(key);
    const frameCount = Math.max(0, texture.frameTotal - 1); // subtract __BASE

    // Large preview (4x scale)
    const largeSprite = this.add.sprite(300, 250, key);
    largeSprite.setScale(4);
    this.currentSprite = largeSprite;

    // Small game-scale preview
    const smallSprite = this.add.sprite(520, 520, key);
    smallSprite.setScale(1);

    // Labels
    this.largeLabelText = this.add.text(300, 150, 'Preview (4x)', {
      fontSize: '14px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    this.smallLabelText = this.add.text(520, 480, 'Game Scale', {
      fontSize: '12px',
      color: '#ffffff',
      align: 'center',
    }).setOrigin(0.5, 0.5);

    this.currentName = key;
    this.currentMeta = {
      name: key,
      frameCount,
      frameWidth,
      frameHeight,
    };
  }

  /**
   * Return metadata for the currently displayed sprite.
   */
  getMetadata(): SpriteMetadata | null {
    return this.currentMeta;
  }

  private _clearPreviews(): void {
    // Hide placeholder
    if (this.placeholderText) {
      this.placeholderText.setVisible(false);
    }

    // Destroy previous containers and their children
    if (this.largeContainer) {
      this.largeContainer.destroy(true);
      this.largeContainer = null;
    }
    if (this.smallContainer) {
      this.smallContainer.destroy(true);
      this.smallContainer = null;
    }

    // Destroy previous sprites (showSpritesheet path)
    if (this.currentSprite) {
      this.currentSprite.destroy();
      this.currentSprite = null;
    }

    // Destroy labels
    if (this.largeLabelText) {
      this.largeLabelText.destroy();
      this.largeLabelText = null;
    }
    if (this.smallLabelText) {
      this.smallLabelText.destroy();
      this.smallLabelText = null;
    }

    this.currentMeta = null;
  }
}
