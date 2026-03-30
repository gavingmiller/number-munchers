// ============================================================
// SpriteRegistry — manifest types and helpers for the PNG sprite system.
// No Phaser import; uses minimal interface so this module stays testable.
// ============================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AnimationDef {
  /** [startFrame, endFrame] inclusive */
  frames: [number, number];
  /** Defaults to 8 when omitted */
  frameRate?: number;
  /** Defaults to -1 (loop) when omitted */
  repeat?: number;
  /** Mirror the sprite horizontally (e.g., walkLeft = walkRight flipped) */
  flipX?: boolean;
  /** Mirror the sprite vertically */
  flipY?: boolean;
}

export interface SpriteManifestEntry {
  /** Relative path from public/sprites/, e.g. "box/sheet.png" */
  sheet: string;
  frameWidth: number;
  frameHeight: number;
  animations: Record<string, AnimationDef>;
}

export type SpriteManifest = Partial<Record<string, SpriteManifestEntry>>;

// ---------------------------------------------------------------------------
// Minimal scene interface — keeps module testable without Phaser
// ---------------------------------------------------------------------------

interface AnimScene {
  anims: {
    exists(key: string): boolean;
    create(config: object): void;
    generateFrameNumbers(key: string, config: { start: number; end: number }): object[];
  };
}

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

let _manifest: SpriteManifest = {};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Replace the active manifest. All subsequent hasEntry/getEntry calls reflect it. */
export function setManifest(m: SpriteManifest): void {
  _manifest = m;
}

/** Returns true when the manifest has an entry for the given character key. */
export function hasEntry(character: string): boolean {
  return character in _manifest;
}

/** Returns the SpriteManifestEntry for the character, or undefined if absent. */
export function getEntry(character: string): SpriteManifestEntry | undefined {
  return _manifest[character];
}

/** Returns the namespaced animation key, e.g. animKey('claude', 'idle') => 'claude-idle'. */
export function animKey(character: string, animName: string): string {
  return `${character}-${animName}`;
}

/** Returns the AnimationDef for a character's animation, or undefined. */
export function getAnimDef(character: string, animName: string): AnimationDef | undefined {
  return _manifest[character]?.animations[animName];
}

/**
 * Register all animations from the manifest with Phaser's AnimationManager.
 * Skips keys that already exist. Defaults frameRate to 8, repeat to -1.
 * Call once in BootScene.create() after spritesheets are loaded.
 */
export function registerAnimations(scene: AnimScene, manifest: SpriteManifest): void {
  for (const [charName, entry] of Object.entries(manifest)) {
    if (!entry) continue;
    for (const [animName, animDef] of Object.entries(entry.animations)) {
      const key = animKey(charName, animName);
      if (scene.anims.exists(key)) continue;
      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers(charName, {
          start: animDef.frames[0],
          end: animDef.frames[1],
        }),
        frameRate: animDef.frameRate ?? 8,
        repeat: animDef.repeat ?? -1,
      });
    }
  }
}
