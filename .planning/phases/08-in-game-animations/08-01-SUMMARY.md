---
phase: 08-in-game-animations
plan: "01"
subsystem: animation
tags: [animation, tdd, testable, no-phaser, troggle]
dependency_graph:
  requires: []
  provides: [AnimationController, troggleAnimName, AnimatableSprite]
  affects: [GridRenderer]
tech_stack:
  added: []
  patterns: [minimal-interface, tdd-red-green, animation-state-machine]
key_files:
  created:
    - src/ui/AnimationController.ts
    - specs/ui/AnimationController.spec.ts
  modified: []
decisions:
  - "AnimatableSprite minimal interface (no Phaser import) keeps AnimationController testable in vitest node environment"
  - "play() and playOnce() both guard on currentAnim === key to prevent duplicate sprite.play calls and stacked listeners"
  - "Null sprite constructor enables graceful dormancy for programmatic fallback path where no Phaser sprite exists"
  - "troggleAnimName uses Record<TroggleType, string> const map for exhaustive type coverage"
metrics:
  duration_minutes: 2
  completed_date: "2026-03-29"
  tasks_completed: 1
  files_created: 2
  files_modified: 0
---

# Phase 08 Plan 01: AnimationController and troggleAnimName Helper Summary

**One-liner:** Testable animation state machine (no-Phaser) with play/playOnce no-op guards, null-sprite dormancy, and TroggleType-to-animation-name mapping.

## What Was Built

`AnimationController` class with `AnimatableSprite` minimal interface pattern — mirrors the same testability approach used in `SpriteRegistry.ts`. The controller tracks `currentAnim` state and guards both `play()` and `playOnce()` against re-playing the same animation, preventing redundant Phaser `sprite.play()` calls and stacked `once()` listeners.

`troggleAnimName` helper maps each `TroggleType` to its locked animation name via a `Record<TroggleType, string>` const: reggie->crawl, fangs->slither, squirt->bounce, ember->flicker, bonehead->stalk.

21 tests cover all behaviors: state change guards, no-op behavior, playOnce callback registration, null sprite dormancy, and all 5 troggle animation name mappings.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | Failing tests for AnimationController | eb3d2aa | specs/ui/AnimationController.spec.ts |
| 1 (GREEN) | AnimationController implementation | 753bdd3 | src/ui/AnimationController.ts |

## Deviations from Plan

None — plan executed exactly as written.

**Pre-existing issue (out of scope):** `specs/ui/CharacterSprites.spec.ts` fails with `window is not defined` because `CharacterSprites.ts` imports Phaser directly. This was present before this plan and is logged to deferred-items.

## Decisions Made

1. **AnimatableSprite minimal interface** — no Phaser import, keeps module fully testable in vitest node environment. Same pattern as `SpriteRegistry.ts` `AnimScene` interface.
2. **Null sprite = graceful dormancy** — constructor accepts `AnimatableSprite | null`; all methods early-return when null. Supports programmatic fallback rendering path where no Phaser sprite exists.
3. **No-op guard on same key** — both `play()` and `playOnce()` check `key === currentAnim` before calling sprite methods, preventing stacked `once()` listeners and redundant animation restarts.
4. **Record<TroggleType, string> for troggle map** — exhaustive compile-time coverage of all TroggleType values; TypeScript will error if a new type is added without a corresponding entry.

## Self-Check: PASSED

- src/ui/AnimationController.ts — FOUND
- specs/ui/AnimationController.spec.ts — FOUND
- Commit eb3d2aa (RED: failing tests) — FOUND
- Commit 753bdd3 (GREEN: implementation) — FOUND
