# Phase 7: Sprite Viewer Dev Tool - Research

**Researched:** 2026-03-29
**Domain:** Vite multi-page app, Phaser 3 dynamic texture loading, HTML5 File API, dev tooling
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Sidebar + canvas layout: sprite name list on the left, large Phaser preview canvas on the right
- Click a sprite in the sidebar to load it into the preview canvas
- All 9 characters and 5 troggles from the game appear in the sidebar (from sprites.json manifest + programmatic sprites)
- Separate Phaser game instance for the viewer (reuses the exact sprite rendering pipeline from Phase 6)
- Separate Vite entry point: `viewer.html` + `src/viewer/main.ts`
- HTML sidebar for sprite list and controls (outside the Phaser canvas)
- Drag-and-drop PNG files onto the viewer canvas area to load them
- File picker button as fallback
- Loaded sprites are **preview only** by default — not persisted to the project
- Explicit "Commit to Project" button copies the PNG into `public/sprites/{name}/` and adds a manifest entry to `sprites.json`
- Until committed, the sprite is only in the viewer's memory
- Basic transport: play, pause, step forward/back
- Speed slider to adjust playback rate
- Frame counter showing current frame / total frames
- Define animation ranges: select start/end frame, name it (e.g., "idle", "walkUp"), save to manifest
- Defined ranges can be committed to sprites.json alongside the sprite sheet
- Side-by-side display: large zoomed preview on the main canvas, small game-scale preview in the corner

### Claude's Discretion
- Exact sidebar styling and width
- How the Phaser canvas and HTML sidebar are composed (iframe, flex layout, etc.)
- Frame selection UI (range slider, click-drag on timeline, numeric inputs)
- Error handling for invalid/corrupt PNGs

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VIEW-01 | Developer can open sprite viewer as a separate page | Vite multi-page config adds `viewer.html` as second entry point; dev server serves it at `/viewer.html` immediately |
| VIEW-02 | Viewer displays all current game characters and troggles | SpriteRegistry + CharacterType/TroggleType unions provide the full roster; 9 characters + 5 troggles rendered via existing drawCharacter + drawTroggle functions |
| VIEW-03 | Developer can load PNG sprite sheets from local directories | HTML5 drag-and-drop (dragover/drop events) + file picker (`<input type="file">`) → `URL.createObjectURL(file)` → `this.load.spritesheet(key, objectURL, config)` + `this.load.start()` |
| VIEW-04 | Developer can preview animation frames with play/pause/step controls | Phaser `sprite.play()`, `sprite.anims.pause()`, `sprite.anims.nextFrame()`, `sprite.anims.previousFrame()` — all standard Phaser 3.90.0 API |
| VIEW-05 | Developer can adjust animation speed and frame range | `sprite.anims.msPerFrame` for speed; `anims.create()` with custom `start`/`end` frames for range definition |
| VIEW-06 | Viewer shows sprite metadata (frame count, dimensions, name) | From `SpriteManifestEntry` (frameWidth, frameHeight, animations) + `this.textures.get(key).frameTotal` at runtime |
</phase_requirements>

---

## Summary

Phase 7 builds a standalone developer tool as a second Vite entry point (`viewer.html`). It is not shipped in the iOS app and does not touch the game build. The viewer has two distinct modes: browsing the existing game roster (all 9 characters and 5 troggles, programmatic or PNG) and loading external PNGs via drag-and-drop for preview and optional project integration.

The core technical challenge is dynamic texture loading in Phaser at runtime — after scene creation, outside of `preload()`. Phaser 3.90.0 supports this via `URL.createObjectURL(file)` passed to `this.load.spritesheet()` followed by `this.load.start()`, or directly via `this.textures.addSpriteSheet(key, htmlImageElement, config)` on the TextureManager. Both patterns are verified against official Phaser docs.

The layout is straightforward: a flex-row HTML shell with a fixed-width sidebar div and a Phaser canvas div. The Phaser game instance is mounted inside the canvas div. Controls (play/pause, speed, frame range input) live in the HTML sidebar, outside Phaser, communicating with the active scene via a shared state object or direct scene method calls via `game.scene.getScene('ViewerScene')`.

**Primary recommendation:** Use flex-row HTML layout with Phaser mounted in `#canvas-container`, dynamic textures via `URL.createObjectURL` + `this.load.spritesheet` + `this.load.start()`, and sidebar controls wired to scene methods through a thin JS bridge.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Phaser | 3.90.0 (installed) | Sprite rendering, animation playback | Already in project; viewer reuses same pipeline as Phase 6 |
| Vite | 4.5.14 (installed) | Multi-page build + dev server | Already configured; MPA support is native via `rollupOptions.input` |
| TypeScript | 5.9.3 (installed) | Type safety | Project standard; tsconfig.json already strict |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Browser File API | Native | Drag-and-drop + file picker | Reading dropped PNGs into memory |
| URL.createObjectURL | Native | Create loadable URL from File object | Pass to Phaser loader as URL |
| Fetch API | Native | Read/write sprites.json on dev server | "Commit to Project" writes manifest |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `URL.createObjectURL` | `FileReader.readAsDataURL` (base64) | base64 is 33% larger and blocks main thread; object URLs are preferred per MDN |
| HTML sidebar + Phaser canvas | Phaser-only UI | Phaser HTML UI elements are verbose; native HTML is simpler for sidebar controls |
| `this.load.spritesheet` + `load.start()` | `textures.addSpriteSheet(key, img, config)` | Both work; loader approach auto-handles CORS/blob lifecycle; TextureManager direct is lighter for already-decoded images |

**Installation:** No new packages needed. All required libraries are already installed.

---

## Architecture Patterns

### Recommended Project Structure
```
viewer.html                          # Second Vite entry point (root level)
src/viewer/
├── main.ts                          # Creates Phaser.Game, mounts into #canvas-container
├── ViewerScene.ts                   # Phaser Scene: preview canvas, sprite display, animation
├── ViewerBridge.ts                  # Thin bridge: HTML controls <-> ViewerScene methods
├── sidebar.ts                       # Sidebar DOM: character list, controls, file picker
└── types.ts                         # ViewerState, LoadedSprite interfaces (viewer-specific)
```

### Pattern 1: Vite Multi-Page Config
**What:** Add `viewer.html` as a second Rollup input entry point. Vite dev server serves it at `/viewer.html` without any other config.
**When to use:** Any time a project needs a second independent HTML page.
**Example:**
```typescript
// vite.config.ts — add rollupOptions.input
import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { host: true },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        viewer: resolve(__dirname, 'viewer.html'),
      },
      output: {
        manualChunks: { phaser: ['phaser'] },
      },
    },
  },
});
```
Dev: navigate to `http://localhost:5173/viewer.html`. No extra config needed.

### Pattern 2: Phaser Game in a Div
**What:** Mount Phaser's canvas inside a specific DOM element instead of `document.body`. This enables flex layout with a sidebar.
**When to use:** Any time Phaser must coexist with non-Phaser HTML.
**Example:**
```typescript
// src/viewer/main.ts
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'canvas-container',   // <-- key: mount into this div
  width: 600,
  height: 600,
  backgroundColor: 0x1a1a2e,
  render: { pixelArt: true, roundPixels: true },
  scene: [ViewerScene],
};
new Phaser.Game(config);
```

### Pattern 3: Runtime Spritesheet Loading from File
**What:** Load a dropped PNG file as a Phaser spritesheet after scene creation, using `URL.createObjectURL` + `this.load.spritesheet` + `this.load.start()`.
**When to use:** Any time you need to load a texture from a user-provided File object.
**Example:**
```typescript
// Inside ViewerScene.ts
loadSpritesheet(file: File, frameWidth: number, frameHeight: number): void {
  const key = `preview-${Date.now()}`;
  const objectURL = URL.createObjectURL(file);

  // Remove previous preview texture to avoid key collisions
  if (this.textures.exists('preview')) {
    this.textures.remove('preview');
  }

  this.load.spritesheet('preview', objectURL, { frameWidth, frameHeight });
  this.load.once(Phaser.Loader.Events.COMPLETE, () => {
    URL.revokeObjectURL(objectURL);  // Release memory once loaded
    this.onPreviewLoaded('preview', frameWidth, frameHeight);
  });
  this.load.start();
}
```

### Pattern 4: HTML Controls → Phaser Scene Bridge
**What:** HTML sidebar controls call scene methods through `game.scene.getScene()`. The scene exposes a clean API instead of Phaser internals leaking into sidebar code.
**When to use:** Whenever HTML elements need to control a running Phaser scene.
**Example:**
```typescript
// ViewerBridge.ts
export function wireSidebar(game: Phaser.Game): void {
  const scene = () => game.scene.getScene('Viewer') as ViewerScene;

  document.getElementById('btn-play')!.onclick = () => scene().play();
  document.getElementById('btn-pause')!.onclick = () => scene().pause();
  document.getElementById('btn-step-fwd')!.onclick = () => scene().stepForward();
  document.getElementById('speed-slider')!.oninput = (e) => {
    const val = parseFloat((e.target as HTMLInputElement).value);
    scene().setSpeed(val);
  };
}
```

### Pattern 5: Drag-and-Drop onto the Canvas Container
**What:** Listen for dragover/drop events on the canvas container div (not the Phaser canvas itself, to avoid Phaser consuming the event).
**When to use:** File drop targets in a hybrid HTML/Phaser layout.
**Example:**
```typescript
// sidebar.ts
export function setupDropZone(
  dropEl: HTMLElement,
  onFile: (file: File) => void
): void {
  dropEl.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer!.dropEffect = 'copy';
  });
  dropEl.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file && file.type === 'image/png') {
      onFile(file);
    }
  });
}
```

### Pattern 6: Commit to Project (Write sprites.json)
**What:** The Vite dev server is a local Node process. Write the sprite sheet to `public/sprites/{name}/sheet.png` by POSTing to a custom Vite plugin endpoint, or use the `/@fs/` path with a fetch PUT. The simplest approach in dev-only mode is a small Vite server plugin.
**When to use:** "Commit to Project" button.
**Vite plugin approach:**
```typescript
// vite.config.ts — add a dev-only commit endpoint
import fs from 'node:fs';
import path from 'node:path';

const spriteCommitPlugin = {
  name: 'sprite-commit',
  configureServer(server) {
    server.middlewares.use('/api/commit-sprite', async (req, res) => {
      if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
      // Read body, write PNG + update sprites.json
      // ...
      res.end(JSON.stringify({ ok: true }));
    });
  },
};
```

### Anti-Patterns to Avoid
- **Mounting Phaser on document.body in the viewer:** Prevents flex sidebar layout. Use `parent: 'canvas-container'` instead.
- **Using `FileReader.readAsDataURL` for large PNGs:** Encodes to base64 (33% overhead) and blocks main thread. Use `URL.createObjectURL` instead.
- **Forgetting `URL.revokeObjectURL()`:** Object URLs hold a reference to the File in memory until explicitly released. Revoke in the `COMPLETE` event callback.
- **Reusing Phaser animation keys without removing old texture:** `this.load.spritesheet(existingKey, ...)` with an already-loaded key silently no-ops. Call `this.textures.remove(key)` before reloading.
- **Keeping viewer in the iOS build:** `viewer.html` must not ship in Capacitor. Exclude it from `capacitor.config.ts` or use a build flag.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| PNG frame slicing / atlas building | Custom canvas slicer | Phaser TextureManager (`addSpriteSheet`) | Handles frame math, edge cases, spacing/margin |
| Animation playback state machine | Custom requestAnimationFrame loop | `sprite.play()`, `sprite.anims.pause()`, `sprite.anims.nextFrame()` | Phaser handles frame timing, repeat, events |
| File type validation | Magic byte reader | `file.type === 'image/png'` check + `img.onerror` handler | Browser image decoder provides reliable error on corrupt files |
| Sprite key namespace | Custom UUID generator | `Date.now()` or incremental counter prefix | Unique enough for a single-session dev tool |

**Key insight:** The viewer is a thin shell over existing Phaser rendering infrastructure. The more it delegates to Phaser's built-in animation/texture system, the less frame-math logic needs testing.

---

## Common Pitfalls

### Pitfall 1: Phaser Loader Silently Skips Already-Loaded Keys
**What goes wrong:** Calling `this.load.spritesheet('preview', url, config)` when `'preview'` is already in the TextureManager does nothing — no error, no reload.
**Why it happens:** Phaser deduplicates load keys to avoid double-loading. The viewer loads different files with the same preview key.
**How to avoid:** Before every load, call `if (this.textures.exists('preview')) { this.textures.remove('preview'); }` then proceed with the load.
**Warning signs:** Preview canvas doesn't update when dropping a new file.

### Pitfall 2: Animation Key Collision in Viewer vs. Game
**What goes wrong:** If the viewer uses the same Phaser AnimationManager as the main game (they don't — separate game instances — but if the viewer reuses `animKey()` format), committing an animation with `box-idle` could theoretically conflict.
**Why it happens:** N/A here — the viewer is a separate `new Phaser.Game()` instance with its own AnimationManager. Not a real risk, but worth confirming.
**How to avoid:** The viewer creates its own `Phaser.Game` instance in `src/viewer/main.ts`. Confirmed: separate instance = isolated AnimationManager.

### Pitfall 3: Object URL Not Revoked
**What goes wrong:** Each drag-drop creates a new object URL pointing to a File blob. If never revoked, memory accumulates across the session.
**Why it happens:** `URL.createObjectURL()` holds a strong reference to the File until `revokeObjectURL()` is called.
**How to avoid:** Call `URL.revokeObjectURL(objectURL)` inside the `Phaser.Loader.Events.COMPLETE` handler.
**Warning signs:** Dev tools memory profiler shows growing blob references.

### Pitfall 4: Phaser Canvas Captures Drop Events
**What goes wrong:** The Phaser canvas has `touch-action: none` and Phaser may intercept pointer events, preventing `drop` events from firing on the canvas element.
**Why it happens:** Phaser registers its own input handlers on the canvas.
**How to avoid:** Attach the drag-and-drop listeners to the *containing div* (`#canvas-container`), not the canvas element itself. The div receives DOM events before they reach the canvas.

### Pitfall 5: viewer.html Included in Capacitor iOS Build
**What goes wrong:** The Capacitor webDir points to `dist/`, which would include `viewer.html` and its Phaser bundle in the iOS app, bloating the bundle.
**Why it happens:** Vite builds all entry points by default.
**How to avoid:** Either (a) use a separate Vite build command (`vite build --config vite.viewer.config.ts`) that excludes the viewer from the main build, or (b) add a `postbuild` script that deletes `dist/viewer.html` before Capacitor copies. Option (b) is simpler. Document this in the viewer's README comment.

### Pitfall 6: tsconfig.json Missing src/viewer
**What goes wrong:** TypeScript does not type-check `src/viewer/` files since `tsconfig.json` only `include`s `["src", "specs", "capacitor.config.ts"]` — wait, it does include `src` as a directory glob, so all files under `src/` are covered. Not actually a pitfall.
**Warning signs:** N/A — `"include": ["src"]` covers all `src/**` automatically.

### Pitfall 7: Frame Range UI Disconnected from Phaser Animation
**What goes wrong:** Defining a named animation range in the HTML sidebar doesn't automatically make Phaser play that range — you must call `scene.anims.create(...)` with the new range, then `sprite.play(newKey)`.
**Why it happens:** Phaser animations are immutable after creation; creating a new named animation is required.
**How to avoid:** When the user defines a range, call `this.anims.remove(key)` if it exists, then `this.anims.create({ key, frames: generateFrameNumbers(start, end), frameRate, repeat })`, then play it.

---

## Code Examples

Verified patterns from official Phaser 3.90.0 sources:

### Animation Playback Control
```typescript
// Source: Phaser 3 AnimationState API
sprite.play('box-idle');                   // start playing
sprite.anims.pause();                      // freeze on current frame
sprite.anims.resume();                     // unpause
sprite.anims.nextFrame();                  // step +1 frame
sprite.anims.previousFrame();             // step -1 frame
sprite.anims.msPerFrame = 1000 / fps;      // change speed (msPerFrame = 1000/frameRate)
sprite.anims.currentFrame.index;          // 0-based current frame index
sprite.anims.getTotalFrames();            // total frame count
```

### Frame Counter Display
```typescript
// Inside Phaser scene's update() or via anims event
this.sprite.on(Phaser.Animations.Events.ANIMATION_UPDATE, () => {
  const current = this.sprite.anims.currentFrame.index + 1;
  const total = this.sprite.anims.getTotalFrames();
  // Post to HTML bridge
  document.getElementById('frame-counter')!.textContent = `${current} / ${total}`;
});
```

### Dynamic Animation Range Creation
```typescript
// Define a named range from frame 2 to frame 7
createNamedRange(key: string, name: string, start: number, end: number, fps: number): void {
  const animKey = `${key}-${name}`;
  if (this.anims.exists(animKey)) {
    this.anims.remove(animKey);
  }
  this.anims.create({
    key: animKey,
    frames: this.anims.generateFrameNumbers(key, { start, end }),
    frameRate: fps,
    repeat: -1,
  });
  this.sprite.play(animKey);
}
```

### Read sprites.json at Viewer Startup
```typescript
// src/viewer/main.ts — fetch manifest before creating Phaser game
const manifest: SpriteManifest = await fetch('/sprites/sprites.json')
  .then(r => r.json())
  .catch(() => ({}));
// Pass to ViewerScene via game registry or scene data
```

### Side-by-Side Scale: Large + Small Preview
```typescript
// ViewerScene.ts — two sprites in the scene
// Large preview sprite (zoom 4x)
this.previewLarge = this.add.sprite(300, 300, key);
this.previewLarge.setScale(4);

// Small game-scale sprite (corner, 1x = actual game scale)
this.previewSmall = this.add.sprite(560, 560, key);
this.previewSmall.setScale(1);  // game-scale reference
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `FileReader.readAsDataURL` (base64) | `URL.createObjectURL(file)` | ~2015, widely adopted 2018+ | 33% smaller, non-blocking |
| Phaser 3 `load.image` only at preload | `load.start()` at runtime | Phaser 3.0+ | Dynamic loading fully supported |
| `document.body` as Phaser parent | `parent: 'divId'` in GameConfig | Phaser 3.0+ | Enables DOM layouts alongside canvas |
| Separate CSS file for dev tools | Inline `<style>` in viewer.html | N/A for dev tools | Simpler for a single-file dev page |

**Deprecated/outdated:**
- `FileReader.readAsArrayBuffer` → `URL.createObjectURL`: older tutorials use FileReader; use object URLs for image loading
- Phaser 2 approach of manual canvas context manipulation: all handled by TextureManager in Phaser 3

---

## Open Questions

1. **"Commit to Project" write mechanism**
   - What we know: The viewer runs in Vite dev server (a Node process). Writing to `public/sprites/` from browser fetch requires either a Vite server plugin providing a POST endpoint, or a separate tiny Express/Bun HTTP server.
   - What's unclear: Whether a Vite plugin middleware approach is cleaner than a standalone write script.
   - Recommendation: Use a Vite plugin with `configureServer` hook exposing `POST /api/sprite-commit`. This keeps all tooling in-process with `vite dev` and needs no separate process.

2. **Frame dimension input UX**
   - What we know: Users must specify `frameWidth`/`frameHeight` to slice an external PNG. These aren't derivable automatically from the PNG (it's just pixels).
   - What's unclear: Whether to show a prompt on drop, or expose persistent numeric inputs in the sidebar.
   - Recommendation: Expose two persistent number inputs in the sidebar (default 64×64). User adjusts before dropping, or can adjust after and trigger a reload.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 0.34.6 |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `npm run test -- --reporter=verbose specs/sprites/` |
| Full suite command | `npm run test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VIEW-01 | viewer.html is served by Vite dev server | manual smoke | navigate to `http://localhost:5173/viewer.html` | ❌ Wave 0 |
| VIEW-02 | All characters/troggles appear in sidebar | manual smoke | visual check of sidebar list | N/A |
| VIEW-03 | Drop PNG triggers Phaser texture load | unit (ViewerScene.loadSpritesheet) | `npm run test -- specs/viewer/ViewerScene.spec.ts` | ❌ Wave 0 |
| VIEW-04 | Play/pause/step controls animate sprite | unit (animation bridge) | `npm run test -- specs/viewer/ViewerBridge.spec.ts` | ❌ Wave 0 |
| VIEW-05 | Speed slider changes msPerFrame | unit | `npm run test -- specs/viewer/ViewerBridge.spec.ts` | ❌ Wave 0 |
| VIEW-06 | Metadata panel shows frameCount, dimensions | unit | `npm run test -- specs/viewer/ViewerScene.spec.ts` | ❌ Wave 0 |

**Note:** VIEW-01 and VIEW-02 are dev-tool visual requirements with no meaningful unit test surface. They are manual smoke tests. VIEW-03 through VIEW-06 have testable logic (texture loading, bridge wiring, animation state) that can be tested with vitest mocks following the established `SpriteRegistry.spec.ts` pattern (mock the Phaser scene/anims API).

### Sampling Rate
- **Per task commit:** `npm run test -- specs/sprites/ specs/viewer/`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `specs/viewer/ViewerScene.spec.ts` — covers VIEW-03, VIEW-06 (mock scene, test loadSpritesheet and metadata extraction)
- [ ] `specs/viewer/ViewerBridge.spec.ts` — covers VIEW-04, VIEW-05 (mock scene methods, test bridge wiring)
- [ ] `src/viewer/` directory — does not exist yet, created as part of implementation

---

## Sources

### Primary (HIGH confidence)
- Phaser 3.90.0 docs — `textures-texturemanager` (addSpriteSheet signature, HTMLImageElement parameter) — https://docs.phaser.io/api-documentation/class/textures-texturemanager
- Vite official docs — Multi-Page App build config, `rollupOptions.input` — https://vite.dev/guide/build#multi-page-app
- MDN Web Docs — `URL.createObjectURL` vs FileReader for file loading — https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications
- Project source files — `SpriteRegistry.ts`, `BootScene.ts`, `CharacterSprites.ts`, `vite.config.ts`, `vitest.config.ts`, `package.json` — verified directly

### Secondary (MEDIUM confidence)
- Phaser 3 dynamic loading example (Ourcade) — `this.load.start()` pattern for runtime loads — https://blog.ourcade.co/posts/2020/phaser3-load-images-dynamically/
- Phaser docs (textures concepts) — addImage/addSpriteSheet from HTMLImageElement — https://docs.phaser.io/phaser/concepts/textures

### Tertiary (LOW confidence)
- None

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all packages already installed and in use in the project
- Vite MPA pattern: HIGH — verified against official Vite docs
- Phaser dynamic loading: HIGH — verified against Phaser 3 official API docs + addSpriteSheet signature confirmed
- File API / drag-drop: HIGH — standard browser API, MDN verified
- "Commit to Project" write mechanism: MEDIUM — Vite configureServer pattern verified conceptually; exact implementation depends on dev environment (must be tested)
- Architecture patterns: HIGH — derived directly from existing project patterns in BootScene.ts

**Research date:** 2026-03-29
**Valid until:** 2026-06-28 (stable libraries; Phaser 3.x API stable)
