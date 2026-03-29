# Phase 6: Sprite System Foundation - Research

**Researched:** 2026-03-28
**Domain:** Phaser 3 sprite sheet loading, manifest-driven asset pipeline, programmatic sprite fallback
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Single `sprites.json` manifest at `public/sprites/sprites.json`
- Animations defined as named sequences with frame ranges: `{ "idle": [0, 3], "walkUp": [4, 7], "munch": [8, 11] }`
- Fixed grid layout — frame size: 64x64 pixels per frame, arranged left-to-right top-to-bottom
- Per-character directories: `public/sprites/{name}/sheet.png`
- Phaser `this.load.spritesheet()` with `{ frameWidth: 64, frameHeight: 64 }`
- Characters not in the manifest fall back to programmatic drawing
- Asset location `public/sprites/` (works for Vite dev, iOS Capacitor bundle, and viewer)

### Claude's Discretion
- Exact manifest JSON schema structure
- How to handle the Phaser preload/boot pipeline for dynamic sprite loading
- Error handling when sprite sheets are missing or corrupt

### Deferred Ideas (OUT OF SCOPE)
- None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SPRT-01 | Sprite manifest maps character names to sprite sheets and animations | Manifest schema design, JSON structure, CharacterType key alignment |
| SPRT-02 | Game loads PNG sprite sheets from manifest at runtime | Phaser `this.load.spritesheet()` in BootScene preload, fetch-then-load pattern |
| SPRT-03 | Characters with PNG sprites render from sheets instead of programmatic | `drawCharacter` dispatch branch: PNG path checks TextureManager first |
| SPRT-04 | Characters without PNG sprites fall back to programmatic drawing | Existing `drawCharacter` switch/fallthrough preserved unchanged |
| SPRT-05 | Sprite manifest defines animation sequences per character | `anims.create()` + `generateFrameNumbers()` called after manifest loaded |
</phase_requirements>

---

## Summary

This phase adds a manifest-driven PNG sprite loading layer on top of the existing programmatic sprite system. The central challenge is that Phaser requires assets to be loaded during a scene's `preload()` lifecycle, but the manifest is a JSON file fetched at runtime — so the boot flow must fetch `sprites.json` first, then drive `this.load.spritesheet()` calls, then let scenes proceed to `create()`.

The existing `drawCharacter()` function in `CharacterSprites.ts` is the single dispatch point that all scenes (`GridRenderer`, `CharacterSelectScene`, `ShopScene`, `DebugScene`) call. Branching PNG vs. programmatic rendering here is the cleanest architectural seam: check whether the Phaser TextureManager has a texture keyed by the character name; if yes, create a `Phaser.GameObjects.Sprite`; if no, fall through to the existing `fillPixels` path. This requires no changes to any calling scene.

The primary complication is that `drawCharacter` currently takes a `Container` and draws into it with `Graphics` objects, while `Phaser.GameObjects.Sprite` is a standalone game object that positions itself absolutely. The PNG branch must add the `Sprite` to the container and ensure display-list ownership follows the same depth/visibility pattern as the Graphics approach.

**Primary recommendation:** Fetch and process the manifest in `BootScene.preload()` using `this.load.json()` + the `filecomplete` event, then iterate manifest entries to call `this.load.spritesheet()` for each. Register named animations in a `SpriteRegistry` module that `drawCharacter` consults. Keep all programmatic sprite functions exactly as-is.

---

## Standard Stack

### Core (all already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| phaser | 3.90.0 | Game engine — sprite loading, texture management, animation system | Already in use; `this.load.spritesheet()` and `AnimationManager` cover all needs |
| TypeScript | ~5.9.3 | Typed manifest interface, discriminated union for sprite source | Already in use |
| Vite | ^4.5.14 | Serves `public/` as-is; `sprites.json` and PNGs need zero config | Already in use |

### No New Dependencies
All required APIs (`this.load.json`, `this.load.spritesheet`, `this.anims.create`, `this.anims.generateFrameNumbers`, `this.add.sprite`, `scene.textures.exists`) ship with Phaser 3.90.0. No additional packages needed.

---

## Architecture Patterns

### Recommended Project Structure
```
public/
├── sprites/
│   ├── sprites.json          # manifest
│   ├── box/
│   │   └── sheet.png         # 64x64 grid, frames left-to-right
│   └── {character}/
│       └── sheet.png
src/
├── sprites/
│   └── SpriteRegistry.ts     # manifest type, load helpers, animation registration
├── ui/
│   └── CharacterSprites.ts   # modified: PNG branch before programmatic switch
└── scenes/
    └── BootScene.ts          # modified: fetch manifest + load spritesheets
```

### Pattern 1: Manifest Schema

**What:** A single JSON file declares which characters have PNG sheets and maps named animation sequences to frame ranges.

**When to use:** Always. All PNG-aware behavior derives from this.

**Example:**
```typescript
// src/sprites/SpriteRegistry.ts
// Source: designed for this project — CharacterType keys must match types.ts

export interface AnimationDef {
  frameRate?: number;   // defaults to 8 if omitted
  repeat?: number;      // defaults to -1 (loop) if omitted
  frames: [number, number]; // [startFrame, endFrame] inclusive
}

export interface SpriteManifestEntry {
  sheet: string;                        // relative path from public/sprites/{name}/
  frameWidth: number;                   // 64
  frameHeight: number;                  // 64
  animations: Record<string, AnimationDef>;
}

export type SpriteManifest = Partial<Record<string, SpriteManifestEntry>>;
```

**Manifest file example (`public/sprites/sprites.json`):**
```json
{
  "claude": {
    "sheet": "claude/sheet.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "animations": {
      "idle":    { "frames": [0, 3], "frameRate": 8, "repeat": -1 },
      "walkUp":  { "frames": [4, 7], "frameRate": 12, "repeat": -1 },
      "munch":   { "frames": [8, 11], "frameRate": 16, "repeat": 0 }
    }
  }
}
```

### Pattern 2: BootScene Manifest Load + Spritesheet Load

**What:** Phaser's `this.load.json()` + `filecomplete` event to load the manifest first, then dynamically queue spritesheet loads in the same `preload()` cycle.

**When to use:** This is the only Phaser-idiomatic way to do dynamic/manifest-driven loading. The `filecomplete` event fires during preload, before `create()`, so dynamically added loads still complete before `create()` runs.

**Example:**
```typescript
// Source: Phaser 3 Loader docs + SpriteSheetFile.js source (confirmed in installed node_modules)

preload(): void {
  // Step 1: load manifest as JSON
  this.load.json('sprite-manifest', 'sprites/sprites.json');

  // Step 2: when manifest arrives, queue the spritesheet loads in same preload cycle
  this.load.on('filecomplete-json-sprite-manifest', (_key: string, _type: string, data: SpriteManifest) => {
    for (const [name, entry] of Object.entries(data)) {
      this.load.spritesheet(name, `sprites/${entry.sheet}`, {
        frameWidth: entry.frameWidth,
        frameHeight: entry.frameHeight,
      });
    }
    // Store manifest for animation registration in create()
    this.registry.set('sprite-manifest', data);
  });
}

create(): void {
  const manifest = this.registry.get('sprite-manifest') as SpriteManifest | undefined;
  if (manifest) {
    SpriteRegistry.registerAnimations(this, manifest);
  }
  // proceed to MainMenu / GradeSelect as before
}
```

**Critical note:** The `filecomplete-json-{key}` event fires during the preload phase while the loader is still running. Files added in this callback are queued and loaded before `create()` is called. This is confirmed by Phaser 3.90 source — `LoaderPlugin` processes the queue in a loop and the event fires while the loop can still accept new files.

### Pattern 3: Animation Registration

**What:** After all spritesheets load, register named animations in Phaser's global `AnimationManager` using `anims.create()` + `anims.generateFrameNumbers()`.

**When to use:** Done once in `BootScene.create()`. Animations are globally available to all scenes via `this.anims` lookup.

**Example:**
```typescript
// Source: AnimationManager.js confirmed in Phaser 3.90 node_modules

export function registerAnimations(scene: Phaser.Scene, manifest: SpriteManifest): void {
  for (const [charName, entry] of Object.entries(manifest)) {
    for (const [animName, animDef] of Object.entries(entry.animations)) {
      const key = `${charName}-${animName}`; // e.g. "claude-idle"
      if (!scene.anims.exists(key)) {
        scene.anims.create({
          key,
          frames: scene.anims.generateFrameNumbers(charName, {
            start: animDef.frames[0],
            end: animDef.frames[1],
          }),
          frameRate: animDef.frameRate ?? 8,
          repeat: animDef.repeat ?? -1,
        });
      }
    }
  }
}
```

### Pattern 4: drawCharacter PNG Branch

**What:** Before falling through to the programmatic `switch`, check if the character has a loaded texture. If yes, create a `Phaser.GameObjects.Sprite` added to the container instead of a `Graphics` object.

**When to use:** This is the integration point. All 4 calling sites (`GridRenderer`, `CharacterSelectScene`, `ShopScene`, `DebugScene`) use `drawCharacter()` — no call sites need changing.

**Example:**
```typescript
// Source: designed for this project — CharacterSprites.ts modification

export function drawCharacter(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  character: CharacterType,
  pixelSize: number,
): void {
  // PNG branch: character has a loaded spritesheet texture
  if (scene.textures.exists(character)) {
    const sprite = scene.add.sprite(0, 0, character);
    // Scale 64x64 frame to approximate pixelSize-based size
    // pixelSize 4 => ~48px, pixelSize 6 => ~72px
    const targetSize = pixelSize * 12; // 12 = approx pixel grid width
    sprite.setDisplaySize(targetSize, targetSize);
    // Play idle animation if it exists; otherwise stay on frame 0
    const idleKey = `${character}-idle`;
    if (scene.anims.exists(idleKey)) {
      sprite.play(idleKey);
    }
    container.add(sprite);
    return;
  }

  // Programmatic fallback — unchanged
  switch (character) {
    case 'claude': drawClaude(scene, container, pixelSize); break;
    // ... rest unchanged
  }
}
```

### Pattern 5: SpriteRegistry Module

**What:** Central module that holds the loaded manifest and exposes helpers for manifest presence checks and animation key construction.

```typescript
// src/sprites/SpriteRegistry.ts
let _manifest: SpriteManifest = {};

export function setManifest(m: SpriteManifest): void {
  _manifest = m;
}

export function hasEntry(character: string): boolean {
  return character in _manifest;
}

export function animKey(character: string, animName: string): string {
  return `${character}-${animName}`;
}

export function getEntry(character: string): SpriteManifestEntry | undefined {
  return _manifest[character];
}
```

### Anti-Patterns to Avoid

- **Loading spritesheets in GameScene.preload():** Each scene restart re-runs preload. Duplicate texture keys print a Phaser warning but don't break anything — however, loading at boot is the right pattern for shared assets.
- **Using `this.load.json()` and then reading the result synchronously in the same `preload()`:** The JSON isn't available yet when preload() first executes. Must use the `filecomplete` event.
- **Calling `anims.create()` per-sprite at draw time:** Animation keys are global; creating once at boot is idiomatic and avoids "AnimationManager key already exists" console warnings.
- **Storing the sprite as a direct child of the scene instead of the container:** The container is what `GridRenderer` positions. Sprites added directly to the scene won't follow the container's x/y.
- **Using `setSize()` instead of `setDisplaySize()`:** `setSize()` changes the physics/hit body. `setDisplaySize()` changes only the visual scale.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Frame extraction from PNG | Custom canvas pixel reader | `this.load.spritesheet()` | Phaser handles all frame math, WebGL upload, power-of-2 textures |
| Animation state machine | Custom frame timer | `sprite.play()` + `scene.anims.create()` | Handles frame rate, repeat, yoyo, callbacks, delta-time correctly |
| Texture existence check | Custom Set of loaded keys | `scene.textures.exists(key)` | Phaser TextureManager is the source of truth |
| Frame range generation | Custom `Array(n).fill()` | `scene.anims.generateFrameNumbers({ start, end })` | Returns correctly typed `AnimationFrame[]` objects |
| Cross-scene animation registration | Per-scene `anims.create` calls | Global `anims` registered once in BootScene | Animations registered in AnimationManager are available in all scenes |

**Key insight:** Phaser's animation and texture systems are mature and handle all the edge cases (missing frames, power-of-2 padding, iOS WebGL texture limits). The only custom code needed is the manifest schema and the `drawCharacter` branch.

---

## Common Pitfalls

### Pitfall 1: Sprite Files Missing at Runtime
**What goes wrong:** `this.load.spritesheet()` silently fails if the PNG 404s — no exception, just a missing texture. `scene.textures.exists(key)` will return false.
**Why it happens:** Phaser loader treats missing files as non-fatal by default.
**How to avoid:** Listen to `this.load.on('loaderror', ...)` in BootScene and log or fall back gracefully. The `hasEntry()` check in `drawCharacter` means a missing PNG just uses the programmatic path.
**Warning signs:** Character renders as programmatic despite being in the manifest — check browser Network tab for 404.

### Pitfall 2: `filecomplete` Fires with Stale Manifest on Hot Reload
**What goes wrong:** During Vite HMR, `BootScene` re-runs. The `filecomplete-json-sprite-manifest` event may fire before the new manifest content is available if the browser cached the old JSON.
**Why it happens:** JSON responses can be cached without `Cache-Control: no-store`.
**How to avoid:** Vite dev server adds cache-busting headers for files in `public/`. In production (iOS app), there's no caching issue because the bundle is rebuilt. Not a blocker.

### Pitfall 3: Animation Key Collision Across Characters
**What goes wrong:** `anims.create({ key: 'idle', ... })` called twice prints a warning and the second call is silently ignored.
**Why it happens:** If animKey is `idle` not `claude-idle`, any second character with an `idle` animation overwrites nothing but prints a warning.
**How to avoid:** Always namespace animation keys: `${characterName}-${animationName}`. Confirmed pattern in `registerAnimations` example above.

### Pitfall 4: Container vs. Scene Ownership
**What goes wrong:** `scene.add.sprite(x, y, texture)` adds the sprite to the scene's display list but it's also added to a Container. Sprites can't have two parents in Phaser — adding to a Container implicitly removes from the scene display list.
**Why it happens:** `container.add(sprite)` handles this correctly — it re-parents the sprite. This is the correct pattern.
**How to avoid:** Always create sprite with `scene.add.sprite(0, 0, key)` then immediately `container.add(sprite)`. Do not set absolute x/y on the sprite since the container handles position.

### Pitfall 5: Phaser Scene Restart Reloads Assets
**What goes wrong:** `GameScene` calls `this.scene.restart()` at level transitions (confirmed in `GameScene.ts`). If spritesheets were loaded per-scene, each restart would re-queue them and print duplicate key warnings.
**Why it happens:** `preload()` runs on every scene start/restart.
**How to avoid:** Load all spritesheets in `BootScene` once. All other scenes inherit textures via the global `TextureManager`. The `scene.textures.exists(key)` check in `drawCharacter` confirms availability without re-loading.

### Pitfall 6: `pixelSize` to Display Size Mismatch
**What goes wrong:** The programmatic sprites use `pixelSize` (4 for in-game, 6 for previews) to scale their pixel-grid drawing. A PNG sprite needs to scale visually to match. Getting this wrong makes PNG characters visually inconsistent with grid-cell sizes.
**Why it happens:** The programmatic sprites draw on 10×12 or 12×12 grids scaled by pixelSize. A 64×64 PNG frame doesn't map to the same pixel area.
**How to avoid:** `CELL_W` is 153px, `CELL_H` is 80px. For in-game (pixelSize=4): programmatic sprites are ~48×48px to ~56×48px. The PNG sprite needs `setDisplaySize()` to target a similar footprint. A safe default: `Math.min(CELL_W, CELL_H) * 0.75` (~60px) for in-game, or derive from `pixelSize * 12`. Verify visually with a test sheet.

---

## Code Examples

Verified from Phaser 3.90.0 installed source (`node_modules/phaser`):

### Loading a Spritesheet
```typescript
// Source: SpriteSheetFile.js + LoaderPlugin docs in Phaser 3.90 source
this.load.spritesheet('claude', 'sprites/claude/sheet.png', {
  frameWidth: 64,
  frameHeight: 64,
  // optional: startFrame, endFrame for sub-ranges
});
```

### Creating a Named Animation
```typescript
// Source: AnimationManager.js confirmed in Phaser 3.90 node_modules
this.anims.create({
  key: 'claude-idle',
  frames: this.anims.generateFrameNumbers('claude', { start: 0, end: 3 }),
  frameRate: 8,
  repeat: -1, // loop
});
```

### Playing Animation on a Sprite
```typescript
// Source: Sprite.js + SpriteFactory.js in Phaser 3.90 node_modules
const sprite = this.add.sprite(0, 0, 'claude');
sprite.play('claude-idle');         // starts immediately
sprite.play('claude-idle', true);   // ignoreIfPlaying = true
```

### Checking Texture Existence
```typescript
// Source: TextureManager (used in GameObjects throughout Phaser source)
if (scene.textures.exists('claude')) {
  // texture is loaded and ready
}
```

### Fetching JSON + Dynamic Queue in preload()
```typescript
// Source: Phaser LoaderPlugin event 'filecomplete-{type}-{key}' — confirmed in Phaser event docs
preload() {
  this.load.json('sprite-manifest', 'sprites/sprites.json');
  this.load.on('filecomplete-json-sprite-manifest', (_k: string, _t: string, data: SpriteManifest) => {
    for (const [name, entry] of Object.entries(data)) {
      this.load.spritesheet(name, `sprites/${entry.sheet}`, {
        frameWidth: entry.frameWidth,
        frameHeight: entry.frameHeight,
      });
    }
  });
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `this.load.atlasXML()` for sprite sheets | `this.load.spritesheet()` for fixed grids | Phaser 2→3 | Fixed grid is simpler — no external atlas tool needed |
| Manual frame index tracking | `anims.generateFrameNumbers({ start, end })` | Phaser 3.0+ | Returns `AnimationFrame[]` array ready for `anims.create()` |
| Per-scene animation creation | Global `AnimationManager` registration | Phaser 3.0+ | Register once in Boot, available everywhere |

**Deprecated/outdated:**
- Texture Atlas (`.json` + `.png` pair via `this.load.atlas()`): more powerful but overkill for fixed-grid sprites. The locked decision correctly uses `spritesheet`.
- `sprite.animations.add()` (Phaser 2 API): replaced by `scene.anims.create()` + `sprite.play()`.

---

## Integration Points Summary

These are the exact files that need modification and why:

| File | Change | Scope |
|------|--------|-------|
| `src/scenes/BootScene.ts` | Add `preload()` that loads manifest JSON then queues spritesheets; `create()` registers animations and stores manifest in `SpriteRegistry` | New preload logic |
| `src/ui/CharacterSprites.ts` | Add PNG branch at top of `drawCharacter()` before the `switch` | ~10 lines |
| `src/sprites/SpriteRegistry.ts` | New file — manifest types, `setManifest`, `hasEntry`, `animKey`, `registerAnimations` | New file ~60 lines |
| `public/sprites/sprites.json` | New file — empty object `{}` initially; gains entries when PNG sheets exist | New file |
| `public/sprites/` | New directory — per-character subdirs with `sheet.png` | No code change |

Files with **no required changes**: `GridRenderer.ts`, `GameScene.ts`, `CharacterSelectScene.ts`, `ShopScene.ts`, `DebugScene.ts` — they all call `drawCharacter()` which handles the dispatch internally.

---

## Open Questions

1. **Scaling formula for PNG sprites vs. programmatic**
   - What we know: programmatic sprites use `pixelSize * 12` or `pixelSize * 10` for width. CELL_W=153, CELL_H=80. In-game pixelSize=4, preview pixelSize=6.
   - What's unclear: exact display size that looks visually consistent. A 64×64 PNG scaled to ~48px wide (pixelSize 4) matches most characters, but nyancat (14×10 grid) and mrpickle (8×14 grid) have unusual aspect ratios.
   - Recommendation: set `setDisplaySize(pixelSize * 12, pixelSize * 12)` as default, allow per-entry override in manifest (`displayWidth`, `displayHeight` optional fields). Validate visually with test sheet.

2. **Test sprite sheet availability**
   - What we know: STATE.md notes "No PNG sprite sheets exist yet — Phase 6 manifest can be built, but end-to-end testing needs at least one test sprite sheet."
   - What's unclear: Should Phase 6 create a minimal test sprite sheet for integration testing, or verify purely by manifest loading path?
   - Recommendation: Create one minimal 64×64 test sprite (e.g., solid-color frames for `box`) to verify the full pipeline end-to-end. The `box` character is the simplest — a solid rectangle — making it the easiest to produce a test PNG for.

3. **BootScene preload race: what if `sprites.json` is malformed?**
   - What we know: `this.load.json()` fires `loaderror` if parsing fails.
   - Recommendation: Treat manifest load failure as non-fatal — log a warning, skip sprite loading, let all characters fall back to programmatic. This keeps the game playable even with a broken manifest.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 0.34.6 |
| Config file | none — Vitest auto-discovers `specs/**/*.spec.ts` |
| Quick run command | `npm run test` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SPRT-01 | Manifest JSON validates correct shape; `hasEntry()` returns true for registered chars | unit | `npm run test -- specs/sprites/SpriteRegistry.spec.ts` | Wave 0 |
| SPRT-02 | `loadSpritesheets()` queues correct loader calls for each manifest entry | unit (mock scene) | `npm run test -- specs/sprites/SpriteRegistry.spec.ts` | Wave 0 |
| SPRT-03 | `drawCharacter()` returns early with PNG path when `textures.exists()` returns true | unit (mock scene) | `npm run test -- specs/ui/CharacterSprites.spec.ts` | Wave 0 |
| SPRT-04 | `drawCharacter()` calls programmatic `drawClaude` etc. when texture not found | unit (mock scene) | `npm run test -- specs/ui/CharacterSprites.spec.ts` | Wave 0 |
| SPRT-05 | `registerAnimations()` calls `anims.create()` for each animation entry in manifest | unit (mock scene) | `npm run test -- specs/sprites/SpriteRegistry.spec.ts` | Wave 0 |

**Note on testing approach:** The existing test pattern in this project (see `GridRenderer.spec.ts`) avoids mocking Phaser classes entirely — instead it extracts the pure logic under test and tests that. Apply the same pattern here: test `SpriteRegistry`'s manifest parsing and animation key generation with plain objects; test `drawCharacter`'s dispatch logic with a mock scene that has a `textures.exists()` stub.

### Sampling Rate
- **Per task commit:** `npm run test`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `specs/sprites/SpriteRegistry.spec.ts` — covers SPRT-01, SPRT-02, SPRT-05
- [ ] `specs/ui/CharacterSprites.spec.ts` — covers SPRT-03, SPRT-04
- [ ] `src/sprites/SpriteRegistry.ts` — the module under test (new file)

---

## Sources

### Primary (HIGH confidence)
- Phaser 3.90.0 source — `node_modules/phaser/src/loader/filetypes/SpriteSheetFile.js` — spritesheet loader API, frameConfig shape
- Phaser 3.90.0 source — `node_modules/phaser/src/animations/AnimationManager.js` — `create()`, `generateFrameNumbers()`, `exists()` signatures
- Phaser 3.90.0 source — `node_modules/phaser/src/gameobjects/sprite/SpriteFactory.js` — `scene.add.sprite()` factory
- Project source — `src/ui/CharacterSprites.ts` — existing `drawCharacter` dispatch, `fillPixels` helper
- Project source — `src/ui/GridRenderer.ts` — Container-based rendering, `createPlayerSprite` pattern
- Project source — `src/scenes/BootScene.ts` — current empty preload, integration point
- Project source — `src/types.ts` — `CharacterType` union (9 characters)
- Project source — `specs/ui/GridRenderer.spec.ts` — established test pattern (no Phaser mocking, extract logic)

### Secondary (MEDIUM confidence)
- Phaser 3 documentation pattern for `filecomplete-json-{key}` event — widely used community pattern, consistent with LoaderPlugin event naming in source

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from installed node_modules source
- Architecture: HIGH — derived from existing codebase patterns + Phaser source
- Pitfalls: HIGH — derived from actual code (restart behavior, container ownership) + Phaser source (animation key collision warning)

**Research date:** 2026-03-28
**Valid until:** 2026-06-28 (Phaser 3.x stable; manifest schema is project-internal)
