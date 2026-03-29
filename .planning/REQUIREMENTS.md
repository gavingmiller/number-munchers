# Requirements: Number Munchers

**Defined:** 2026-03-28
**Core Value:** Kids practice math facts through engaging gameplay with meaningful progression

## v2.0 Requirements

Requirements for sprite viewer/editor milestone. Each maps to roadmap phases.

### Sprite Viewer

- [x] **VIEW-01**: Developer can open sprite viewer as a separate page
- [x] **VIEW-02**: Viewer displays all current game characters and troggles
- [ ] **VIEW-03**: Developer can load PNG sprite sheets from local directories
- [ ] **VIEW-04**: Developer can preview animation frames with play/pause/step controls
- [ ] **VIEW-05**: Developer can adjust animation speed and frame range
- [x] **VIEW-06**: Viewer shows sprite metadata (frame count, dimensions, name)

### Sprite System

- [x] **SPRT-01**: Sprite manifest maps character names to sprite sheets and animations
- [x] **SPRT-02**: Game loads PNG sprite sheets from manifest at runtime
- [x] **SPRT-03**: Characters with PNG sprites render from sheets instead of programmatic
- [x] **SPRT-04**: Characters without PNG sprites fall back to programmatic drawing
- [x] **SPRT-05**: Sprite manifest defines animation sequences per character

### Animation

- [ ] **ANIM-01**: Characters play idle animation when stationary
- [ ] **ANIM-02**: Characters play directional walk animation when moving
- [ ] **ANIM-03**: Characters play munch animation on correct answer
- [ ] **ANIM-04**: Troggles have movement animations matching their AI behavior

## Future Requirements

### Audio
- **SFX-01**: Sound effects for munch, wrong answer, troggle hit, level complete
- **MUS-01**: Background music per grade level

### New Characters
- **CHAR-01**: Waffle character (Flipper)
- **CHAR-02**: Alligator character (Al)
- **CHAR-03**: Milk jug character
- **CHAR-04**: Pizza character
- **CHAR-05**: Original Number Munchers throwback
- **CHAR-06**: Super Meat Boy

### Accessories
- **ACC-01**: Sunglasses, mustache, hair overlays

### Layout
- **LAY-01**: Horizontal iPhone layout
- **LAY-02**: Horizontal iPad layout

## Out of Scope

| Feature | Reason |
|---------|--------|
| Sprite editor (drawing tools) | Sprites authored externally, viewer is for preview/integration only |
| Server-side sprite storage | Local directories only, dev tool |
| In-game sprite gallery for kids | Dev tool only, not player-facing |
| Multiplayer | Not in project scope |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| SPRT-01 | Phase 6 | Complete |
| SPRT-02 | Phase 6 | Complete |
| SPRT-03 | Phase 6 | Complete |
| SPRT-04 | Phase 6 | Complete |
| SPRT-05 | Phase 6 | Complete |
| VIEW-01 | Phase 7 | Complete |
| VIEW-02 | Phase 7 | Complete |
| VIEW-03 | Phase 7 | Pending |
| VIEW-04 | Phase 7 | Pending |
| VIEW-05 | Phase 7 | Pending |
| VIEW-06 | Phase 7 | Complete |
| ANIM-01 | Phase 8 | Pending |
| ANIM-02 | Phase 8 | Pending |
| ANIM-03 | Phase 8 | Pending |
| ANIM-04 | Phase 8 | Pending |

**Coverage:**
- v2.0 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0

---
*Requirements defined: 2026-03-28*
*Last updated: 2026-03-28 after roadmap creation*
