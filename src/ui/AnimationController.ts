// ============================================================
// AnimationController — animation state machine for player and troggle sprites.
// No Phaser import; uses minimal AnimatableSprite interface so this module
// stays testable in vitest's node environment.
// ============================================================

import type { TroggleType } from '../types';

// ---------------------------------------------------------------------------
// Minimal interface — keeps module testable without Phaser
// ---------------------------------------------------------------------------

export interface AnimatableSprite {
  play(key: string): void;
  once(event: string, cb: () => void): void;
}

// ---------------------------------------------------------------------------
// AnimationController
// ---------------------------------------------------------------------------

export class AnimationController {
  private sprite: AnimatableSprite | null;
  private currentAnim: string = '';

  constructor(sprite: AnimatableSprite | null) {
    this.sprite = sprite;
  }

  /**
   * Switch to a new animation. No-op if the same key is already playing.
   */
  play(key: string): void {
    if (this.sprite === null) return;
    if (key === this.currentAnim) return;
    this.currentAnim = key;
    this.sprite.play(key);
  }

  /**
   * Play a one-shot animation. Registers a callback fired on completion.
   * No-op (does not stack listeners) if the same key is already playing.
   */
  playOnce(key: string, onComplete: () => void): void {
    if (this.sprite === null) return;
    if (key === this.currentAnim) return;
    this.currentAnim = key;
    this.sprite.once('animationcomplete', onComplete);
    this.sprite.play(key);
  }

  /**
   * Returns the current animation key (empty string if none played yet).
   */
  getCurrentAnim(): string {
    return this.currentAnim;
  }
}

// ---------------------------------------------------------------------------
// troggleAnimName — maps TroggleType to its locked animation name
// ---------------------------------------------------------------------------

const TROGGLE_ANIM_MAP: Record<TroggleType, string> = {
  reggie: 'crawl',
  fangs: 'slither',
  squirt: 'bounce',
  ember: 'flicker',
  bonehead: 'stalk',
};

/**
 * Returns the animation name for a given TroggleType.
 * Locked decisions: reggie->crawl, fangs->slither, squirt->bounce,
 * ember->flicker, bonehead->stalk.
 */
export function troggleAnimName(type: TroggleType): string {
  return TROGGLE_ANIM_MAP[type];
}
