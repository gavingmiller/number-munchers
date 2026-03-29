---
phase: 08-in-game-animations
plan: 02
subsystem: rendering
tags: [animations, grid-renderer, game-scene, png-sprites]
dependency_graph:
  requires: [08-01]
  provides: [in-game-animation-playback]
  affects: [src/ui/GridRenderer.ts, src/scenes/GameScene.ts]
tech_stack:
  added: []
  patterns: [animation-controller-integration, png-guard-pattern, troggle-anim-per-type]
key_files:
  created: []
  modified:
    - src/ui/GridRenderer.ts
    - src/scenes/GameScene.ts
decisions:
  - "playWalk called before gridRenderer.update in handleMove so animation trigger precedes position sync"
  - "playMunch called after gridRenderer.update in correct branch so animation starts after visual state update"
  - "playIdle in update loop (keyboard else branch) for return-to-idle on stationary player"
  - "playerSprite field removed from GridRenderer — AnimationController holds the sprite reference internally"
  - "troggle sprite animations guarded by currentAnim key check to avoid redundant play() calls each tick"
metrics:
  duration: 3 minutes
  completed_date: "2026-03-29"
  tasks_completed: 2
  files_modified: 2
---

# Phase 08 Plan 02: In-Game Animation Wiring Summary

**One-liner:** Animation-aware GridRenderer wires AnimationController to player and troggle PNG sprites, with walk/munch/idle triggers called from GameScene at the right game events.

## What Was Built

Plan 02 connects the AnimationController state machine (Plan 01) to the game's rendering pipeline. GridRenderer now detects PNG sprite sheets at runtime and, when present, creates Phaser Sprites managed by AnimationControllers. GameScene calls three new methods — `playWalk`, `playMunch`, `playIdle` — at the correct game event points.

### Key integration points:

- **GridRenderer.createPlayerSprite**: PNG branch creates a `Phaser.Sprite`, wraps it in `AnimationController`, plays idle if animation exists. Programmatic path unchanged.
- **GridRenderer.create (troggles)**: PNG branch adds troggle sprite to container, stores in `troggleData` map alongside container reference.
- **GridRenderer.syncTroggles**: When troggle is visible and has a sprite, plays type-specific anim (`crawl/slither/bounce/flicker/stalk`) guarded by `currentAnim` key to prevent redundant calls.
- **GridRenderer.update**: After position sync, returns player to idle if current anim is not idle/munch/walk.
- **GameScene.handleMove**: Calls `playWalk(dir)` before `gridRenderer.update()`.
- **GameScene.handleMunch**: Calls `playMunch()` after `gridRenderer.update()` on correct answer.
- **GameScene.update**: Calls `playIdle()` in the no-direction-key branch of the movement throttle.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused `playerSprite` field from GridRenderer**
- **Found during:** Task 2 (TypeScript check)
- **Issue:** The plan spec included `private playerSprite` field but it was only ever written, never read — AnimationController holds the sprite reference internally. TypeScript flagged `TS6133: playerSprite declared but never read`.
- **Fix:** Removed the field declaration and all assignments to it. AnimationController already holds the sprite, so GridRenderer doesn't need a redundant reference.
- **Files modified:** src/ui/GridRenderer.ts
- **Commit:** 1d1bbcd

All other TypeScript warnings (`CollisionSystem.spec.ts`, `Persistence.spec.ts`, `GameScene.ts ProblemResult`, unused imports in other scene files) are pre-existing and out of scope.

## Test Results

- 265 tests pass across 18 spec files
- 1 pre-existing failure: `specs/ui/CharacterSprites.spec.ts` — `window is not defined` (Phaser browser-only test, existed before this plan)
- No new test failures introduced

## Self-Check: PASSED

All claimed files exist and commits are present in git log.
