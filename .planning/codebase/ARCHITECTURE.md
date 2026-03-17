# Architecture

## Design Pattern
**Functional State Management + Layered Architecture (ECS-inspired)**

Pure functional immutable state model where all game logic is deterministic and side-effect-free. Clean separation across four layers.

## Design Principles

### Pure Functional State
- All state changes use immutable reducers: `applyMove()`, `applyMunch()`, `applyTroggleHit()`, `applyTroggleTick()`
- Each reducer takes current state, returns new state object without mutation
- State is plain TypeScript objects (no classes)

### Separation of Concerns
- Game logic decoupled from rendering — renderers depend on logic, never vice versa
- Types in `src/types.ts` have NO Phaser imports
- Logic files contain pure functions only; UI files contain Phaser-specific code

### Procedural Graphics
- All sprites drawn programmatically via Phaser Graphics API
- No image assets — each sprite is a grid of colored pixels defined as `[col, row]` tuples

## Data Flow

```
User Input (keyboard/d-pad)
  → GameScene.update() / handleMove() / handleMunch()
  → Game Logic Reducers (applyMove, applyMunch, applyTroggleTick)
  → Immutable GameState (new object)
  → CollisionSystem (checkPlayerCell, checkPlayerTroggles)
  → Rendering Update (GridRenderer, HUD, DebugOverlay)
  → Phaser Display Objects
```

## Layer 1: Game Logic (`src/game/logic/`)

Pure functions, testable, no Phaser dependency:

| File | Responsibility |
|------|---|
| `RuleEngine.ts` | Rule generation, correctness evaluation, equation generation |
| `GridGenerator.ts` | Grid initialization (67-75% correct cells) |
| `TroggleAI.ts` | 5 unique troggle movement AIs |
| `CollisionSystem.ts` | Player-cell and player-troggle collision detection |
| `DifficultyTable.ts` | Level scaling (troggles, speed, points, number range) |
| `MathUtils.ts` | `isMultipleOf()`, `randomInt()`, `shuffle()` |
| `PrimeUtils.ts` | `isPrime()`, `getPrimesInRange()` |
| `FactorUtils.ts` | `getFactors()`, `isFactorOf()` |

### Troggle AI Behaviors
- **Reggie**: Straight-line walker, bounces off walls, exits at edges
- **Fangs**: Chases player, Manhattan distance, row-first priority
- **Squirt**: Flees if player distance < 3, otherwise random
- **Ember**: Pure random movement
- **Bonehead**: Greedy best-next-cell, 50% faster, enters at tick 1000

## Layer 2: Entity & State (`src/game/entities/` + `src/game/state/`)

| File | Responsibility |
|------|---|
| `Player.ts` | Player creation (center at 2,2), movement |
| `Cell.ts` | Cell creation, blanking |
| `Troggle.ts` | Troggle creation, tick mechanics |
| `GameState.ts` | Level state creation, main reducers |
| `ScoreTracker.ts` | Score management, extra life thresholds |

### State Reducers (pure functions in `GameState.ts`)
- `createLevelState(mode, level, previousScore?)` — New level init
- `applyMove(state, dir)` — Player movement + troggle activation checks
- `applyMunch(state)` — Score or lose life
- `applyTroggleHit(state)` — Reset player, re-arm troggles
- `applyTroggleTick(state)` — AI loop: timers, activation, movement

## Layer 3: Scenes (`src/scenes/`)

| Scene | Purpose |
|-------|---------|
| `BootScene.ts` | Initialization |
| `MainMenuScene.ts` | Mode selection (4 modes) |
| `CharacterSelectScene.ts` | 9 playable characters |
| `GameScene.ts` | Main gameplay loop, input, state updates |
| `GameOverScene.ts` | Life lost overlay with countdown |
| `CutsceneScene.ts` | Story interlude every 3 levels |
| `HiScoreScene.ts` | Final score display |
| `DebugScene.ts` | Test all 5 troggles |

## Layer 4: UI & Rendering (`src/ui/`)

| File | Responsibility |
|------|---|
| `GridRenderer.ts` | Grid display, cell text, player/troggle sprites |
| `HUD.ts` | Score, level, lives display |
| `RuleBanner.ts` | Rule description banner |
| `DPad.ts` | On-screen directional + munch buttons |
| `CharacterSprites.ts` | 9 player character pixel art |
| `TroggleSprites.ts` | 5 troggle type pixel art |
| `DebugOverlay.ts` | Debug info display |

## Key Types (`src/types.ts`)

- `GameState` — Master state: mode, level, status, score, lives, rule, grid, player, troggles
- `CellData` — row, col, value (number|string), state (filled|blank), isCorrect
- `TroggleData` — id, type, position, timers, direction, entry thresholds
- `Rule` — mode, optional target, description
- `LevelConfig` — troggle count/speed, number range, points per correct
- Grid: 6 rows x 5 cols = 30 cells, indexed as `row * COLS + col`

## State Management
- **Unidirectional data flow**: Input → Reducer → New State → Rendering
- **No global state container** — state lives in GameScene, passed to UI
- **Score persists** between levels via scene data parameter
