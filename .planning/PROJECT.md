# Number Munchers

## What This Is

A math education game for kids (grades 1-5) built with Phaser 3, TypeScript, and Vite. Players navigate a grid, "munching" correct answers while avoiding troggle enemies. Deployed as an iOS app via Xcode/Capacitor. Features 10 game modes, star-based progression, character unlocks, game history, and configurable controls.

## Core Value

Kids practice math facts through engaging gameplay with meaningful progression — stars and character unlocks keep them coming back.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Grid-based gameplay with 10 math modes across grades 1-5
- ✓ 5 troggle enemy types with distinct AI behaviors
- ✓ 9 playable characters with pixel art sprites
- ✓ Star-based progression system (1 star per correct answer)
- ✓ Character unlock shop with tiered pricing
- ✓ Game history tracking (last 10 games, problems, deaths)
- ✓ Parent-facing history screen
- ✓ Settings with center/two-handed control styles
- ✓ Grade-appropriate difficulty scaling
- ✓ iOS app deployment with app icon and splash screens

### Active

<!-- Current scope. Building toward these. -->

- [ ] Sprite viewer/editor dev tool for designing and previewing sprites
- [ ] Migration from programmatic pixel art to PNG sprite sheets
- [ ] Frame-based sprite animations (walk, idle, munch, death)
- [ ] Easy sprite swapping mechanism between viewer and game

### Out of Scope

- Sounds and music — deferred to future milestone
- New character designs (waffle, alligator, etc.) — deferred, pending sprite system
- Accessories system — deferred, depends on new sprite architecture
- Chicken helper NPC — deferred
- Landscape/horizontal layout — known issue, future work

## Context

- All sprites are currently programmatic (Graphics + fillPixels helper in CharacterSprites.ts)
- 9 characters, 5 troggle types, each drawn with code
- No image assets exist yet — migration to PNG is a new direction
- Game runs on iPad primarily, dev work on desktop
- Phaser supports sprite sheets natively (TextureAtlas, SpriteSheet)

## Constraints

- **Platform**: Must work on iPad (iOS/Safari) — no Node.js file system access in game
- **Dev tool**: Can use Node/Bun features (separate page, not part of game bundle)
- **Sprite format**: PNG sprite sheets with frame-based animation
- **Backwards compat**: Keep programmatic sprites working during migration (don't break existing characters)

## Current Milestone: v2.0 Sprite Viewer/Editor

**Goal:** Build a dev tool for viewing, managing, and animating PNG sprite sheets, and refactor the game's sprite system to support image-based characters alongside programmatic ones.

**Target features:**
- Standalone sprite viewer page (separate Vite entry point)
- Load and preview sprite sheets from local directories
- Animation preview with frame controls
- Sprite manifest system for game integration
- Refactored CharacterSprites to support both PNG and programmatic sprites

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phaser 3 for game engine | Full-featured 2D game framework with good mobile support | ✓ Good |
| Programmatic pixel art | No asset pipeline needed, easy to iterate | ⚠️ Revisit — migrating to PNG sprites |
| localStorage for persistence | Simple, no server needed for single-device game | ✓ Good |
| Stars as currency | More motivating for kids than abstract points | ✓ Good |

---
*Last updated: 2026-03-28 after milestone v2.0 initialization*
