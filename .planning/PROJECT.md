# Number Munchers

## What This Is

A math education game for kids (grades 1-5) built with Phaser 3, TypeScript, and Vite. Players navigate a grid, "munching" correct answers while avoiding troggle enemies. Deployed as an iOS app via Xcode/Capacitor. Features 10 game modes, star-based progression, character unlocks, game history, configurable controls, and a PNG sprite system with dev viewer tool.

## Core Value

Kids practice math facts through engaging gameplay with meaningful progression — stars and character unlocks keep them coming back.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Grid-based gameplay with 10 math modes across grades 1-5 — v1.0
- ✓ 5 troggle enemy types with distinct AI behaviors — v1.0
- ✓ 9 playable characters with pixel art sprites — v1.0
- ✓ Star-based progression system (1 star per correct answer) — v1.0
- ✓ Character unlock shop with tiered pricing — v1.0
- ✓ Game history tracking (last 10 games, problems, deaths) — v1.0
- ✓ Parent-facing history screen — v1.0
- ✓ Settings with center/two-handed control styles — v1.0
- ✓ Grade-appropriate difficulty scaling — v1.0
- ✓ iOS app deployment with app icon and splash screens — v1.0
- ✓ Sprite manifest system (sprites.json) for PNG sprite sheets — v2.0
- ✓ PNG sprite rendering with programmatic fallback — v2.0
- ✓ Sprite viewer dev tool with drag-drop and animation controls — v2.0
- ✓ "Commit to Project" sprite integration workflow — v2.0
- ✓ In-game animation hooks (idle, walk, munch) — v2.0
- ✓ Unique troggle animation names per type — v2.0

### Active

<!-- Current scope. Building toward these. -->

(None — planning next milestone)

### Out of Scope

- Sounds and music — deferred to future milestone
- New character designs (waffle, alligator, etc.) — deferred, pending sprite art creation
- Accessories system (sunglasses, mustache, hair) — deferred
- Chicken helper NPC — deferred
- Landscape/horizontal layout — known issue, future work
- Original Number Munchers throwback character — deferred
- Super Meat Boy character — deferred

## Context

- Sprite system supports both programmatic and PNG-based rendering
- PNG pipeline is "dormant" until sprite sheets are added to manifest
- Sprite viewer at `/viewer.html` for previewing and committing sprites
- 265 tests across 18 spec files, all passing
- Game runs on iPad primarily, dev work on desktop
- 9 characters + 5 troggles, all currently using programmatic sprites

## Constraints

- **Platform**: Must work on iPad (iOS/Safari)
- **Dev tool**: Viewer uses Vite dev server features (not in production build)
- **Sprite format**: 64x64 fixed grid PNG sprite sheets
- **Backwards compat**: Programmatic sprites always available as fallback

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phaser 3 for game engine | Full-featured 2D game framework with good mobile support | ✓ Good |
| Programmatic pixel art | No asset pipeline needed, easy to iterate | ✓ Good (kept as fallback) |
| localStorage for persistence | Simple, no server needed for single-device game | ✓ Good |
| Stars as currency | More motivating for kids than abstract points | ✓ Good |
| 64x64 sprite sheets | Good balance of detail and pixel art scale | ✓ Good |
| Single sprites.json manifest | Simple, one place to manage all sprite mappings | ✓ Good |
| AnimatableSprite interface | Keeps AnimationController testable without Phaser | ✓ Good |
| Separate Vite entry for viewer | Dev-only tool, not shipped in iOS bundle | ✓ Good |
| Vite configureServer for Commit | No external server needed for sprite file writes | ✓ Good |

---
*Last updated: 2026-03-29 after v2.0 milestone completion*
