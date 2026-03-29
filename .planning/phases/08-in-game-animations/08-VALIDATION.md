---
phase: 8
slug: in-game-animations
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `bun test` |
| **Full suite command** | `bun test` |
| **Estimated runtime** | ~100ms |

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
| TBD | TBD | TBD | ANIM-01 | unit | `bun test specs/ui/AnimationController.spec.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | ANIM-02 | unit | `bun test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | ANIM-03 | unit | `bun test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | ANIM-04 | unit | `bun test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `specs/ui/AnimationController.spec.ts` — tests for animation state management
- [ ] AnimationController class or module for tracking current animation state

*Existing vitest infrastructure covers framework setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Idle animation loops when player stationary | ANIM-01 | Requires visual check in running game | Load game with PNG-enabled character, stand still, verify idle animation loops |
| Walk animation plays per direction | ANIM-02 | Requires visual check | Move character in all 4 directions, verify directional walk animations |
| Munch animation plays on correct answer | ANIM-03 | Requires visual check | Munch a correct cell, verify chomp animation plays then returns to idle |
| Troggle animations match AI behavior | ANIM-04 | Requires visual check | Watch each troggle type move, verify unique animation style |
| System dormant without PNG sheets | All | Requires visual check | Play with character that has no sprite sheet, verify static programmatic rendering |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 1s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
