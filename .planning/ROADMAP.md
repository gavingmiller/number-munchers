# Roadmap: Number Munchers

## Milestones

- v1.0 Core Game - Phases 1-5 (shipped 2026-03-28, pre-GSD)
- v2.0 Sprite Viewer/Editor - Phases 6-8 (in progress)

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (6.1, 6.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

<details>
<summary>v1.0 Core Game (Phases 1-5) - SHIPPED 2026-03-28</summary>

Phases 1-5 completed informally before GSD adoption. See MILESTONES.md for details.

</details>

### v2.0 Sprite Viewer/Editor

**Milestone Goal:** Build a dev tool for viewing and animating PNG sprite sheets, and refactor the game's sprite system to support image-based characters alongside programmatic ones.

- [ ] **Phase 6: Sprite System Foundation** - Manifest-driven PNG sprite loading with programmatic fallback
- [ ] **Phase 7: Sprite Viewer Dev Tool** - Standalone page for previewing sprites and animations
- [ ] **Phase 8: In-Game Animations** - Frame-based character and troggle animations during gameplay

## Phase Details

### Phase 6: Sprite System Foundation
**Goal**: Characters can render from PNG sprite sheets via a manifest, while existing programmatic sprites continue working
**Depends on**: Nothing (first phase in v2.0; v1.0 game is stable)
**Requirements**: SPRT-01, SPRT-02, SPRT-03, SPRT-04, SPRT-05
**Success Criteria** (what must be TRUE):
  1. A sprite manifest file exists that maps character names to sprite sheet paths and animation definitions
  2. A character with a PNG sprite sheet renders from the sheet in-game instead of programmatic drawing
  3. A character without a PNG sprite sheet still renders correctly using the existing programmatic method
  4. Adding a new PNG sprite to the game requires only adding the image file and a manifest entry (no code changes)
**Plans:** 2 plans

Plans:
- [ ] 06-01-PLAN.md — SpriteRegistry module with manifest types, helpers, and tests
- [ ] 06-02-PLAN.md — BootScene manifest loading and drawCharacter PNG branch

### Phase 7: Sprite Viewer Dev Tool
**Goal**: Developer can open a standalone page to browse, load, and preview all sprites with animation controls
**Depends on**: Phase 6 (viewer reads the sprite manifest and renders PNG sheets)
**Requirements**: VIEW-01, VIEW-02, VIEW-03, VIEW-04, VIEW-05, VIEW-06
**Success Criteria** (what must be TRUE):
  1. Developer can navigate to a separate URL (not the game) and see a sprite viewer page
  2. All 9 characters and 5 troggles from the game appear in the viewer
  3. Developer can load a PNG sprite sheet from disk and see its frames displayed
  4. Developer can play, pause, and step through animation frames with adjustable speed
  5. Viewer displays metadata for each sprite (name, frame count, dimensions)
**Plans**: TBD

Plans:
- (plans not yet created)

### Phase 8: In-Game Animations
**Goal**: Characters and troggles play context-appropriate animations during gameplay
**Depends on**: Phase 6 (animations require PNG sprite sheet rendering pipeline)
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-04
**Success Criteria** (what must be TRUE):
  1. A PNG-enabled character plays an idle animation loop when standing still on a grid cell
  2. A PNG-enabled character plays a directional walk animation when moving between cells
  3. A PNG-enabled character plays a munch animation when the player selects a correct answer
  4. Troggles with PNG sprites animate in a way that matches their movement behavior (e.g., fangs slithers, reggie crawls)
**Plans**: TBD

Plans:
- (plans not yet created)

## Progress

**Execution Order:**
Phases execute in numeric order: 6 -> 6.1 -> 6.2 -> 7 -> 7.1 -> 8

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 6. Sprite System Foundation | v2.0 | 0/2 | Not started | - |
| 7. Sprite Viewer Dev Tool | v2.0 | 0/? | Not started | - |
| 8. In-Game Animations | v2.0 | 0/? | Not started | - |
