import { describe, it, expect, vi } from 'vitest';
import { drawCharacter } from '../../src/ui/CharacterSprites';
import { animKey } from '../../src/sprites/SpriteRegistry';

/**
 * CharacterSprites dispatch tests.
 *
 * drawCharacter branches on scene.textures.exists:
 *  - PNG branch: creates a Phaser Sprite, sizes it, adds to container
 *  - Programmatic fallback: calls existing draw functions (Graphics-based)
 */

// ---------------------------------------------------------------------------
// Minimal mock types
// ---------------------------------------------------------------------------

interface MockSprite {
  displayW: number;
  displayH: number;
  playedAnim: string;
  setDisplaySize(w: number, h: number): MockSprite;
  play(key: string): MockSprite;
}

interface MockGraphics {
  fillStyle: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
}

interface MockRectangle {
  setStrokeStyle: ReturnType<typeof vi.fn>;
}

interface MockContainer {
  added: unknown[];
  add(obj: unknown): void;
}

interface MockScene {
  textures: { exists: (key: string) => boolean };
  anims: { exists: (key: string) => boolean };
  add: {
    sprite: (x: number, y: number, texture: string) => MockSprite;
    graphics: () => MockGraphics;
    rectangle: (x: number, y: number, w: number, h: number, color: number, alpha: number) => MockRectangle;
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeMockSprite(): MockSprite {
  const sprite: MockSprite = {
    displayW: 0,
    displayH: 0,
    playedAnim: '',
    setDisplaySize(w, h) {
      this.displayW = w;
      this.displayH = h;
      return this;
    },
    play(key) {
      this.playedAnim = key;
      return this;
    },
  };
  return sprite;
}

function makeMockGraphics(): MockGraphics {
  return {
    fillStyle: vi.fn(),
    fillRect: vi.fn(),
  };
}

function makeMockRectangle(): MockRectangle {
  return {
    setStrokeStyle: vi.fn().mockReturnThis(),
  };
}

function makeMockContainer(): MockContainer {
  return {
    added: [],
    add(obj: unknown) {
      this.added.push(obj);
    },
  };
}

/**
 * Create a mock scene controlling whether textures and animations exist.
 */
function makeMockScene(textureExists: boolean, animExists: boolean = false) {
  const sprite = makeMockSprite();
  const scene: MockScene = {
    textures: { exists: (_key: string) => textureExists },
    anims: { exists: (_key: string) => animExists },
    add: {
      sprite: (_x: number, _y: number, _texture: string) => sprite,
      graphics: () => makeMockGraphics(),
      rectangle: (_x: number, _y: number, _w: number, _h: number, _color: number, _alpha: number) =>
        makeMockRectangle(),
    },
  };
  return { scene, sprite };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('drawCharacter dispatch', () => {
  it('creates a Phaser Sprite when texture exists', () => {
    const { scene, sprite } = makeMockScene(true, false);
    const container = makeMockContainer();
    const addSpriteSpy = vi.spyOn(scene.add, 'sprite');

    drawCharacter(scene as unknown as Phaser.Scene, container as unknown as Phaser.GameObjects.Container, 'box', 4);

    expect(addSpriteSpy).toHaveBeenCalledWith(0, 0, 'box');
    expect(container.added).toContain(sprite);
  });

  it('sizes the PNG sprite using pixelSize * 12', () => {
    const { scene, sprite } = makeMockScene(true, false);
    const container = makeMockContainer();
    const pixelSize = 6;

    drawCharacter(scene as unknown as Phaser.Scene, container as unknown as Phaser.GameObjects.Container, 'box', pixelSize);

    expect(sprite.displayW).toBe(pixelSize * 12);
    expect(sprite.displayH).toBe(pixelSize * 12);
  });

  it('plays idle animation when both texture and animation exist', () => {
    const { scene, sprite } = makeMockScene(true, true);
    const container = makeMockContainer();

    drawCharacter(scene as unknown as Phaser.Scene, container as unknown as Phaser.GameObjects.Container, 'box', 4);

    const expectedKey = animKey('box', 'idle');
    expect(sprite.playedAnim).toBe(expectedKey);
  });

  it('does NOT play animation when idle animation does not exist (stays frame 0)', () => {
    const { scene, sprite } = makeMockScene(true, false);
    const container = makeMockContainer();

    drawCharacter(scene as unknown as Phaser.Scene, container as unknown as Phaser.GameObjects.Container, 'box', 4);

    expect(sprite.playedAnim).toBe('');
  });

  it('falls back to programmatic rendering when texture does not exist', () => {
    const { scene } = makeMockScene(false, false);
    const container = makeMockContainer();
    const addSpriteSpy = vi.spyOn(scene.add, 'sprite');
    const addGraphicsSpy = vi.spyOn(scene.add, 'graphics');

    drawCharacter(scene as unknown as Phaser.Scene, container as unknown as Phaser.GameObjects.Container, 'box', 4);

    expect(addSpriteSpy).not.toHaveBeenCalled();
    expect(addGraphicsSpy).toHaveBeenCalled();
  });

  it('does NOT call add.sprite for programmatic characters without texture', () => {
    const { scene } = makeMockScene(false, false);
    const container = makeMockContainer();
    const addSpriteSpy = vi.spyOn(scene.add, 'sprite');

    drawCharacter(scene as unknown as Phaser.Scene, container as unknown as Phaser.GameObjects.Container, 'claude', 4);

    expect(addSpriteSpy).not.toHaveBeenCalled();
  });

  it('PNG branch: sprite is added to container, not left as scene child', () => {
    const { scene, sprite } = makeMockScene(true, false);
    const container = makeMockContainer();

    drawCharacter(scene as unknown as Phaser.Scene, container as unknown as Phaser.GameObjects.Container, 'axolotl', 4);

    expect(container.added).toContain(sprite);
    // Exactly 1 item added in the PNG branch (just the sprite)
    expect(container.added.length).toBe(1);
  });
});
