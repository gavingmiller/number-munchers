---
phase: 6
slug: sprite-system-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
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
| TBD | TBD | TBD | SPRT-01 | unit | `bun test specs/state/SpriteManifest.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SPRT-02 | integration | `bun test` + visual check | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SPRT-03 | integration | visual check (PNG renders in-game) | N/A | ⬜ pending |
| TBD | TBD | TBD | SPRT-04 | unit | `bun test` (existing tests still pass) | ✅ | ⬜ pending |
| TBD | TBD | TBD | SPRT-05 | unit | `bun test specs/state/SpriteManifest.spec.ts` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `specs/state/SpriteManifest.spec.ts` — tests for manifest loading, validation, character lookup
- [ ] `public/sprites/box/sheet.png` — minimal test sprite sheet (solid color frames, 64x64 grid)
- [ ] `public/sprites/sprites.json` — initial manifest with box character entry

*Existing vitest infrastructure covers framework setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PNG sprite renders in grid cell | SPRT-02 | Requires visual check in running game | Load game, select character with PNG sheet, verify sprite displays in grid |
| Programmatic fallback works | SPRT-04 | Requires visual check | Select character without PNG sheet, verify programmatic sprite still renders |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 1s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
