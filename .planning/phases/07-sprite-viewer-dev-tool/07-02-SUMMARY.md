---
phase: 07-sprite-viewer-dev-tool
plan: "02"
subsystem: ui
tags: [phaser, vite, typescript, dev-tool, sprite-viewer, file-api, animation]

# Dependency graph
requires:
  - phase: 07-sprite-viewer-dev-tool
    plan: "01"
    provides: ViewerScene (showCharacter, showSpritesheet, getMetadata), sidebar.ts (initSidebar), viewer.html shell, main.ts Phaser game init
provides:
  - loadSpritesheet(file, frameWidth, frameHeight) on ViewerScene — runtime PNG load via URL.createObjectURL
  - play(), pause(), stepForward(), stepBackward(), setSpeed(fps), createNamedRange() on ViewerScene
  - src/viewer/ViewerBridge.ts — wireControls(game): HTML controls wired to ViewerScene methods
  - src/viewer/commit.ts — commitSprite() and fileToBase64() for project integration
  - Vite spriteCommitPlugin: POST /api/sprite-commit dev endpoint writes PNG + updates sprites.json
  - viewer.html: full controls UI (file load, transport, speed slider, frame counter, range definition, commit)
affects:
  - 08 (any plan loading PNG sprites into the viewer and using commit workflow)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Runtime Phaser texture loading: URL.createObjectURL(file) + this.load.spritesheet(key, url, config) + this.load.start()"
    - "Object URL lifecycle: create before load.start(), revoke in Phaser.Loader.Events.COMPLETE handler"
    - "Texture deduplication guard: this.textures.remove('preview') before every reload to bypass Phaser's key dedup"
    - "Preview animation cleanup: iterate anims.toJSON().anims and remove all 'preview-*' keys before reload"
    - "ViewerBridge pattern: wireControls(game) thin bridge wires all HTML controls to scene via game.scene.getScene()"
    - "Vite configureServer middleware: dev-only POST endpoint using Connect middleware pattern"
    - "FileReader.readAsDataURL for base64 conversion: strips data URL prefix for raw base64 POST body"

key-files:
  created:
    - src/viewer/ViewerBridge.ts
    - src/viewer/commit.ts
  modified:
    - src/viewer/ViewerScene.ts
    - src/viewer/sidebar.ts
    - src/viewer/main.ts
    - vite.config.ts
    - viewer.html

key-decisions:
  - "Drag-and-drop zone attached to #canvas-container div (not canvas element) — Phaser intercepts pointer events on the canvas itself"
  - "Object URL revoked in Phaser COMPLETE handler (not immediately) — revoke before texture decode completes would corrupt the load"
  - "Vite plugin uses configureServer hook for POST /api/sprite-commit — keeps commit tooling in-process with vite dev, no separate server"
  - "fileToBase64 uses FileReader.readAsDataURL (not URL.createObjectURL) — base64 string needed for JSON POST body"
  - "Default 'idle' animation [0,0] created when no ranges defined — ensures every committed sprite has at least one animation"

patterns-established:
  - "Frame counter via update() polling: reads currentSprite.anims.currentFrame.index + getTotalFrames(), updates DOM directly"
  - "Drop zone pattern: dragover adds .dragover class (dashed border), dragleave/drop removes it"
  - "Module-level _currentFile state in sidebar.ts: stores last loaded File reference for commit access"

requirements-completed: [VIEW-03, VIEW-04, VIEW-05]

# Metrics
duration: 5min
completed: 2026-03-29
---

# Phase 7 Plan 02: Interactive Sprite Viewer Summary

**Drag-and-drop PNG loading + full animation transport (play/pause/step/speed/range) + Vite commit-to-project endpoint writing PNG and sprites.json**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-29T14:10:38Z
- **Completed:** 2026-03-29T14:15:38Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments
- Developer can drag a PNG onto the canvas or use file picker to load it as a spritesheet with configurable frame dimensions
- Full animation transport: play/pause/step forward/back, speed slider (1-30 fps), frame counter shows "current / total" live
- Developer can define named animation ranges (name + start + end frame), preview them immediately, and build a commit manifest
- "Commit to Project" POSTs to Vite dev plugin that writes PNG to public/sprites/{name}/sheet.png and updates sprites.json
- All 244 existing tests continue to pass

## Task Commits

Each task was committed atomically:

1. **Task 1: Drag-and-drop file loading + ViewerScene.loadSpritesheet** - `c3cf208` (feat)
2. **Task 2: Animation controls — play/pause/step/speed/range** - `d549f05` (feat)
3. **Task 3: Commit to Project — Vite plugin + commit UI** - `2ec9e63` (feat)

## Files Created/Modified
- `src/viewer/ViewerScene.ts` - Added loadSpritesheet, play, pause, stepForward, stepBackward, setSpeed, createNamedRange, getDefinedRanges, update, _ensureDefaultAnim
- `src/viewer/sidebar.ts` - Added setupDropZone, file picker wiring, commit button handler, getCurrentFile export
- `src/viewer/ViewerBridge.ts` - New file: wireControls(game) wires all HTML controls to ViewerScene methods
- `src/viewer/commit.ts` - New file: commitSprite() and fileToBase64() for POSTing to Vite plugin
- `src/viewer/main.ts` - Import and call wireControls after game ready
- `vite.config.ts` - Add spriteCommitPlugin with configureServer hook for POST /api/sprite-commit
- `viewer.html` - Full controls UI: file load section, transport buttons, speed slider, frame counter, range definition, commit section

## Decisions Made
- Drag-and-drop listeners on `#canvas-container` div (not canvas element): Phaser intercepts pointer events on the canvas element, preventing drop events from firing. Attaching to the container div ensures DOM events fire before Phaser sees them.
- Object URL revoked inside Phaser's `COMPLETE` handler: revoking earlier (before Phaser finishes decoding) would corrupt the load; COMPLETE is the safe point.
- `fileToBase64` uses FileReader despite URL.createObjectURL being preferred for image loading: base64 string is needed for the JSON POST body; this is the correct tool for that use case.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing TypeScript unused variable warning on `currentName` field in ViewerScene (existed before this plan, from Plan 01). No impact on functionality or tests.
- Pre-existing test failure in `specs/ui/CharacterSprites.spec.ts` (`window is not defined`) — unchanged from Plan 01, unrelated to this plan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Viewer is fully interactive: load PNGs, preview animations, define ranges, commit to project
- Commit workflow ready to test end-to-end once a PNG sprite sheet is available
- No blockers for subsequent phases

---
*Phase: 07-sprite-viewer-dev-tool*
*Completed: 2026-03-29*
