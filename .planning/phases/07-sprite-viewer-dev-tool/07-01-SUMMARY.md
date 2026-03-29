---
phase: 07-sprite-viewer-dev-tool
plan: "01"
subsystem: ui
tags: [phaser, vite, typescript, dev-tool, sprite-viewer]

# Dependency graph
requires:
  - phase: 06-sprite-system-foundation
    provides: SpriteRegistry, drawCharacter, drawTroggle, CharacterType, TroggleType, BootScene manifest pattern
provides:
  - Vite multi-page config with viewer.html as second entry point
  - viewer.html shell with flex-row sidebar + Phaser canvas layout
  - src/viewer/ViewerScene.ts — Phaser scene rendering programmatic sprites with dual-scale preview
  - src/viewer/sidebar.ts — DOM sidebar with 9 characters + 5 troggles, click-to-preview, metadata panel
  - src/viewer/main.ts — Phaser game initialization in canvas-container
  - src/viewer/types.ts — ViewerState and SpriteListItem interfaces
affects:
  - 07-02 (animation controls, file loading will extend ViewerScene and sidebar)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Vite multi-page app: rollupOptions.input with named entries for index.html + viewer.html"
    - "Phaser mounted in div: parent: 'canvas-container' instead of body — enables sidebar flex layout"
    - "game.events.once('ready') pattern for wiring HTML sidebar after scene creation"
    - "game.scene.getScene('Viewer') bridge pattern for HTML controls calling scene methods"

key-files:
  created:
    - viewer.html
    - src/viewer/main.ts
    - src/viewer/ViewerScene.ts
    - src/viewer/sidebar.ts
    - src/viewer/types.ts
  modified:
    - vite.config.ts

key-decisions:
  - "drawTroggle actual signature is drawTroggle(scene, container, type, P) — plan had wrong arg order (type first). Used correct signature from source."
  - "Sidebar wired after game.events.once('ready') — ensures ViewerScene is created before initSidebar calls getScene()"
  - "Used requestAnimationFrame in click handler before metadata update — gives ViewerScene time to process showCharacter before reading getMetadata()"

patterns-established:
  - "Viewer bridge pattern: sidebar.ts calls scene methods via game.scene.getScene('Viewer') as ViewerScene"
  - "Dual-scale preview: large container at (300,250) with pixelSize 6, small container at (520,520) with pixelSize 3"
  - "Manifest load pattern mirrors BootScene exactly: filecomplete-json event + spritesheet queue in preload"

requirements-completed: [VIEW-01, VIEW-02, VIEW-06]

# Metrics
duration: 4min
completed: 2026-03-29
---

# Phase 7 Plan 01: Sprite Viewer Shell Summary

**Vite multi-page dev tool at /viewer.html with Phaser canvas, HTML sidebar listing all 14 game sprites, and click-to-preview with dual-scale rendering and metadata panel**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-29T14:03:10Z
- **Completed:** 2026-03-29T14:07:07Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments
- Vite now serves viewer.html as a second entry point; navigating to /viewer.html works immediately in dev
- Sidebar lists all 9 characters and 5 troggles with green dot indicators for manifest-backed sprites
- Clicking any sprite renders it in Phaser canvas with large (pixelSize 6) + game-scale (pixelSize 3) side-by-side previews
- Metadata panel shows Name, Type, Has PNG, Frame Count, Frame Size for selected sprite
- All 244 existing tests continue to pass (pre-existing CharacterSprites.spec window error unchanged)

## Task Commits

Each task was committed atomically:

1. **Task 1: Vite multi-page config + viewer.html + types** - `02a6a65` (feat)
2. **Task 2: ViewerScene + main.ts with sprite rendering** - `d081fb8` (feat)
3. **Task 3: Sidebar with sprite roster and metadata panel** - `bd9b399` (feat)

## Files Created/Modified
- `vite.config.ts` - Added rollupOptions.input with main + viewer entries
- `viewer.html` - Flex-row shell: 280px sidebar + canvas-container, dark theme, pixelated canvas
- `src/viewer/types.ts` - ViewerState and SpriteListItem interfaces
- `src/viewer/main.ts` - Phaser game init in canvas-container, fetches sprites.json, calls initSidebar on ready
- `src/viewer/ViewerScene.ts` - Phaser scene key 'Viewer' with showCharacter, showSpritesheet, getMetadata
- `src/viewer/sidebar.ts` - DOM sidebar with full sprite roster, click handlers, metadata updates

## Decisions Made
- Used correct `drawTroggle(scene, container, type, P)` signature (plan had wrong arg order). Minor auto-corrected deviation.
- Sidebar initialization deferred to `game.events.once('ready')` so scene exists before sidebar tries to call getScene().
- `requestAnimationFrame` used in click handler before reading metadata — gives scene one frame to process the render.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected drawTroggle argument order**
- **Found during:** Task 2 (ViewerScene implementation)
- **Issue:** Plan specified `drawTroggle(name as TroggleType, this, container, 6)` but actual signature in TroggleSprites.ts is `drawTroggle(scene, container, type, P)` — type and scene are swapped
- **Fix:** Used the correct signature `drawTroggle(this, container, name as TroggleType, 6)` and `drawTroggle(this, container, name as TroggleType, 3)`
- **Files modified:** src/viewer/ViewerScene.ts
- **Verification:** TypeScript compiles correctly with proper argument order
- **Committed in:** d081fb8 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug in plan spec)
**Impact on plan:** Required fix for correctness — would have caused TypeScript type error and runtime crash. No scope creep.

## Issues Encountered
- Pre-existing test failure in `specs/ui/CharacterSprites.spec.ts` (`window is not defined` from Phaser's OS detection in Vitest/jsdom) — unchanged, not caused by this plan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Viewer shell complete and functional — Plan 02 can add animation controls (play/pause/step/speed slider) and file loading (drag-and-drop PNG) directly into the existing layout
- `#controls` div in sidebar is reserved for Plan 02's animation transport UI
- ViewerScene.showSpritesheet() method already in place for Plan 02's file-loading flow
- No blockers

---
*Phase: 07-sprite-viewer-dev-tool*
*Completed: 2026-03-29*
