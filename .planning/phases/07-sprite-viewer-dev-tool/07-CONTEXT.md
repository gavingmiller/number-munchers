# Phase 7: Sprite Viewer Dev Tool - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Standalone dev tool page for browsing, loading, and previewing sprites with animation controls. Separate Vite entry point, not part of the game. Reads the sprites.json manifest from Phase 6. Does NOT implement in-game animations (Phase 8).

</domain>

<decisions>
## Implementation Decisions

### Viewer layout
- Sidebar + canvas layout: sprite name list on the left, large Phaser preview canvas on the right
- Click a sprite in the sidebar to load it into the preview canvas
- All 9 characters and 5 troggles from the game appear in the sidebar (from sprites.json manifest + programmatic sprites)

### Technology
- Separate Phaser game instance for the viewer (reuses the exact sprite rendering pipeline from Phase 6)
- Separate Vite entry point (e.g., `viewer.html` + `src/viewer/main.ts`)
- HTML sidebar for sprite list and controls (outside the Phaser canvas)

### File loading
- Drag-and-drop PNG files onto the viewer to load them
- File picker button as fallback
- Loaded sprites are **preview only** by default — not persisted to the project
- Explicit "Commit to Project" button copies the PNG into `public/sprites/{name}/` and adds a manifest entry to `sprites.json`
- Until committed, the sprite is only in the viewer's memory

### Animation controls
- Basic transport: play, pause, step forward/back
- Speed slider to adjust playback rate
- Frame counter showing current frame / total frames
- **Define animation ranges**: select a start and end frame, name it (e.g., "idle", "walkUp"), save to manifest
- Defined ranges can be committed to sprites.json alongside the sprite sheet

### Preview scale
- Side-by-side display: large zoomed preview on the main canvas, small game-scale preview in the corner
- Large preview for inspecting detail, game-scale preview for seeing how it looks in-situ

### Claude's Discretion
- Exact sidebar styling and width
- How the Phaser canvas and HTML sidebar are composed (iframe, flex layout, etc.)
- Frame selection UI (range slider, click-drag on timeline, numeric inputs)
- Error handling for invalid/corrupt PNGs

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Sprite system (Phase 6 output)
- `src/sprites/SpriteRegistry.ts` — Manifest types (SpriteManifest, SpriteManifestEntry, AnimationDef), helpers (setManifest, hasEntry, getEntry, animKey, registerAnimations)
- `public/sprites/sprites.json` — Current manifest format with box test entry
- `public/sprites/box/sheet.png` — Example 64x64 test sprite sheet

### Rendering
- `src/ui/CharacterSprites.ts` — drawCharacter dispatcher with PNG branch (textures.exists check)
- `src/constants.ts` — CELL_W (153), CELL_H (80), COLOR_BG, COLOR_CELL colors

### Build system
- `vite.config.ts` or `index.html` — Current Vite entry point (need to add multi-page config for viewer)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SpriteRegistry.ts` — Can be imported directly by the viewer to parse sprites.json
- `drawCharacter()` — Could be used to render programmatic sprites in the viewer for comparison
- `CharacterSprites.ts` fillPixels helper — For rendering programmatic sprite previews
- Phaser sprite loading pipeline from `BootScene.ts` — Pattern for loading spritesheets dynamically

### Established Patterns
- Phaser `this.load.spritesheet(key, url, { frameWidth: 64, frameHeight: 64 })` — Standard sheet loading
- `scene.anims.create()` + `scene.anims.generateFrameNumbers()` — Animation creation from Phase 6
- `scene.textures.exists(key)` — Check if texture is loaded

### Integration Points
- `public/sprites/sprites.json` — Viewer reads this manifest; "Commit to Project" writes to it
- `public/sprites/{name}/sheet.png` — Viewer's commit copies PNGs here
- `vite.config.ts` — Needs multi-page entry for `viewer.html`

</code_context>

<specifics>
## Specific Ideas

- "Commit to Project" button is key — preview without commitment, explicit save action
- Viewer should work as a dev-only tool, not shipped in the iOS app
- Side-by-side scale lets you inspect pixel-level detail while seeing game-scale appearance

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 07-sprite-viewer-dev-tool*
*Context gathered: 2026-03-29*
