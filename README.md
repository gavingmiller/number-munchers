# Number Munchers

A retro math education game inspired by the classic 1991 arcade title. Navigate a grid, munch the correct numbers, and dodge Troggles.

Built with Phaser 3, TypeScript, and Vite. All graphics are procedurally generated pixel art — no image assets required.

## Game Modes

**Multiples** — Eat all multiples of a target number (e.g., multiples of 6: eat 6, 12, 18, 24...)

**Factors** — Eat all factors of a target number (e.g., factors of 24: eat 1, 2, 3, 4, 6, 8, 12, 24)

**Prime Numbers** — Eat all the primes on the board

**Equalities** — Eat equations that equal the target value. Grid shows expressions like `3+4`, `8-1`, `2x5` instead of plain numbers.

Each level fills 67-75% of the 6x5 grid (30 cells) with correct answers. Clear them all to advance.

## Characters

Nine playable pixel-art characters, selected after choosing a game mode:

| Character | Description |
|-----------|-------------|
| Claude | Terra cotta mascot with rounded features |
| Box | Simple green square |
| Axolotl | Pink amphibian with gill tufts |
| Electric Mouse | Yellow mouse with lightning-bolt tail |
| Marshmallow | White rectangular character with brown rim |
| Robot | Dark navy android with antenna and display panel |
| Nyan Cat | Cat head + poptart body + rainbow trail |
| Pusheen | Chubby gray rounded cat |
| Mr Pickle | Tall green pickle with stick arms and brown shoes |

## Troggles

Enemy creatures that patrol the grid. Colliding with one costs a life. Three troggle types have dedicated pixel art sprites; the rest use colored rectangle placeholders.

| Type | Color | Sprite | Behavior |
|------|-------|--------|----------|
| Reggie | Red | Placeholder | Walks in a straight line, exits at edges, re-enters later |
| Fangs | Cyan | Snake with forked tongue | Chases the player using Manhattan distance |
| Bashful | Orange | Placeholder | Flees when close (distance < 3), random otherwise |
| Ember | Orange-yellow | Boxy fireball with grin | Pure random movement |
| Bonehead | Gray | Hooded skull | Greedy best-next-cell toward player, 50% faster, late entry (1000 ticks) |

Troggles enter from grid edges on staggered timers. Count and speed scale with level:
- Levels 1-3: 1 troggle, slow
- Levels 4-7: 2 troggles, moderate
- Level 8+: 3 troggles, fast

## Controls

All screens are fully navigable with keyboard — no mouse required.

| Action | Keyboard | Touch/Mouse |
|--------|----------|-------------|
| Move | Arrow keys | D-pad buttons |
| Munch / Confirm | Space | MUNCH button / click |

## Scoring

- Points per correct munch scale from 5 (level 1) to 75 (level 16+)
- Extra life at 1,000 points
- Extra life at 10,000 points
- Number range expands with level: `min(12 + level * 4, 100)`

## Scene Flow

```
Boot → Main Menu → Character Select → Game
                                        ├─ Level complete → Cutscene → Next level
                                        ├─ Life lost → Countdown → Resume
                                        └─ Game over → Hi Score → Main Menu
```

A separate Debug Mode (accessible from the main menu) spawns one of each troggle type for testing AI behaviors.

## Architecture

**Pure functional state** — Game logic uses immutable state reducers (`applyMove`, `applyMunch`, `applyTroggleTick`) that return new state objects. No mutation.

**Separation of concerns:**
- `src/types.ts` — Shared types, no Phaser imports
- `src/game/logic/` — Pure math and game logic (grid generation, collision, troggle AI, rule evaluation)
- `src/game/entities/` — Entity creation (player, troggle, cell)
- `src/game/state/` — State management and score tracking
- `src/ui/` — Phaser rendering (grid, HUD, d-pad, character sprites, troggle sprites)
- `src/scenes/` — Phaser scene lifecycle

**Procedural graphics** — All characters, troggles, and UI elements are drawn with the Phaser Graphics API (`fillRect` pixel grids). Zero image assets.

## Development

```bash
# Install
npm install

# Dev server (port 5173)
npm run dev

# Run tests
npm test

# Watch tests
npm run test:watch

# Production build
npm run build
```

## Tech Stack

- **Phaser 3.90** — Game engine
- **TypeScript** — Strict mode
- **Vite** — Build and dev server
- **Vitest** — Unit testing (127 tests across 14 spec files)
- **Capacitor** — iOS/mobile support
