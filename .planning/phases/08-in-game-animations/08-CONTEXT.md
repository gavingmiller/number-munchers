# Phase 8: In-Game Animations - Context

**Gathered:** 2026-03-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Characters and troggles play context-appropriate frame-based animations during gameplay. Requires PNG sprite sheets with animation sequences defined in the manifest. Characters without PNG sheets remain static (programmatic fallback unchanged). This phase does NOT create sprite art — it builds the animation playback system that consumes sheets created via the viewer (Phase 7).

</domain>

<decisions>
## Implementation Decisions

### Player character animations
- **Idle**: Loop animation when character is stationary on a grid cell
- **Directional walk**: 4 separate animations — walkUp, walkDown, walkLeft, walkRight — plays during movement between cells, returns to idle after arriving
- **Munch**: Quick chomp animation (3-4 frames, mouth open/close), plays once on correct answer, then returns to idle
- Animation names in manifest: `idle`, `walkUp`, `walkDown`, `walkLeft`, `walkRight`, `munch`

### Troggle animations
- Each troggle type gets its own unique movement animation matching their AI behavior:
  - **Reggie**: crawl animation (straight-line walker)
  - **Fangs**: slither animation (chaser)
  - **Squirt**: bounce animation (flees player)
  - **Ember**: flicker animation (random drifter)
  - **Bonehead**: stalk animation (fastest, seeks player)
- Animation names in manifest: `move` (generic) or type-specific names
- Troggles animate while active on the grid, static when off-screen

### Fallback behavior
- Characters/troggles without PNG sprite sheets remain as static programmatic sprites — no animation
- No tween effects or programmatic animation added — static until real sprite sheets exist
- This is intentionally simple: once sprite sheets are created via the viewer, animations "just work"

### Claude's Discretion
- Animation frame rates (fps) per animation type
- Exact frame count per animation sequence
- How to handle animation transitions (crossfade vs. snap)
- Whether to add a death/hit animation beyond what's required

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Sprite system (Phase 6)
- `src/sprites/SpriteRegistry.ts` — registerAnimations, animKey helper, AnimationDef type
- `public/sprites/sprites.json` — Manifest format (currently empty, will have entries when sheets exist)

### Rendering pipeline (Phase 6)
- `src/ui/CharacterSprites.ts` — drawCharacter() with PNG branch, plays idle animation already
- `src/scenes/BootScene.ts` — Manifest loading and spritesheet preloading pipeline

### Game state and movement
- `src/scenes/GameScene.ts` — handleMove(), handleMunch(), triggerLifeLost() — where animation triggers need to be wired
- `src/game/state/GameState.ts` — applyMove(), applyMunch() — state transitions that drive animations
- `src/ui/GridRenderer.ts` — Where player sprite is rendered and updated each frame

### Troggle system
- `src/game/logic/TroggleAI.ts` — Movement AI per troggle type
- `src/game/entities/Troggle.ts` — Troggle entity lifecycle
- `src/ui/TroggleSprites.ts` — Current programmatic troggle rendering (drawTroggle dispatcher)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `SpriteRegistry.animKey(character, animName)` — Builds Phaser animation keys like `box-idle`, `box-walkUp`
- `SpriteRegistry.registerAnimations(scene)` — Already creates all animations from manifest in BootScene
- `drawCharacter()` PNG branch — Already renders Phaser Sprite and plays idle animation
- `drawTroggle()` — Dispatcher for all 5 troggle types, same pattern as drawCharacter

### Established Patterns
- `Phaser.GameObjects.Sprite.play(key)` — Switch animations
- `Phaser.GameObjects.Sprite.on('animationcomplete', callback)` — React to animation end (for munch → idle)
- `GridRenderer.update(state)` — Called after every state change, where animation switching should happen

### Integration Points
- `GridRenderer.update()` — Needs to detect state changes (moving, idle, munching) and switch player animation
- `GridRenderer` troggle rendering — Needs similar animation switching for troggle movement
- `GameScene.handleMove()` → triggers walk animation
- `GameScene.handleMunch()` → triggers munch animation
- `applyTroggleTick()` → triggers troggle movement animations

</code_context>

<specifics>
## Specific Ideas

- Animation system should be "dormant" when no sprite sheets exist — zero visual change until PNGs are added
- The viewer (Phase 7) is the tool for creating and testing animations before they appear in-game
- Standard animation sequence for a character sprite sheet: row 0 = idle, row 1-4 = walk directions, row 5 = munch

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-in-game-animations*
*Context gathered: 2026-03-29*
