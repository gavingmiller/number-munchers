---
phase: 6
slug: sprite-system-foundation
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-28
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `bun test` |
| **Full suite command** | `bun test` |
| **Estimated runtime** | ~50ms |

---

## Sampling Rate

- **After every task commit:** Run `bun test`
- **After every plan wave:** Run `bun test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 1 second

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 06-01-T1 | 06-01 | 1 | SPRT-01, SPRT-05 | unit | `bun test specs/sprites/SpriteRegistry.spec.ts` | ❌ W0 | ⬜ pending |
| 06-01-T2 | 06-01 | 1 | SPRT-05 | filesystem | `test -f public/sprites/sprites.json` | ✅ | ⬜ pending |
| 06-01-T3 | 06-01 | 1 | SPRT-02 | filesystem | `file public/sprites/box/sheet.png \| grep PNG` | ❌ W0 | ⬜ pending |
| 06-02-T1 | 06-02 | 2 | SPRT-02, SPRT-03 | unit | `bun test specs/ui/CharacterSprites.spec.ts` | ❌ W0 | ⬜ pending |
| 06-02-T2 | 06-02 | 2 | SPRT-02, SPRT-04 | integration | `npx tsc --noEmit && bun test` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `specs/sprites/SpriteRegistry.spec.ts` — created by 06-01-T1 (TDD task, tests written first)
- [x] `public/sprites/box/sheet.png` — created by 06-01-T3 (generated with @napi-rs/canvas)
- [x] `public/sprites/sprites.json` — created by 06-01-T2 with box test entry
- [x] `specs/ui/CharacterSprites.spec.ts` — created by 06-02-T1 (TDD task, tests written first)

*Existing vitest infrastructure covers framework setup. All Wave 0 files are created by TDD tasks (tests-first) or dedicated asset tasks within their respective plans.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PNG sprite renders in grid cell | SPRT-02 | Requires visual check in running game | Run dev server (`npm run dev`), select box character, verify green test sprite displays in grid cell |
| Programmatic fallback works | SPRT-04 | Requires visual check | Select any character other than box (e.g. claude), verify programmatic sprite still renders correctly |
| BootScene loads manifest on startup | SPRT-02 | Phaser boot lifecycle not unit-testable | Open browser devtools Network tab, verify sprites.json and box/sheet.png are fetched on load |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 1s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
