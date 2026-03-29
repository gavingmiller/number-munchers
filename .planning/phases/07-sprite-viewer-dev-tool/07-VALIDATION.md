---
phase: 7
slug: sprite-viewer-dev-tool
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-29
---

# Phase 7 — Validation Strategy

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
| TBD | TBD | TBD | VIEW-01 | filesystem | `test -f viewer.html && test -f src/viewer/main.ts` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | VIEW-02 | manual | Browser: open /viewer.html, verify sidebar shows all sprites | N/A | ⬜ pending |
| TBD | TBD | TBD | VIEW-03 | manual | Browser: drag PNG onto viewer, verify frames display | N/A | ⬜ pending |
| TBD | TBD | TBD | VIEW-04 | manual | Browser: click play/pause/step, verify animation controls work | N/A | ⬜ pending |
| TBD | TBD | TBD | VIEW-05 | manual | Browser: adjust speed slider, verify playback rate changes | N/A | ⬜ pending |
| TBD | TBD | TBD | VIEW-06 | filesystem | `grep -q 'frame' src/viewer/` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `viewer.html` — Separate entry point for sprite viewer
- [ ] `src/viewer/main.ts` — Viewer Phaser game initialization
- [ ] Vite multi-page config update

*Existing vitest infrastructure covers framework setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Viewer page loads at /viewer.html | VIEW-01 | Requires browser | Run `npm run dev`, navigate to `http://localhost:5173/viewer.html` |
| All sprites appear in sidebar | VIEW-02 | Visual check | Verify sidebar lists all 9 characters + 5 troggles |
| Drag-and-drop PNG loading | VIEW-03 | Requires browser interaction | Drag a PNG onto the viewer canvas, verify frames appear |
| Animation play/pause/step | VIEW-04 | Requires browser interaction | Click transport controls, verify animation plays |
| Speed adjustment | VIEW-05 | Requires browser interaction | Move speed slider, verify playback rate changes |
| Metadata display | VIEW-06 | Visual check | Select a sprite, verify name/frame count/dimensions shown |
| Commit to Project persists | VIEW-03 | Requires filesystem + browser | Load PNG, click Commit, verify file appears in public/sprites/ |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 1s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
