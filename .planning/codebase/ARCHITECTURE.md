# Architecture

**Analysis Date:** 2026-03-28

## Pattern Overview

**Overall:** Functional State Management + Phaser Scene-based GUI

Pure functional immutable state model with deterministic game logic completely decoupled from Phaser rendering. Game state lives as plain TypeScript objects; all mutations are explicit reducers that produce new state. Phaser scenes manage lifecycle and input, renderers consume read-only state snapshots.

**Key Characteristics:**
- Pure functional reducers with no side effects (core game logic)
- Unidirectional data flow: Input → Reducer → New State → Render
- No global state container; state passed through scene lifecycle
- All game logic in `src/game/` (no Phaser imports)
- Phaser scenes only handle input, lifecycle, and delegation to renderers
- Programmatic pixel art sprites (no image assets)

## Layers

**Layer 1: Game Logic (Pure Functions)**
- Location: `src/game/logic/`
- Contains: Rule generation, grid generation, collision detection, difficulty scaling, AI
- Depends on: Nothing (only types from `src/types.ts`)
- Used by: GameState reducers, GameScene
- Characteristic: 100% testable, no side effects, no Phaser dependency

**Layer 2: Entity Factories & State Management**
- Location: `src/game/entities/` + `src/game/state/`
- Contains: Entity constructors, state reducers, persistence layer
- Depends on: Layer 1 (logic), `src/types.ts`
- Used by: GameScene
- Characteristic: Plain function factories and pure reducers; Persistence uses localStorage

**Layer 3: Scene Lifecycle & Input**
- Location: `src/scenes/`
- Contains: 13 Phaser scenes handling navigation, input, and game flow
- Depends on: Layer 2 (state), UI layer, types
- Used by: Phaser game instance
- Characteristic: Scene orchestration, input polling, event handling, cross-scene data passing

**Layer 4: Rendering & UI Components**
- Location: `src/ui/`
- Contains: Phaser display object wrappers, sprite renderers, HUD components
- Depends on: `src/types.ts`, game state objects (read-only)
- Used by: Scenes (called from `create()` and `update()`)
- Characteristic: Graphics API calls, container management, position/visibility updates

## Data Flow

**Gameplay Loop (100ms tick rate):**

1. User presses arrow key or taps d-pad → Scene.update()
2. GameScene.handleMove() calls reducer: `applyMove(state, direction)`
3. Reducer returns new state object (player position updated, troggles checked for activation)
4. GameScene calls `gridRenderer.update(state)` to sync visuals
5. GameScene calls `checkPlayerTroggles(state)` collision check
6. If collision: trigger life loss, show overlay
7. Every 100ms tick: `applyTroggleTick()` advances troggle AI, moves troggles
8. New grid state → Renderer updates display
9. Collision checks run again; if hit: life lost

**State Persistence:**

- Game record (final stats) → `addGameRecord()` → localStorage `numberMunchers_player`
- Player unlocks (stars, characters) → loaded at game start
- Settings (control style) → cached in Persistence

## Key Abstractions

**GameState (Master State Object)**
- Location: `src/types.ts` lines 65-82
- Contains: mode, grade, level, status, score, lives, rule, 30-cell grid, player position, 5 troggles
- Immutable: all updates return new object via reducer
- Passed as read-only parameter to rendering and collision functions
- Example structure:
  ```typescript
  interface GameState {
    mode: GameMode;           // 'multiples', 'factors', 'sums', etc.
    grade: GradeLevel;        // 1-5
    level: number;
    status: GameStatus;       // 'playing' | 'life-lost' | 'level-complete' | 'game-over'
    score: ScoreData;
    lives: number;
    rule: Rule;               // { mode, target?, description }
    grid: CellData[];         // 30 cells indexed as row*COLS + col
    player: PlayerData;       // { row, col, lives }
    troggles: TroggleData[];  // array of 5 active/inactive troggles
  }
  ```

**Rule Engine (Problem Generation)**
- Location: `src/game/logic/RuleEngine.ts`
- Responsibility: Generate rules per level, evaluate cell correctness
- Examples:
  - "Multiples of 6" → rule.target = 6
  - "Prime Numbers" → rule.mode = 'primes'
  - "Missing Addends: _ + 3 = 8" → rule.target = 5
- Used by: GridGenerator, collision checks

**TroggleData (Enemy State)**
- Location: `src/types.ts` lines 34-44
- 5 troggles per level, each with:
  - `type`: reggie | fangs | squirt | ember | bonehead
  - `row`, `col`: current position (-1 = inactive)
  - `moveTimer`, `moveInterval`: tick-based movement throttling
  - `playerMovesUntilEntry`, `ticksUntilEntry`: dual activation thresholds
- Lifecycle: Inactive → Activated at edge → Moves per AI rules → Exits at edge → Deactivated
- Player hit → All troggles reset to inactive with re-armed timers

**Troggle AI (5 Behaviors)**
- Location: `src/game/logic/TroggleAI.ts` lines 40-124
- `nextMove(troggle, player, grid)` → Direction for next tick
- Behaviors:
  - **Reggie**: Straight-line walker, reverses at walls, exits/re-enters
  - **Fangs**: Chases player, Manhattan distance, row-first when tied
  - **Squirt**: Flees if distance < 3, else random
  - **Ember**: Pure random walk
  - **Bonehead**: Greedy closest-cell, 50% faster move interval, late activation

## Entry Points

**Game Bootstrap:**
- Location: `src/main.ts`
- Creates Phaser game instance with config: 768×1024 canvas, 4 active pointers (touch), pixel-perfect rendering
- Scene list (13 total): BootScene → GradeSelectScene → MainMenuScene → CharacterSelectScene → GameScene (+ overlays) → GameOverScene → LevelCompleteScene → CutsceneScene → HiScoreScene → HistoryScene → ShopScene → SettingsScene → DebugScene

**Level Initialization:**
- Location: `src/game/state/GameState.ts` lines 103-169, function `createLevelState()`
- Called from: GameScene.init()
- Parameters: mode, level, optional previousScore, grade, sessionCarry
- Creates: new grid, player at center (2,2), 5 inactive troggles with staggered entry timers
- Returns: complete GameState ready for first render

**Gameplay Loop:**
- Location: `src/scenes/GameScene.ts` lines 125-162, method `update()`
- Runs every frame (~60fps in browser)
- Throttles player movement to 200ms intervals
- Ticks game logic every 100ms (separate timer)
- Checks collisions after every player move and troggle tick

## Error Handling

**Strategy:** Fail gracefully with game continuity

**Patterns:**
- Rule generation: Falls back to default rule if target can't be determined
- Persistence: Returns default save if localStorage corrupted or missing
- Collision detection: Safe boundary checks, inactive troggles skipped
- Scene transitions: Scene.start() used consistently, no hard failures on scene not found (Phaser handles)

**Death Scenarios:**
- Wrong cell selected → `GameDeath` event logged, applyTroggleHit() called
- Troggle collision → `GameDeath` event logged, applyTroggleHit() called
- Lives exhausted → Game saved, transition to HiScoreScene

## Cross-Cutting Concerns

**Logging:**
- GameScene accumulates `GameDeath` events in state.deaths
- All attempts recorded in state.problems (correct/wrong tracking)
- Final game record saved via `addGameRecord()` to localStorage

**Validation:**
- RuleEngine.isCorrect() validates cell values against rule
- GridGenerator ensures 67-75% correct cells per level
- DifficultyTable.getLevelConfig() scales troggle count/speed per level

**Authentication:**
- None; single-player local game

**Difficulty Scaling:**
- Location: `src/game/logic/DifficultyTable.ts` lines 1-27
- Troggle count: 1 (level 1) → 3 (level 5)
- Troggle speed: 800ms (level 1) → 300ms (level 5)
- Points per correct: 100 (level 1) → 500 (level 5)
- Number range: Grade-dependent (Grade 1: 1-20, Grade 5: 1-200)

**Grade/Mode System:**
- Location: `src/game/logic/GradeConfig.ts`
- 5 grades (1-5), each with grade-appropriate modes
- Grade 1: sums, even_odd
- Grade 4: multiples, factors, primes, equalities, division, missing_factors
- Mode examples shown in menu for UX

---

*Architecture analysis: 2026-03-28*
