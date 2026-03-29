# Phase 8: In-Game Animations - Research

**Researched:** 2026-03-29
**Domain:** Phaser 3 animation playback, GridRenderer integration, sprite state machine
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **Idle**: Loop animation when character is stationary on a grid cell
- **Directional walk**: 4 separate animations — walkUp, walkDown, walkLeft, walkRight — plays during movement between cells, returns to idle after arriving
- **Munch**: Quick chomp animation (3-4 frames, mouth open/close), plays once on correct answer, then returns to idle
- Animation names in manifest: `idle`, `walkUp`, `walkDown`, `walkLeft`, `walkRight`, `munch`
- Each troggle type gets its own unique movement animation matching their AI behavior:
  - Reggie: `crawl` animation (straight-line walker)
  - Fangs: `slither` animation (chaser)
  - Squirt: `bounce` animation (flees player)
  - Ember: `flicker` animation (random drifter)
  - Bonehead: `stalk` animation (fastest, seeks player)
- Troggles animate while active on the grid, static when off-screen
- Characters/troggles without PNG sprite sheets remain as static programmatic sprites — no animation
- No tween effects or programmatic animation added — static until real sprite sheets exist

### Claude's Discretion
- Animation frame rates (fps) per animation type
- Exact frame count per animation sequence
- How to handle animation transitions (crossfade vs. snap)
- Whether to add a death/hit animation beyond what's required

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ANIM-01 | Characters play idle animation when stationary | `sprite.play(animKey(char, 'idle'))` already exists in `drawCharacter()` PNG branch; GridRenderer needs to preserve the Sprite reference and not re-create it on every `update()` call |
| ANIM-02 | Characters play directional walk animation when moving | `GameScene.handleMove()` calls `applyMove()` then `gridRenderer.update()`; the Direction that caused the move must flow from `handleMove()` → `GridRenderer` so it can call `sprite.play(animKey(char, 'walkLeft'))` etc.; returns to idle via `animationcomplete` or immediately on arrival |
| ANIM-03 | Characters play munch animation on correct answer | `GameScene.handleMunch()` calls `applyMunch()` then `gridRenderer.update()`; renderer needs a `playMunch()` path; `sprite.once('animationcomplete')` fires → switch back to idle |
| ANIM-04 | Troggles have movement animations matching their AI behavior | `GridRenderer.syncTroggles()` already updates position; each troggle container holds a `Phaser.GameObjects.Sprite` (PNG branch) that needs `sprite.play(animKey(type, animName))` called when troggle is active |
</phase_requirements>

---

## Summary

Phase 8 wires animation playback into the existing sprite and rendering pipeline. The heavy infrastructure — manifest loading, spritesheet registration, and animation key creation — is already complete from Phase 6. What this phase builds is a thin state-machine layer in `GridRenderer` (and analogous troggle rendering) that tracks the player's current animation state and calls `sprite.play()` at the right moments.

The core challenge is **object lifecycle management**: `GridRenderer` currently builds a fresh `Container` via `drawCharacter()` on `create()` and then mutates its `position` on every `update()`. For animation to work, the underlying `Phaser.GameObjects.Sprite` inside that container must persist across frames so Phaser's animation manager can continue running. The planner must ensure `createPlayerSprite()` stores a reference to the inner `Sprite` (not just the container), and that `update()` calls `sprite.play()` only when the animation state changes — not on every tick.

The second core challenge is **graceful dormancy**: the system must be a true no-op when no manifest entries exist. All animation calls must be guarded with `scene.textures.exists(character)` and `scene.anims.exists(key)` checks, exactly mirroring the pattern already established in `drawCharacter()`.

**Primary recommendation:** Extend `GridRenderer` with a private `AnimationController` helper that tracks `currentAnim: string` and calls `sprite.play()` only on state transitions. Troggle sprite storage shifts from `Map<string, Container>` to `Map<string, { container: Container; sprite?: Sprite }>`.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Phaser 3 | already installed | `Sprite.play()`, `AnimationManager`, `animationcomplete` event | Project stack; all animation infrastructure built on it |
| Vitest | already installed | Unit tests for animation controller logic | Project test framework (node environment, no Phaser) |

No new npm packages required. This phase uses Phaser APIs that are already available.

**Key Phaser APIs verified in codebase:**
- `scene.add.sprite(x, y, textureKey)` — creates an animated Sprite
- `sprite.play(animKey)` — starts an animation, ignores if same key already playing (Phaser default)
- `sprite.once('animationcomplete', cb)` — fires once at animation end
- `scene.anims.exists(key)` — guard before calling play
- `scene.textures.exists(key)` — guard before creating Sprite

---

## Architecture Patterns

### Recommended Project Structure
```
src/
├── ui/
│   ├── GridRenderer.ts        # Extended with animation state tracking
│   ├── AnimationController.ts # NEW: player animation state machine
│   └── TroggleSprites.ts      # Unchanged (programmatic path untouched)
```

The `AnimationController` separates animation concerns from layout concerns in `GridRenderer`. It is a plain TypeScript class with no Phaser import — it operates on a `Phaser.GameObjects.Sprite` reference passed in at construction, using the minimal interface pattern already established in `SpriteRegistry.ts`.

### Pattern 1: Animation State Machine (AnimationController)

**What:** A small class that holds the active `Sprite` reference and current animation name. Only calls `sprite.play()` when the animation changes.

**When to use:** Any time a Phaser Sprite needs context-driven animation switching with snap transitions (no crossfade needed).

**Example:**
```typescript
// Minimal interface — no Phaser import, keeps class testable
interface AnimatableSprite {
  play(key: string): void;
  once(event: string, cb: () => void): void;
}

export class AnimationController {
  private sprite: AnimatableSprite;
  private currentAnim = '';

  constructor(sprite: AnimatableSprite) {
    this.sprite = sprite;
  }

  play(key: string): void {
    if (key === this.currentAnim) return;   // no-op on same state
    this.currentAnim = key;
    this.sprite.play(key);
  }

  playOnce(key: string, onComplete: () => void): void {
    if (key === this.currentAnim) return;
    this.currentAnim = key;
    this.sprite.once('animationcomplete', () => {
      onComplete();
    });
    this.sprite.play(key);
  }

  getCurrentAnim(): string {
    return this.currentAnim;
  }
}
```

### Pattern 2: GridRenderer Extension — Player Animation

**What:** `GridRenderer` stores both the container and the inner sprite reference. On `update()`, it derives the intended animation from game state and delegates to `AnimationController`.

**Key addition to GridRenderer:**
```typescript
private playerSprite: Phaser.GameObjects.Sprite | null = null;
private playerAnimController: AnimationController | null = null;

private createPlayerSprite(x: number, y: number): Phaser.GameObjects.Container {
  const container = this.scene.add.container(x, y);
  if (this.scene.textures.exists(this.character)) {
    const sprite = this.scene.add.sprite(0, 0, this.character);
    sprite.setDisplaySize(4 * 12, 4 * 12);
    const idleKey = animKey(this.character, 'idle');
    if (this.scene.anims.exists(idleKey)) {
      sprite.play(idleKey);
    }
    container.add(sprite);
    this.playerSprite = sprite;
    this.playerAnimController = new AnimationController(sprite);
  } else {
    drawCharacter(this.scene, container, this.character, 4);
  }
  return container;
}
```

Note: The existing `drawCharacter()` PNG branch already creates the Sprite and plays idle. In the extended version, `createPlayerSprite()` takes over this responsibility so it can store the Sprite reference. The `drawCharacter()` PNG branch becomes a dead path for this use case (or `drawCharacter()` is refactored to return the Sprite). Simplest: inline the PNG path directly in `createPlayerSprite()` and guard with `textures.exists`.

### Pattern 3: Walk Animation Trigger Flow

**What:** `GameScene.handleMove()` already calls `gridRenderer.update(state)` after every move. The Direction must be passed down so the renderer knows which walk animation to play.

**Flow:**
```
GameScene.handleMove(dir: Direction)
  → state = applyMove(state, dir)
  → gridRenderer.playWalk(dir)   // NEW: sets walk animation
  → gridRenderer.update(state)   // position update (already exists)
```

Walk returns to idle via one of two approaches:
- **Snap**: Call `playerAnimController.play(idleKey)` at the top of the next `update()` if not already in a walk-triggering event. This is simpler and avoids `animationcomplete` complexity for walk.
- **Event**: Use `sprite.once('animationcomplete', () => playIdle())` for walk animations defined with `repeat: 0`. Clean but requires manifest to set `repeat: 0` on walk anims.

**Recommendation (Claude's discretion):** Use snap-to-idle at next `update()` when no walk is in progress. Walking is fast (one move per `PLAYER_MOVE_MS` = ~200ms) so a single walk cycle plays during the move, then idle resumes. No `animationcomplete` needed for walk.

### Pattern 4: Munch Animation — One-Shot with Callback

**What:** Munch plays once (repeat: 0 in manifest), then returns to idle.

```typescript
// In GridRenderer, called by GameScene.handleMunch() on correct answer:
playMunch(): void {
  if (!this.playerAnimController) return;
  const munchKey = animKey(this.character, 'munch');
  if (!this.scene.anims.exists(munchKey)) return;
  this.playerAnimController.playOnce(munchKey, () => {
    const idleKey = animKey(this.character, 'idle');
    if (this.scene.anims.exists(idleKey)) {
      this.playerAnimController?.play(idleKey);
    }
  });
}
```

The manifest must define munch with `repeat: 0` (already supported by `AnimationDef.repeat` field). `SpriteRegistry.registerAnimations` already passes `repeat` through when defined.

### Pattern 5: Troggle Animation

**What:** `GridRenderer` switches from `Map<string, Container>` to storing also a Sprite reference per troggle. When a troggle becomes visible and has a PNG texture, `sprite.play(animKey(type, animName))` is called.

**Troggle animation name mapping** (locked in CONTEXT.md):
| TroggleType | Animation name |
|-------------|----------------|
| reggie | crawl |
| fangs | slither |
| squirt | bounce |
| ember | flicker |
| bonehead | stalk |

```typescript
private troggleData: Map<string, {
  container: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Sprite | null;
}> = new Map();

// In syncTroggles(), after setting visible:
if (t.row !== -1 && sprite && data.sprite) {
  const moveAnim = animKey(t.type, troggleAnimName(t.type));
  if (this.scene.anims.exists(moveAnim)) {
    if (!data.sprite.anims.isPlaying || data.sprite.anims.currentAnim?.key !== moveAnim) {
      data.sprite.play(moveAnim);
    }
  }
}
```

Helper:
```typescript
function troggleAnimName(type: TroggleType): string {
  const map: Record<TroggleType, string> = {
    reggie: 'crawl', fangs: 'slither', squirt: 'bounce',
    ember: 'flicker', bonehead: 'stalk',
  };
  return map[type];
}
```

### Anti-Patterns to Avoid

- **Re-creating the Sprite on every `update()`**: Destroys the animation state. Sprite must be created once in `create()` and reused.
- **Calling `sprite.play()` on every frame**: Phaser will restart the animation from frame 0 every tick. Guard with `if (key !== currentAnim)`.
- **Importing Phaser in AnimationController**: The interface pattern from `SpriteRegistry.ts` keeps the class unit-testable in vitest's node environment. Match that pattern.
- **Forgetting `repeat: 0` in manifest for munch**: Without it, munch loops forever. The `animationcomplete` callback never fires. Document this in the manifest format guidance.
- **Playing walk animations on troggle containers**: Troggles move discretely (one cell per tick), so the walk animation cycles naturally with their movement interval. No special transition logic needed.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Animation frame sequencing | Custom frame timer | `sprite.play()` + manifest frame ranges | Phaser handles frame timing, looping, completion events |
| One-shot animation | Manual frame counter | `AnimationDef.repeat: 0` + `animationcomplete` | Already supported in SpriteRegistry AnimationDef type |
| Preventing restart on same animation | Comparison logic scattered in callers | Centralize in `AnimationController.play()` | Phaser's `ignoreIfPlaying` option also exists but controller is cleaner for state tracking |
| Cross-fade transitions | Tween-based blending | Snap transitions (no crossfade) | Context decision; snap is appropriate for pixel art game |
| Troggle sprite management | Custom pooling | Phaser container + stored Sprite reference | Already pooled in GridRenderer; just extend the stored data |

**Key insight:** Phaser's AnimationManager already handles all frame timing, looping, and completion detection. This phase's job is dispatching the right animation key at the right moment — not building animation mechanics.

---

## Common Pitfalls

### Pitfall 1: Sprite Reference Lost After Container Destruction
**What goes wrong:** `GridRenderer.create()` destroys and recreates everything. If the Sprite reference is stored locally and `create()` is called again (e.g., `scene.restart()` → `GameScene` re-creates `GridRenderer`), the old reference points to a destroyed object.
**Why it happens:** `scene.restart()` triggers `GameScene.create()` → `new GridRenderer()` → `create(state)`. The old Sprite is destroyed with the old scene graph.
**How to avoid:** Store the Sprite reference in the `GridRenderer` instance, which is re-created fresh on each `scene.restart()`. The reference lifecycle matches the GridRenderer lifecycle.
**Warning signs:** `Cannot read properties of undefined (reading 'play')` in the console.

### Pitfall 2: Walk Animation Never Returns to Idle
**What goes wrong:** Walk animation plays once (repeat: 0) but idle is never re-triggered because no `animationcomplete` listener was attached, and `update()` doesn't restore idle.
**Why it happens:** `update()` only calls `playWalk()` on move events, and playback silently stops at the last frame with no looping.
**How to avoid:** Either use `sprite.once('animationcomplete', playIdle)` for walk, or explicitly re-play idle at the top of `update()` when the player is stationary and munch is not playing.

### Pitfall 3: Munch Interrupts Itself on Rapid Tapping
**What goes wrong:** Player taps munch key multiple times quickly; each correct answer triggers `playMunch()`. The `animationcomplete` callback fires for the first call, which sets idle — then the second call's listener may fire immediately (if the animation was already at completion state).
**Why it happens:** Multiple `once('animationcomplete')` listeners stacked on the same sprite.
**How to avoid:** `AnimationController.playOnce()` tracks `currentAnim`. If munch is already playing (`currentAnim === munchKey`), skip the call. The guard `if (key === this.currentAnim) return;` handles this.

### Pitfall 4: Troggle Animation Restarts Every Tick
**What goes wrong:** `syncTroggles()` is called every 100ms (the `GAME_TICK_MS`). If `sprite.play()` is called unconditionally, the animation restarts from frame 0 on every tick.
**Why it happens:** No guard against calling play when the animation is already running.
**How to avoid:** Check `sprite.anims.currentAnim?.key !== moveAnim` before calling `play()`, or use `sprite.anims.isPlaying` combined with the key check.

### Pitfall 5: PNG Branch Missing in Non-GameScene Contexts
**What goes wrong:** `CharacterSelectScene` and `ShopScene` call `drawCharacter()` for previews. After Phase 8, `drawCharacter()` still handles the PNG branch for previews — but the idle animation plays there too. If those scenes use containers that get destroyed and re-created frequently, animations may stack up in the global `AnimationManager`.
**Why it happens:** `registerAnimations` runs once in `BootScene.create()`. The animations are global. Playing them in multiple scenes simultaneously is fine — Phaser handles this. But this is worth noting.
**How to avoid:** No action needed. Phaser's AnimationManager is global and shared; the same animation key can play on multiple Sprite instances concurrently without issue.

---

## Code Examples

Verified patterns from the existing codebase:

### Existing animKey usage (SpriteRegistry.ts)
```typescript
// Source: src/sprites/SpriteRegistry.ts
export function animKey(character: string, animName: string): string {
  return `${character}-${animName}`;
}
// e.g. animKey('claude', 'walkLeft') => 'claude-walkLeft'
```

### Existing PNG guard in drawCharacter (CharacterSprites.ts)
```typescript
// Source: src/ui/CharacterSprites.ts lines 69-79
if (scene.textures.exists(character)) {
  const sprite = scene.add.sprite(0, 0, character);
  const targetSize = pixelSize * 12;
  sprite.setDisplaySize(targetSize, targetSize);
  const idleKey = animKey(character, 'idle');
  if (scene.anims.exists(idleKey)) {
    sprite.play(idleKey);
  }
  container.add(sprite);
  return;
}
```

### Existing animation registration (SpriteRegistry.ts)
```typescript
// AnimationDef supports repeat: 0 for one-shot animations
export interface AnimationDef {
  frames: [number, number];
  frameRate?: number;  // defaults to 8
  repeat?: number;     // defaults to -1 (loop); set 0 for one-shot
}
```

### Recommended manifest entry for a character (sprites.json example)
```json
{
  "claude": {
    "sheet": "claude/sheet.png",
    "frameWidth": 64,
    "frameHeight": 64,
    "animations": {
      "idle":      { "frames": [0, 3],   "frameRate": 8,  "repeat": -1 },
      "walkDown":  { "frames": [4, 7],   "frameRate": 12, "repeat": 0  },
      "walkUp":    { "frames": [8, 11],  "frameRate": 12, "repeat": 0  },
      "walkLeft":  { "frames": [12, 15], "frameRate": 12, "repeat": 0  },
      "walkRight": { "frames": [16, 19], "frameRate": 12, "repeat": 0  },
      "munch":     { "frames": [20, 23], "frameRate": 16, "repeat": 0  }
    }
  }
}
```

Standard sprite sheet row layout (as documented in CONTEXT.md):
- Row 0 (frames 0–3): idle
- Row 1–4 (frames 4–19): walk directions (down, up, left, right)
- Row 5 (frames 20–23): munch

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual tween-based sprite animation | Phaser AnimationManager + sprite sheets | Phase 6 foundation built | Declarative frame ranges in manifest, no hand-rolled timing |
| Single programmatic Sprite (Graphics) | Dual-path: PNG Sprite or programmatic fallback | Phase 6 | Zero-migration cost; add PNG = instant animation |
| No direction tracking on troggles | `TroggleData.direction` field exists | Phase 1 (types.ts) | Walk direction animation could use this field for troggle flip |

---

## Open Questions

1. **Should `drawCharacter()` be refactored or bypassed in `GridRenderer.createPlayerSprite()`?**
   - What we know: `drawCharacter()` PNG branch creates the Sprite and plays idle but does not return the Sprite reference. `GridRenderer` needs that reference.
   - What's unclear: Best path — refactor `drawCharacter()` to return `Sprite | null`, or inline the PNG logic in `createPlayerSprite()` and leave `drawCharacter()` for non-game-scene previews.
   - Recommendation: Inline the PNG Sprite creation in `createPlayerSprite()`. Keeps `drawCharacter()` as a "draw and forget" helper for previews; keeps `GridRenderer` in full control of its sprite lifecycle.

2. **Troggle animation: does drawTroggle() need the same dual-path as drawCharacter()?**
   - What we know: `drawTroggle()` is programmatic-only. `GridRenderer.create()` calls it into a container. No PNG branch exists for troggle sprites yet.
   - What's unclear: Whether to add PNG branch to `drawTroggle()` now or build it inline in the troggle storage extension in `GridRenderer`.
   - Recommendation: Build the PNG branch inline in `GridRenderer.create()` using `scene.textures.exists(t.type)` — mirrors the `drawCharacter()` pattern, no changes to `TroggleSprites.ts` needed.

3. **Frame rates per animation type (Claude's discretion)**
   - What we know: `AnimationDef.frameRate` defaults to 8. Walk at 8fps with a 4-frame sequence = ~0.5s per cycle, which matches a ~200ms move interval (partial cycle is fine). Munch should be faster: 16fps over 3-4 frames = ~0.25s.
   - Recommendation: idle=8fps, walk=12fps (repeat:0), munch=16fps (repeat:0). These are reasonable defaults for the manifest documentation. Individual character sheets can override.

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (node environment) |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run specs/ui/` |
| Full suite command | `npx vitest run` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ANIM-01 | `AnimationController.play(key)` triggers sprite.play on state change | unit | `npx vitest run specs/ui/AnimationController.spec.ts` | ❌ Wave 0 |
| ANIM-01 | `AnimationController.play(key)` is no-op when same key | unit | same | ❌ Wave 0 |
| ANIM-02 | `AnimationController.playOnce(key, cb)` calls play and registers completion listener | unit | same | ❌ Wave 0 |
| ANIM-03 | munch animation key is correct format (`{char}-munch`) | unit | `npx vitest run specs/sprites/SpriteRegistry.spec.ts` | ✅ exists |
| ANIM-04 | `troggleAnimName()` maps each TroggleType to correct animation name | unit | `npx vitest run specs/ui/AnimationController.spec.ts` | ❌ Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run specs/ui/ specs/sprites/`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `specs/ui/AnimationController.spec.ts` — covers ANIM-01, ANIM-02, ANIM-04 (state machine logic, no Phaser import required)

*(Existing `specs/ui/GridRenderer.spec.ts` tests visibility logic via simulation — this pattern can be extended for animation state, but the AnimationController spec is the primary unit test target)*

---

## Sources

### Primary (HIGH confidence)
- `/Users/gmiller/work/number-munchers/src/sprites/SpriteRegistry.ts` — AnimationDef type, animKey, registerAnimations, minimal interface pattern
- `/Users/gmiller/work/number-munchers/src/ui/CharacterSprites.ts` — existing PNG branch with `textures.exists` + `anims.exists` guards
- `/Users/gmiller/work/number-munchers/src/ui/GridRenderer.ts` — full rendering pipeline, troggle container management
- `/Users/gmiller/work/number-munchers/src/scenes/GameScene.ts` — handleMove, handleMunch, triggerLifeLost call sites
- `/Users/gmiller/work/number-munchers/src/scenes/BootScene.ts` — manifest loading, registerAnimations call
- `/Users/gmiller/work/number-munchers/src/game/logic/TroggleAI.ts` — movement behavior per type
- `/Users/gmiller/work/number-munchers/src/types.ts` — TroggleData.direction field exists

### Secondary (MEDIUM confidence)
- Phaser 3 AnimationManager docs: `sprite.play(key)` no-ops when key matches current animation when `ignoreIfPlaying` is true; `animationcomplete` event fires for `repeat: 0` animations — verified against Phaser 3 documentation patterns used in existing codebase

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new dependencies; all Phaser APIs verified in existing code
- Architecture: HIGH — patterns derived directly from existing codebase structure and established conventions (minimal interface, dual-path guards)
- Pitfalls: HIGH — derived from direct code inspection of GridRenderer, GameScene call patterns, and Phaser animation model
- Frame rates: MEDIUM (Claude's discretion area) — reasonable defaults based on game rhythm

**Research date:** 2026-03-29
**Valid until:** 2026-04-29 (stable stack; Phaser 3 API is stable)
