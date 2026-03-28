# Codebase Concerns

**Analysis Date:** 2026-03-28

## Test Coverage Gaps

**Scene/UI tests missing:**
- Files: `src/scenes/ShopScene.ts`, `src/scenes/HistoryScene.ts`, `src/scenes/SettingsScene.ts`
- Issue: No unit/integration tests for new UI scenes added for star economy, game history, and control settings
- Risk: Character unlock flow, star balance updates, and control style switching are not verified by automated tests
- Priority: **High** — user-facing features with state mutations
- Fix approach: Add scene tests following the pattern from Persistence.spec.ts; mock Phaser scene lifecycle and test card interactions (unlock flow, restart on settings change, etc.)

**Star economy edge cases:**
- Files: `src/game/state/Persistence.spec.ts`
- Issue: Tests cover happy path and basic failures (insufficient stars, already unlocked) but miss:
  - Concurrent unlock attempts (race conditions)
  - Large game history impact on localStorage size
  - Settings migration when control style not present
- Priority: **Medium** — unlikely in single-player but important for robustness
- Fix approach: Add tests for: multiple rapid unlocks, backup/restore scenarios, corrupted localStorage recovery

**Landscape mode untested:**
- Files: `src/main.ts`, `src/constants.ts`, `src/ui/DPad.ts`, `src/scenes/SettingsScene.ts`
- Issue: Canvas fixed at 768×1024 (portrait). No responsive layout or landscape orientation handling. iOS asset generation assumes portrait.
- Risk: iPad/landscape iPad games will have squeezed or distorted layouts; controls may become unusable
- Priority: **Medium** — affects tablet UX
- Fix approach: Test FIT scale mode under landscape; consider adding orientation detection + adaptive layout if supporting landscape is a goal

## Hardcoded Values & Magic Numbers

**Character unlock prices hardcoded:**
- Files: `src/game/state/Persistence.ts` lines 59-69
- Values: `axolotl: 100, marshmallow: 250, electricmouse: 500, robot: 1000, mrpickle: 2000, nyancat: 3500, claude: 5000, pusheen: 7500`
- Issue: Scattered across code. If balance changes needed, price data is not centralized. Changes require code recompile.
- Priority: **Low** — stable after launch, but affects future balance iterations
- Recommendation: Migrate to `src/game/config/CharacterBalance.ts` or similar; makes tuning easier without code changes

**Extra life score thresholds hardcoded:**
- Files: `src/game/state/ScoreTracker.ts` lines 7-8
- Values: `[1000, 10000]`
- Issue: Fixed array; no way to adjust difficulty without code change
- Priority: **Low** — gameplay tuning knob
- Fix approach: Move to difficulty config alongside level settings

**Troggle entry mechanics magic numbers:**
- Files: `src/game/state/GameState.ts` lines 125-130
- Values: `1000` ticks (Bonehead), randomized ranges `[80+i*40, 120+i*40]`
- Issue: Undocumented; tied to specific troggle types. Hard to tune without understanding tick math.
- Priority: **Low** — works but lacks documentation
- Recommendation: Extract to named constants in `GameState.ts` with comments explaining tick→time conversion

## Data Persistence Risks

**localStorage quota overflow potential:**
- Files: `src/game/state/Persistence.ts` lines 114-115
- Issue: Full `GameRecord` with `problems[]` array (all problem attempts) stored for every game. No size limit enforcement.
  - Typical game: ~50-100 problems → ~5-10KB per record
  - After 1000 games: ~5-10MB if each record stores all problems
  - Modern browsers: 5-10MB limit on localStorage (varies)
- Risk: History stops saving silently; user loses game history
- Priority: **Medium** — manifests only after extended play
- Fix approach:
  1. Add size monitoring: measure JSON before write, log warnings at 80%+ capacity
  2. Implement LRU eviction: keep only last 100 games by default, compress older records (truncate problems array)
  3. Test: `addGameRecord()` with large problems array, verify quota handling

**Unused unlock fields (future-proofing problem):**
- Files: `src/game/state/Persistence.ts` lines 37-38
- Fields: `unlockedThemes: string[]`, `unlockedMusic: string[]`
- Issue: Declared but never written/read. Shop UI shows "Themes — Coming Soon" etc. These fields occupy space but serve no purpose until implemented.
- Risk: Dead code; future implementer may not notice these exist and duplicate the state structure
- Priority: **Low** — organizational debt
- Fix approach: Extract unused fields to separate `FutureUnlocks` interface or document their intended use case in comments

**Settings migration incomplete:**
- Files: `src/game/state/Persistence.ts` lines 104-107
- Issue: One migration for missing settings (adds default `controlStyle`), but if new settings added later (e.g., volume, difficulty preset), migration chain grows unmaintainable
- Risk: Old saves missing new settings cause undefined behavior or crashes
- Priority: **Low** — manifests only when adding new settings
- Recommendation: Add versioning to PlayerData; track schema version and apply staged migrations

## Control Style Implementation Issues

**Two-handed munch button layout fragile on non-standard widths:**
- Files: `src/ui/DPad.ts` lines 66-96
- Issue: Hardcoded positions: `munchX = CANVAS_WIDTH - 150`. If canvas width changes, button positioning breaks. No responsive adjustment.
- Risk: New aspect ratio or landscape mode = broken button layout
- Priority: **Low** — currently fixed canvas, but limits flexibility
- Fix approach: Calculate offsets relative to safe area; use viewport-relative positioning

**Control style change requires scene restart:**
- Files: `src/scenes/SettingsScene.ts` line 134
- Issue: `this.scene.restart()` recreates entire SettingsScene, not just DPad. Overkill; flickers UI unnecessarily.
- Risk: Performance regression if Settings scene becomes heavier; potential loss of transient state
- Priority: **Low** — works but inefficient
- Fix approach: Add `updateControlStyle()` method to DPad to swap layout without full scene restart

## Known Bugs & Limitations

**Snake sprite direction (Fangs troggle):**
- Files: `src/ui/TroggleSprites.ts` line 116
- TODO comment: "Snake sprite should change view perspective based on movement direction (up, left, right, down)"
- Issue: Fangs always drawn facing one direction; doesn't rotate/mirror based on current movement direction
- Impact: Visual feedback incomplete; player can't read troggle direction at a glance
- Priority: **Low** — cosmetic; doesn't affect gameplay
- Fix approach: Pass `direction` to `drawFangs()`, add perspective logic for each cardinal direction

**Landscape orientation handling:**
- Files: All scene files
- Issue: No detection of `window.innerHeight < window.innerWidth` or orientation change events. Phaser scale mode is FIT, which scales but doesn't adapt layout.
- Risk: Tablet users in landscape get squeezed/stretched UI
- Priority: **Medium** — affects ~30% of tablet usage
- Workaround: No current mitigation
- Fix approach: Add orientation detection in BootScene; flag `isLandscape` in scene data; adapt canvas ratio and UI layout conditionally

## Performance Observations

**Grid rendering every tick:**
- Files: `src/ui/GridRenderer.ts` (inferred from GameScene update loop)
- Observation: Grid re-renders each frame even when grid state unchanged (only player moves every N ticks)
- Current impact: Acceptable (grid is small, 30 cells), but pattern is inefficient
- Priority: **Low** — pre-optimization (works fine now)
- Recommendation: Add dirty flag to grid state; only re-render when grid/player changes

**DPad button event listeners not cleaned up on scene transitions:**
- Files: `src/ui/DPad.ts` lines 51-60 (pointer events)
- Issue: `destroy()` removes game objects but listener callbacks may retain scene context references
- Current impact: Minimal (single-scene game flow is relatively clean), but pattern could leak memory in larger apps
- Priority: **Very low** — not observable in current codebase
- Recommendation: Verify scene cleanup in transition flow (MainMenu → Game → GameOver → MainMenu) for memory leaks

## Scaling & Growth Concerns

**Character unlock price curve not extensible:**
- Files: `src/game/state/Persistence.ts` lines 59-69
- Issue: 9 characters hardcoded in array. Adding 10th requires new entry + CHARACTER_UNLOCK_ORDER maintenance
- Priority: **Very low** — design-time addition, not runtime
- Recommendation: When adding 11+ characters, refactor to config-driven model

**Game history display limited to 10 games:**
- Files: `src/scenes/HistoryScene.ts` line 29, `src/game/state/Persistence.ts` line 126
- Issue: `getRecentGames(10)` hardcoded. No pagination or scrolling for games 11+.
- Risk: Users with >10 games see no history beyond last 10
- Priority: **Medium** — discovered after 10+ plays
- Fix approach: Implement scrollable history view (Phaser scrollable container or paginated display) + option to view all/filtered history

## Potential Security Issues

**localStorage data unencrypted:**
- Files: `src/game/state/Persistence.ts` lines 97, 115
- Issue: Game records stored as plaintext JSON in localStorage; includes all game attempts, scores, and progression
- Risk: Low (browser-scoped, no network transmission), but cheating is possible via dev console
- Priority: **Very low** — casual game, not competitive
- Mitigation: Client-side data is inherently untrusted; if leaderboards added, validate server-side

**No input validation on loaded PlayerData:**
- Files: `src/game/state/Persistence.ts` lines 99-111
- Issue: `JSON.parse()` assumes valid structure; no schema validation. Malformed data triggers try/catch, returns default (safe), but doesn't warn user.
- Risk: Silent data loss; user doesn't know if progress was lost due to corruption
- Priority: **Low** — unlikely (localStorage controlled by app only), but poor UX if it happens
- Fix approach: Add schema validation (zod/io-ts) before use; log warnings on migration/recovery

## Technical Debt Summary

| Area | Severity | Impact | Effort to Fix |
|------|----------|--------|---------------|
| Missing scene tests | High | Feature untested | Medium |
| localStorage quota | Medium | History loss after heavy play | Medium |
| Hardcoded prices/thresholds | Low | Balance tuning friction | Low |
| Landscape mode | Medium | Tablet UX broken | Medium |
| Unused unlock fields | Low | Dead code | Low |
| Settings migration | Low | Future scaling issue | Low |
| Control style restart | Low | Minor flicker | Low |
| Fangs sprite direction | Low | Cosmetic | Low |
| Game history pagination | Medium | Lost history after 10 games | Medium |
| Data validation | Low | Silent corruption | Low |

---

*Concerns audit: 2026-03-28*
