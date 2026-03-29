# Phase 6: Sprite System Foundation - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Characters can render from PNG sprite sheets via a manifest, while existing programmatic sprites continue working as fallback. This phase builds the manifest format, Phaser loading pipeline, and rendering integration. It does NOT include the viewer dev tool (Phase 7) or in-game animations (Phase 8).

</domain>

<decisions>
## Implementation Decisions

### Manifest format
- Single `sprites.json` file at `public/sprites/sprites.json`
- Maps character names to sprite sheet paths and animation definitions
- Animations defined as named sequences with frame ranges: `{ "idle": [0, 3], "walkUp": [4, 7], "munch": [8, 11] }`
- Characters not in the manifest fall back to programmatic drawing
- Adding a new character = drop PNG in `public/sprites/{name}/` + add entry to `sprites.json`

### Sprite sheet format
- Fixed grid layout — all frames same size in a regular grid (Phaser `spritesheet` loader)
- Frame size: 64x64 pixels per frame
- Frames arranged left-to-right, top-to-bottom
- Phaser loads natively with `this.load.spritesheet()` using frameWidth/frameHeight config

### Asset organization
- Sprite PNGs live in `public/sprites/` (Vite serves as-is, Capacitor bundles, viewer accesses)
- Per-character directories: `public/sprites/box/sheet.png`, `public/sprites/claude/sheet.png`
- Manifest at `public/sprites/sprites.json`
- This location works for: local dev server, iOS app shell bundle, and sprite viewer

### Claude's Discretion
- Fixed grid vs texture atlas choice: going with fixed grid (simpler, Phaser native)
- Exact manifest JSON schema structure
- How to handle the Phaser preload/boot pipeline for dynamic sprite loading
- Error handling when sprite sheets are missing or corrupt

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing sprite system
- `src/ui/CharacterSprites.ts` — Current programmatic sprite rendering (drawCharacter dispatcher, fillPixels helper, 9 character draw functions)
- `src/ui/GridRenderer.ts` — Where player character is rendered in-game (drawCharacter call at grid cell positions)
- `src/types.ts` — CharacterType union type (9 characters), TroggleType union (5 troggles)

### Game state and rendering
- `src/scenes/GameScene.ts` — Game loop, creates GridRenderer with character type
- `src/scenes/CharacterSelectScene.ts` — Character selection, calls drawCharacter for previews
- `src/scenes/ShopScene.ts` — Shop character cards, calls drawCharacter for previews
- `src/constants.ts` — CELL_W (153px), CELL_H (80px) — grid cell dimensions that sprites must fit within

### Persistence
- `src/game/state/Persistence.ts` — CHARACTER_UNLOCK_ORDER, CHARACTER_PRICES — defines which characters exist

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `drawCharacter(scene, container, character, pixelSize)` — Central dispatch in CharacterSprites.ts, already handles all 9 character types. PNG path can branch here before falling through to programmatic drawing.
- `fillPixels(g, pixels, color, size, ox, oy)` — Graphics helper for programmatic sprites. Keep as fallback.
- `CharacterType` union type — Already defines all character names. Manifest keys should match these.

### Established Patterns
- Phaser `this.load.spritesheet(key, url, { frameWidth, frameHeight })` — Standard Phaser sprite sheet loading
- `Phaser.GameObjects.Sprite` — Can replace Graphics containers for PNG-based characters
- Scene `preload()` → `create()` lifecycle — Sprite sheets must be loaded in preload before use

### Integration Points
- `GridRenderer.ts` lines 113-117 — Where player character is drawn. Currently calls `drawCharacter()` into a container. Need to support both Sprite game objects and Graphics containers.
- `CharacterSelectScene.ts` — Character preview cards call drawCharacter. Need PNG previews too.
- `ShopScene.ts` — Shop cards call drawCharacter for unlocked characters.
- `DebugScene.ts` — Debug mode renders player character.

</code_context>

<specifics>
## Specific Ideas

- Sprites must work in three contexts: local Vite dev, iOS app shell (Capacitor), and the sprite viewer tool
- The viewer (Phase 7) will be able to browse external directories beyond `public/sprites/`
- Frame size is 64x64 — designed to scale into ~150x80 grid cells

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 06-sprite-system-foundation*
*Context gathered: 2026-03-28*
