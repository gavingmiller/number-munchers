# Milestones: Number Munchers

## v2.0 — Sprite Viewer/Editor (Shipped: 2026-03-29)

**Phases:** 6-8 | **Plans:** 6 | **Tests:** 265 passing

### What shipped:
- SpriteRegistry manifest system (sprites.json) for PNG sprite sheet management
- PNG sprite rendering pipeline with programmatic fallback (zero visual change without sheets)
- Standalone sprite viewer dev tool at `/viewer.html` with Phaser canvas
- Drag-and-drop + file picker PNG loading with preview-only mode
- "Commit to Project" button to persist sprites via Vite dev server plugin
- Animation controls: play/pause/step, speed slider, frame range definition with naming
- AnimationController class for state-guarded animation playback (no restart-on-every-tick)
- In-game animation hooks: idle loop, 4-directional walk, quick munch chomp
- Unique troggle animation names per type (crawl, slither, bounce, flicker, stalk)
- Dual-scale sprite preview (large zoomed + game-scale corner)

### Key decisions:
- 64x64 fixed grid sprite sheets (Phaser native spritesheet loader)
- Single sprites.json manifest at public/sprites/
- Separate Vite entry point for viewer (not part of game bundle)
- AnimatableSprite minimal interface (no Phaser imports in controller — fully testable)
- System dormant until PNG sheets exist — zero visual change to existing game

---

## v1.0 — Core Game (Completed)

**Shipped:** 2026-03-28
**Phases:** 1-5 (informal, pre-GSD)

### What shipped:
- Grid-based math gameplay with 10 modes across 5 grades
- 5 troggle enemy types with distinct AI (reggie, fangs, squirt, ember, bonehead)
- 9 playable characters with programmatic pixel art
- Star-based progression system replacing points
- Character unlock shop (tiered 100-7500 stars)
- Game history tracking for parents (last 10 games)
- Settings with center/two-handed touch controls
- iOS app deployment with icon and splash screens
- 225+ tests, pixel-perfect rendering, grade-appropriate difficulty

### Key decisions:
- Phaser 3 + TypeScript + Vite stack
- Programmatic pixel art (no image assets)
- localStorage for all persistence
- Stars as universal currency
