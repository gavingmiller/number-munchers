import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnimationController, troggleAnimName } from '../../src/ui/AnimationController';
import type { TroggleType } from '../../src/types';

// ---------------------------------------------------------------------------
// Mock AnimatableSprite
// ---------------------------------------------------------------------------

function makeMockSprite() {
  return {
    play: vi.fn(),
    once: vi.fn(),
  };
}

// ---------------------------------------------------------------------------
// AnimationController.play
// ---------------------------------------------------------------------------

describe('AnimationController.play', () => {
  let sprite: ReturnType<typeof makeMockSprite>;
  let ctrl: AnimationController;

  beforeEach(() => {
    sprite = makeMockSprite();
    ctrl = new AnimationController(sprite);
  });

  it('calls sprite.play with the given key', () => {
    ctrl.play('idle');
    expect(sprite.play).toHaveBeenCalledWith('idle');
  });

  it('sets currentAnim to the played key', () => {
    ctrl.play('idle');
    expect(ctrl.getCurrentAnim()).toBe('idle');
  });

  it('is a no-op when same key is already playing', () => {
    ctrl.play('idle');
    ctrl.play('idle');
    expect(sprite.play).toHaveBeenCalledTimes(1);
  });

  it('calls sprite.play again when animation changes', () => {
    ctrl.play('idle');
    ctrl.play('walkLeft');
    expect(sprite.play).toHaveBeenCalledTimes(2);
    expect(sprite.play).toHaveBeenLastCalledWith('walkLeft');
  });

  it('updates currentAnim when animation changes', () => {
    ctrl.play('idle');
    ctrl.play('walkLeft');
    expect(ctrl.getCurrentAnim()).toBe('walkLeft');
  });
});

// ---------------------------------------------------------------------------
// AnimationController.playOnce
// ---------------------------------------------------------------------------

describe('AnimationController.playOnce', () => {
  let sprite: ReturnType<typeof makeMockSprite>;
  let ctrl: AnimationController;

  beforeEach(() => {
    sprite = makeMockSprite();
    ctrl = new AnimationController(sprite);
  });

  it('calls sprite.play with the given key', () => {
    const cb = vi.fn();
    ctrl.playOnce('munch', cb);
    expect(sprite.play).toHaveBeenCalledWith('munch');
  });

  it('registers once listener for animationcomplete', () => {
    const cb = vi.fn();
    ctrl.playOnce('munch', cb);
    expect(sprite.once).toHaveBeenCalledWith('animationcomplete', cb);
  });

  it('sets currentAnim to the played key', () => {
    ctrl.playOnce('munch', vi.fn());
    expect(ctrl.getCurrentAnim()).toBe('munch');
  });

  it('is a no-op when same key is already playing (does not stack listeners)', () => {
    const cb = vi.fn();
    ctrl.playOnce('munch', cb);
    ctrl.playOnce('munch', cb);
    expect(sprite.play).toHaveBeenCalledTimes(1);
    expect(sprite.once).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// AnimationController.getCurrentAnim
// ---------------------------------------------------------------------------

describe('AnimationController.getCurrentAnim', () => {
  it('returns empty string before any animation is played', () => {
    const ctrl = new AnimationController(makeMockSprite());
    expect(ctrl.getCurrentAnim()).toBe('');
  });

  it('returns the last played key after play()', () => {
    const ctrl = new AnimationController(makeMockSprite());
    ctrl.play('walkRight');
    expect(ctrl.getCurrentAnim()).toBe('walkRight');
  });
});

// ---------------------------------------------------------------------------
// AnimationController with null sprite (dormant/graceful mode)
// ---------------------------------------------------------------------------

describe('AnimationController with null sprite', () => {
  let ctrl: AnimationController;

  beforeEach(() => {
    ctrl = new AnimationController(null);
  });

  it('does not throw when play() is called', () => {
    expect(() => ctrl.play('idle')).not.toThrow();
  });

  it('does not throw when playOnce() is called', () => {
    expect(() => ctrl.playOnce('munch', vi.fn())).not.toThrow();
  });

  it('does not throw when getCurrentAnim() is called', () => {
    expect(() => ctrl.getCurrentAnim()).not.toThrow();
  });

  it('returns empty string from getCurrentAnim() when null sprite', () => {
    expect(ctrl.getCurrentAnim()).toBe('');
  });

  it('play() remains a no-op (currentAnim stays empty)', () => {
    ctrl.play('idle');
    expect(ctrl.getCurrentAnim()).toBe('');
  });
});

// ---------------------------------------------------------------------------
// troggleAnimName
// ---------------------------------------------------------------------------

describe('troggleAnimName', () => {
  const cases: [TroggleType, string][] = [
    ['reggie', 'crawl'],
    ['fangs', 'slither'],
    ['squirt', 'bounce'],
    ['ember', 'flicker'],
    ['bonehead', 'stalk'],
  ];

  for (const [type, expected] of cases) {
    it(`troggleAnimName('${type}') returns '${expected}'`, () => {
      expect(troggleAnimName(type)).toBe(expected);
    });
  }
});
