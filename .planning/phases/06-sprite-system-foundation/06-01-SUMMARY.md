---
phase: 06-sprite-system-foundation
plan: "01"
subsystem: ui
tags: [phaser, sprites, animation, manifest, png, vitest]

# Dependency graph
requires: []
provides:
  - SpriteRegistry module with manifest types (AnimationDef, SpriteManifestEntry, SpriteManifest)
  - setManifest, hasEntry, getEntry, animKey, registerAnimations API
  - sprites.json manifest file with box test entry
  - public/sprites/box/sheet.png test sprite sheet (64x64 PNG)
affects:
  - 06-02 (BootScene + drawCharacter integration builds on this API)
  - All future sprite work depends on SpriteRegistry types

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Manifest-driven sprite system: sprites.json maps character names to sheet paths + animation sequences"
    - "Minimal interface pattern: AnimScene interface instead of Phaser.Scene import keeps SpriteRegistry testable"
    - "TDD with plain mock objects: no Phaser mocking, use plain objects with the interface under test"
    - "animKey namespacing: character-animName format (e.g. claude-idle) prevents animation key collisions"

key-files:
  created:
    - src/sprites/SpriteRegistry.ts
    - specs/sprites/SpriteRegistry.spec.ts
    - public/sprites/sprites.json
    - public/sprites/box/sheet.png
  modified: []

key-decisions:
  - "Used minimal AnimScene interface instead of Phaser.Scene import for testability without mocking Phaser"
  - "SpriteManifest uses Partial<Record<string, SpriteManifestEntry>> to allow partial manifests without required keys"
  - "animKey returns character-animName format to prevent collisions in Phaser's global AnimationManager"
  - "box character chosen as test entry because it has the simplest programmatic sprite, easiest to produce a test PNG for"

patterns-established:
  - "Pattern 1: Manifest types in SpriteRegistry.ts — all sprite system types live here"
  - "Pattern 2: Plain mock objects for Phaser-adjacent tests — no Phaser mocking required"
  - "Pattern 3: registerAnimations skips existing keys — safe to call multiple times without warnings"

requirements-completed: [SPRT-01, SPRT-05]

# Metrics
duration: 3min
completed: 2026-03-29
---

# Phase 6 Plan 01: SpriteRegistry Module, Manifest JSON, and Test Sprite Sheet

**Manifest-driven sprite registry with AnimationDef/SpriteManifestEntry types, registerAnimations helper, sprites.json with box entry, and 64x64 test PNG — providing the complete type foundation for the PNG sprite pipeline**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-29T02:31:48Z
- **Completed:** 2026-03-29T02:34:46Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- SpriteRegistry module with all required types and functions, testable without Phaser imports
- 19 unit tests covering hasEntry, getEntry, animKey, setManifest, and registerAnimations behaviors
- sprites.json manifest with box test entry (frameWidth/Height 64, idle animation frames [0,0])
- 64x64 green test sprite sheet PNG for end-to-end pipeline verification in Plan 02

## Task Commits

Each task was committed atomically:

1. **Task 1: Create SpriteRegistry module with manifest types and helpers** - `8e1b640` (feat)
2. **Task 2: Create manifest JSON with box test entry** - `0d81219` (feat)
3. **Task 3: Generate minimal test sprite sheet PNG for box character** - `d46feb5` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified
- `src/sprites/SpriteRegistry.ts` - Manifest types, setManifest/hasEntry/getEntry/animKey/registerAnimations
- `specs/sprites/SpriteRegistry.spec.ts` - 19 unit tests, plain mock objects, no Phaser dependency
- `public/sprites/sprites.json` - Manifest with box test entry, frameWidth/Height 64
- `public/sprites/box/sheet.png` - 64x64 PNG, bright green fill, border, "T" marker

## Decisions Made
- Used minimal `AnimScene` interface instead of `Phaser.Scene` to keep the module importable and testable without Phaser running in a browser context
- `SpriteManifest` is `Partial<Record<string, SpriteManifestEntry>>` (not `Record<CharacterType, ...>`) to allow any character name including future additions without requiring manifest updates
- `animKey` function is the single source of truth for key format, used by both `registerAnimations` and future `drawCharacter` callers

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- SpriteRegistry module is complete and tested — Plan 02 can import and use it directly
- sprites.json and box/sheet.png are in place for BootScene's manifest-loading pipeline
- Full test suite at 244 tests (225 baseline + 19 new), all passing
- No blockers for Plan 02

---
*Phase: 06-sprite-system-foundation*
*Completed: 2026-03-29*

## Self-Check: PASSED

- FOUND: src/sprites/SpriteRegistry.ts
- FOUND: specs/sprites/SpriteRegistry.spec.ts
- FOUND: public/sprites/sprites.json
- FOUND: public/sprites/box/sheet.png
- Commits 8e1b640, 0d81219, d46feb5 verified in git log
