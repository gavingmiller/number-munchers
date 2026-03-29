import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  setManifest,
  hasEntry,
  getEntry,
  animKey,
  registerAnimations,
} from '../../src/sprites/SpriteRegistry';
import type { SpriteManifest } from '../../src/sprites/SpriteRegistry';

// Reset manifest between tests
beforeEach(() => {
  setManifest({});
});

// ---------------------------------------------------------------------------
// hasEntry
// ---------------------------------------------------------------------------

describe('hasEntry', () => {
  it('returns false when manifest is empty', () => {
    expect(hasEntry('claude')).toBe(false);
  });

  it('returns true when manifest contains the character', () => {
    setManifest({
      claude: {
        sheet: 'claude/sheet.png',
        frameWidth: 64,
        frameHeight: 64,
        animations: { idle: { frames: [0, 3] } },
      },
    });
    expect(hasEntry('claude')).toBe(true);
  });

  it('returns false for a character not in the manifest', () => {
    setManifest({
      box: {
        sheet: 'box/sheet.png',
        frameWidth: 64,
        frameHeight: 64,
        animations: {},
      },
    });
    expect(hasEntry('claude')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getEntry
// ---------------------------------------------------------------------------

describe('getEntry', () => {
  it('returns undefined when manifest is empty', () => {
    expect(getEntry('claude')).toBeUndefined();
  });

  it('returns the SpriteManifestEntry for a present character', () => {
    const entry = {
      sheet: 'claude/sheet.png',
      frameWidth: 64,
      frameHeight: 64,
      animations: { idle: { frames: [0, 3] as [number, number] } },
    };
    setManifest({ claude: entry });
    expect(getEntry('claude')).toEqual(entry);
  });

  it('returns undefined for a character not in the manifest', () => {
    setManifest({
      box: {
        sheet: 'box/sheet.png',
        frameWidth: 64,
        frameHeight: 64,
        animations: {},
      },
    });
    expect(getEntry('claude')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// animKey
// ---------------------------------------------------------------------------

describe('animKey', () => {
  it('returns character-animName format for idle', () => {
    expect(animKey('claude', 'idle')).toBe('claude-idle');
  });

  it('returns character-animName format for walkUp', () => {
    expect(animKey('box', 'walkUp')).toBe('box-walkUp');
  });

  it('returns correct key for any character and anim name', () => {
    expect(animKey('electricmouse', 'munch')).toBe('electricmouse-munch');
  });
});

// ---------------------------------------------------------------------------
// setManifest + subsequent calls
// ---------------------------------------------------------------------------

describe('setManifest', () => {
  it('stores the manifest so subsequent hasEntry calls reflect it', () => {
    expect(hasEntry('axolotl')).toBe(false);
    setManifest({
      axolotl: {
        sheet: 'axolotl/sheet.png',
        frameWidth: 64,
        frameHeight: 64,
        animations: {},
      },
    });
    expect(hasEntry('axolotl')).toBe(true);
  });

  it('replaces a previous manifest on subsequent calls', () => {
    setManifest({
      claude: {
        sheet: 'claude/sheet.png',
        frameWidth: 64,
        frameHeight: 64,
        animations: {},
      },
    });
    expect(hasEntry('claude')).toBe(true);
    setManifest({});
    expect(hasEntry('claude')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// registerAnimations
// ---------------------------------------------------------------------------

function makeMockScene(existingKeys: string[] = []) {
  return {
    anims: {
      exists: (key: string) => existingKeys.includes(key),
      create: vi.fn(),
      generateFrameNumbers: (texture: string, config: { start: number; end: number }) =>
        Array.from({ length: config.end - config.start + 1 }, (_, i) => ({
          key: texture,
          frame: config.start + i,
        })),
    },
  };
}

describe('registerAnimations', () => {
  it('calls scene.anims.create() once per animation entry', () => {
    const manifest: SpriteManifest = {
      claude: {
        sheet: 'claude/sheet.png',
        frameWidth: 64,
        frameHeight: 64,
        animations: {
          idle: { frames: [0, 3] },
          walkUp: { frames: [4, 7] },
        },
      },
    };
    const scene = makeMockScene();
    registerAnimations(scene, manifest);
    expect(scene.anims.create).toHaveBeenCalledTimes(2);
  });

  it('uses generateFrameNumbers with correct start/end from manifest frames', () => {
    const manifest: SpriteManifest = {
      box: {
        sheet: 'box/sheet.png',
        frameWidth: 64,
        frameHeight: 64,
        animations: {
          idle: { frames: [0, 0] },
        },
      },
    };
    const scene = makeMockScene();
    const spy = vi.spyOn(scene.anims, 'generateFrameNumbers');
    registerAnimations(scene, manifest);
    expect(spy).toHaveBeenCalledWith('box', { start: 0, end: 0 });
  });

  it('defaults frameRate to 8 when not specified in manifest', () => {
    const manifest: SpriteManifest = {
      box: {
        sheet: 'box/sheet.png',
        frameWidth: 64,
        frameHeight: 64,
        animations: {
          idle: { frames: [0, 0] },
        },
      },
    };
    const scene = makeMockScene();
    registerAnimations(scene, manifest);
    const call = scene.anims.create.mock.calls[0][0];
    expect(call.frameRate).toBe(8);
  });

  it('defaults repeat to -1 when not specified in manifest', () => {
    const manifest: SpriteManifest = {
      box: {
        sheet: 'box/sheet.png',
        frameWidth: 64,
        frameHeight: 64,
        animations: {
          idle: { frames: [0, 0] },
        },
      },
    };
    const scene = makeMockScene();
    registerAnimations(scene, manifest);
    const call = scene.anims.create.mock.calls[0][0];
    expect(call.repeat).toBe(-1);
  });

  it('uses provided frameRate and repeat when specified', () => {
    const manifest: SpriteManifest = {
      claude: {
        sheet: 'claude/sheet.png',
        frameWidth: 64,
        frameHeight: 64,
        animations: {
          munch: { frames: [8, 11], frameRate: 16, repeat: 0 },
        },
      },
    };
    const scene = makeMockScene();
    registerAnimations(scene, manifest);
    const call = scene.anims.create.mock.calls[0][0];
    expect(call.frameRate).toBe(16);
    expect(call.repeat).toBe(0);
  });

  it('skips animation keys that already exist', () => {
    const manifest: SpriteManifest = {
      claude: {
        sheet: 'claude/sheet.png',
        frameWidth: 64,
        frameHeight: 64,
        animations: {
          idle: { frames: [0, 3] },
          walkUp: { frames: [4, 7] },
        },
      },
    };
    // claude-idle already exists
    const scene = makeMockScene(['claude-idle']);
    registerAnimations(scene, manifest);
    // Only walkUp should be created
    expect(scene.anims.create).toHaveBeenCalledTimes(1);
    expect(scene.anims.create.mock.calls[0][0].key).toBe('claude-walkUp');
  });

  it('calls scene.anims.create() zero times when manifest is empty', () => {
    const scene = makeMockScene();
    registerAnimations(scene, {});
    expect(scene.anims.create).toHaveBeenCalledTimes(0);
  });

  it('uses animKey format (character-animName) for animation keys', () => {
    const manifest: SpriteManifest = {
      box: {
        sheet: 'box/sheet.png',
        frameWidth: 64,
        frameHeight: 64,
        animations: {
          idle: { frames: [0, 0] },
        },
      },
    };
    const scene = makeMockScene();
    registerAnimations(scene, manifest);
    const call = scene.anims.create.mock.calls[0][0];
    expect(call.key).toBe('box-idle');
  });
});
