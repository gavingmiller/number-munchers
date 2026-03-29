---
phase: 06-sprite-system-foundation
plan: 02
subsystem: ui
tags: [phaser, sprites, spritesheet, animation, typescript]

# Dependency graph
requires:
  - phase: 06-sprite-system-foundation-01
    provides: SpriteRegistry module with setManifest, registerAnimations, animKey exports

provides:
  - PNG branch dispatch in drawCharacter (textures.exists check before programmatic fallback)
  - BootScene manifest loading pipeline: load.json -> filecomplete event -> spritesheet queuing
  - Animation registration in BootScene.create() via registerAnimations
  - 7 tests for drawCharacter PNG/programmatic dispatch in specs/ui/CharacterSprites.spec.ts

affects: [sprite-viewer, character-select-scene, any scene using drawCharacter]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - PNG-before-programmatic: textures.exists guard in drawCharacter enables zero-code PNG migration
    - Manifest-driven loading: BootScene loads sprites.json, queues all spritesheets in single preload cycle
    - Non-fatal fallback: manifest/spritesheet load failures degrade gracefully to programmatic rendering

key-files:
  created:
    - specs/ui/CharacterSprites.spec.ts
  modified:
    - src/ui/CharacterSprites.ts
    - src/scenes/BootScene.ts

key-decisions:
  - "PNG branch checks scene.textures.exists(character) - uses Phaser texture key matching character name"
  - "setDisplaySize uses pixelSize * 12 for PNG sprites (matching 12x12 grid convention)"
  - "Manifest load failure is non-fatal: filecomplete event never fires, all characters use programmatic rendering"
  - "TDD test approach: mock scene with textures.exists/anims.exists control, vi.spyOn for call verification"

patterns-established:
  - "Texture-first dispatch: check textures.exists before any programmatic draw call"
  - "BootScene as sprite pipeline entry point: manifest -> spritesheets -> animations all boot in preload/create"

requirements-completed: [SPRT-02, SPRT-03, SPRT-04]

# Metrics
duration: 3min
completed: 2026-03-29
---

# Phase 6 Plan 02: Sprite System Integration Summary

**PNG sprite rendering wired end-to-end: BootScene loads sprites.json manifest, queues spritesheets, drawCharacter dispatches to Phaser Sprite before programmatic fallback**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-29T02:47:42Z
- **Completed:** 2026-03-29T02:50:46Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- drawCharacter now checks scene.textures.exists before the programmatic switch — PNG sprites render as Phaser Sprites sized at pixelSize*12, play idle animation if it exists
- BootScene preload() loads sprites/sprites.json, listens for filecomplete event to queue spritesheets dynamically — zero code change needed to add a new character
- BootScene create() calls setManifest + registerAnimations with loaded manifest data before existing scene routing
- 7 TDD tests covering: Sprite creation, sizing, idle animation play, no-anim fallback, programmatic fallback, and container containment

## Task Commits

Each task was committed atomically:

1. **Task 1: Add drawCharacter PNG branch and write dispatch tests** - `79c920d` (feat)
2. **Task 2: Integrate manifest loading into BootScene** - `c1b59ef` (feat)

**Plan metadata:** (docs commit, see below)

## Files Created/Modified
- `src/ui/CharacterSprites.ts` - Added animKey import and PNG branch before programmatic switch
- `src/scenes/BootScene.ts` - Added manifest loading pipeline in preload(), animation registration in create()
- `specs/ui/CharacterSprites.spec.ts` - 7 tests for PNG/programmatic dispatch logic

## Decisions Made
- Used `vi.spyOn` on mock scene's `add.sprite` for call verification rather than `vi.resetModules()` — bun's vitest compatibility layer does not support `resetModules()`, static import works correctly
- Mock pattern matches GridRenderer.spec.ts approach: pure object mocks with no Phaser dependency

## Deviations from Plan

**1. [Rule 3 - Blocking] Replaced vi.resetModules() with static import in tests**
- **Found during:** Task 1 (RED phase test writing)
- **Issue:** `vi.resetModules()` is not available in bun's vitest compatibility layer (bun 1.3.9)
- **Fix:** Removed `beforeEach` dynamic import pattern, used static top-level import of `drawCharacter` - module state does not affect test isolation since we control behavior via mock return values
- **Files modified:** specs/ui/CharacterSprites.spec.ts
- **Verification:** All 7 tests pass under `bun test`
- **Committed in:** 79c920d (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Auto-fix necessary for test runner compatibility. No scope creep. All 7 planned behaviors are still verified.

## Issues Encountered
- Pre-existing TypeScript errors in unrelated files (CollisionSystem.spec.ts, GameScene.ts, etc.) — `npx tsc --noEmit` exits non-zero but no errors in files we modified. These are out-of-scope pre-existing issues.

## Next Phase Readiness
- Full sprite pipeline is wired: dropping a PNG sheet at `public/sprites/{name}/sheet.png` and adding a `sprites.json` entry renders the character from the sheet with zero code changes
- Box test sprite sheet from Plan 01 exercises the end-to-end pipeline in BootScene
- Ready for Phase 6 Plan 03 (sprite viewer dev tool) or any phase creating actual character sprite sheets

---
*Phase: 06-sprite-system-foundation*
*Completed: 2026-03-29*
