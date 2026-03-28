# Codebase Structure

**Analysis Date:** 2026-03-28

## Directory Layout

```
number-munchers/
├── src/
│   ├── main.ts                          # Phaser game config & entry point
│   ├── types.ts                         # Shared types (NO Phaser imports)
│   ├── constants.ts                     # Visual constants (canvas, layout, colors, timings)
│   │
│   ├── game/
│   │   ├── logic/                       # Pure game logic (100% testable, no Phaser)
│   │   │   ├── RuleEngine.ts            # Rule generation, correctness validation, equations
│   │   │   ├── GridGenerator.ts         # 6×5 grid generation (67-75% correct cells)
│   │   │   ├── TroggleAI.ts             # 5 troggle movement behavior algorithms
│   │   │   ├── CollisionSystem.ts       # Player-cell & player-troggle collision detection
│   │   │   ├── DifficultyTable.ts       # Level scaling (troggles, speed, points, ranges)
│   │   │   ├── GradeConfig.ts           # Grade levels, mode availability, examples
│   │   │   ├── MathUtils.ts             # Utility: isMultipleOf, randomInt, shuffle
│   │   │   ├── PrimeUtils.ts            # Utility: isPrime, getPrimesInRange
│   │   │   └── FactorUtils.ts           # Utility: getFactors, isFactorOf
│   │   │
│   │   ├── entities/                    # Entity constructors (plain data factories)
│   │   │   ├── Player.ts                # createPlayer(), movePlayer()
│   │   │   ├── Cell.ts                  # createCell(), blanking logic
│   │   │   └── Troggle.ts               # createTroggle(), tickTroggle(), timers
│   │   │
│   │   └── state/                       # State management & persistence
│   │       ├── GameState.ts             # Main reducers: createLevelState, applyMove, applyMunch, applyTroggleTick, applyTroggleHit
│   │       ├── ScoreTracker.ts          # Score, extra life tracking
│   │       └── Persistence.ts           # localStorage I/O: loadPlayerData, savePlayerData, unlocks, settings
│   │
│   ├── ui/                              # Phaser rendering components
│   │   ├── GridRenderer.ts              # Grid cells, player sprite, troggle sprites, flashing
│   │   ├── HUD.ts                       # Score, level, lives display (top-right corner)
│   │   ├── RuleBanner.ts                # Rule description banner (top, 80px)
│   │   ├── DPad.ts                      # On-screen d-pad + munch button (bottom half)
│   │   ├── CharacterSprites.ts          # 9 player character pixel art (programmatic)
│   │   ├── TroggleSprites.ts            # 5 troggle type pixel art (programmatic)
│   │   └── DebugOverlay.ts              # Debug grid coords & state info
│   │
│   └── scenes/                          # Phaser scene lifecycle & orchestration (13 scenes)
│       ├── BootScene.ts                 # Initialization, asset loading setup
│       ├── GradeSelectScene.ts          # Grade (1-5) selection
│       ├── MainMenuScene.ts             # Mode selection (grade-filtered), stars display, nav buttons
│       ├── CharacterSelectScene.ts      # Character unlock/selection (9 characters)
│       ├── GameScene.ts                 # Main gameplay: input, state updates, collision, overlay triggers
│       ├── GameOverScene.ts             # Life lost overlay, countdown to resume, explanation text
│       ├── LevelCompleteScene.ts        # Level clear screen, next-level button
│       ├── CutsceneScene.ts             # Story interlude (every 3 levels)
│       ├── HiScoreScene.ts              # Final score display, game record save
│       ├── HistoryScene.ts              # Past games list, stats review
│       ├── ShopScene.ts                 # Character unlock shop (star currency)
│       ├── SettingsScene.ts             # Control style (center/two-handed d-pad), grade selection
│       └── DebugScene.ts                # Test all 5 troggles in isolation
│
├── specs/                               # Vitest test files (mirrors src/ structure)
│   ├── logic/
│   │   ├── RuleEngine.spec.ts           # Rule generation, correctness validation
│   │   ├── GridGenerator.spec.ts        # Grid generation, cell distribution
│   │   ├── CollisionSystem.spec.ts      # Collision detection edge cases
│   │   ├── DifficultyTable.spec.ts      # Level scaling numbers
│   │   └── TroggleAI.spec.ts            # All 5 troggle behavior algorithms
│   ├── entities/
│   │   ├── Cell.spec.ts
│   │   ├── Player.spec.ts               # Movement boundary checks
│   │   └── Troggle.spec.ts              # Troggle timer mechanics
│   ├── state/
│   │   ├── GameState.spec.ts            # Reducer behavior, state transitions
│   │   ├── ScoreTracker.spec.ts         # Score calculation, life thresholds
│   │   └── Persistence.spec.ts          # localStorage load/save, migrations
│   ├── utils/
│   │   ├── PrimeUtils.spec.ts
│   │   ├── FactorUtils.spec.ts
│   │   └── MathUtils.spec.ts
│   └── ui/
│       └── GridRenderer.spec.ts         # Sprite creation, positioning
│
├── public/                              # Static assets (minimal, mostly empty)
├── dist/                                # Production build output (generated)
├── index.html                           # Main HTML entry point
├── package.json                         # Dependencies, scripts
├── tsconfig.json                        # TypeScript config
├── vite.config.ts                       # Vite build config
├── vitest.config.ts                     # Vitest test config
├── capacitor.config.ts                  # iOS deployment config
├── .planning/codebase/                  # This directory
│   ├── ARCHITECTURE.md
│   ├── STRUCTURE.md
│   ├── CONVENTIONS.md
│   ├── TESTING.md
│   ├── CONCERNS.md
│   ├── STACK.md
│   └── INTEGRATIONS.md
└── README.md
```

## Directory Purposes

**`src/game/logic/`** — Pure game logic layer
- Purpose: Rules, grid generation, AI, collision detection, difficulty scaling
- No Phaser imports; 100% testable
- Contains: 9 files, 12.8K LOC
- Key entry points:
  - `RuleEngine.generateRule()` — creates rule per level
  - `GridGenerator.generateGrid()` — creates 30-cell grid with rule-matching distribution
  - `TroggleAI.nextMove()` — returns next direction for each troggle type
  - `CollisionSystem.checkPlayerCell/Troggles()` — reports collision type

**`src/game/entities/`** — Entity factory functions
- Purpose: Constructors for Player, Cell, Troggle data
- Contains: 3 files, ~80 LOC total
- Pattern: Simple factory functions returning plain data objects
- Example: `createPlayer()` returns `{ row: 2, col: 2, lives: 3 }`

**`src/game/state/`** — State management & persistence
- Purpose: Main state reducers, score tracking, localStorage
- Contains: 3 files, ~14K LOC
- Key entry points:
  - `createLevelState()` — new level initialization
  - `applyMove()`, `applyMunch()`, `applyTroggleTick()`, `applyTroggleHit()` — all pure reducers
  - `Persistence.loadPlayerData()`, `savePlayerData()` — localStorage I/O
  - `addGameRecord()` — save game stats after game ends

**`src/ui/`** — Phaser rendering layer
- Purpose: Display objects, sprite drawing, animations
- Contains: 7 files, ~35K LOC (CharacterSprites.ts & TroggleSprites.ts are large pixel art maps)
- Key renderers:
  - `GridRenderer` — 2D grid of cells, player container, troggle containers
  - `HUD` — score/level/lives text in top-right
  - `DPad` — 4-direction buttons + center munch button
  - `CharacterSprites` & `TroggleSprites` — programmatic pixel art generators

**`src/scenes/`** — Phaser scene orchestration
- Purpose: Game flow, input handling, lifecycle events, scene transitions
- Contains: 13 files, 2.1K LOC total
- Hierarchy:
  - `BootScene` → `GradeSelectScene` → `MainMenuScene` → `CharacterSelectScene` → `GameScene`
  - `GameScene` launches overlays: `GameOverScene`, `LevelCompleteScene`, `CutsceneScene`
  - After game ends: `HiScoreScene` → `HistoryScene`, `ShopScene`, `SettingsScene` available
  - `DebugScene` for testing (optional)
- Pattern: Each scene has init() → create() → update() lifecycle

**`specs/`** — Test suite (138 tests across 14 files)
- Purpose: Verify game logic, state transitions, edge cases
- Mirrors: `src/` directory structure
- Runner: `vitest`
- Coverage: Focused on logic layer (100% pure functions)

## Key File Locations

**Entry Points:**
- `src/main.ts` — Phaser game initialization (768×1024, pixelArt rendering)
- `index.html` — DOM container
- `src/scenes/BootScene.ts` — First scene (minimal)

**Configuration:**
- `src/types.ts` — All type definitions (GameState, CellData, TroggleData, Rule, etc.)
- `src/constants.ts` — Visual constants: canvas size, layout zones, colors, timings (PLAYER_MOVE_MS, FLASH_*_MS)
- `vite.config.ts` — Build configuration
- `vitest.config.ts` — Test configuration

**Core Logic:**
- `src/game/logic/RuleEngine.ts` — Rule generation, equation generation, correctness validation
- `src/game/logic/GridGenerator.ts` — Grid population (67-75% correct cells)
- `src/game/logic/TroggleAI.ts` — 5 behavior algorithms (500 LOC for comprehensive AI)
- `src/game/state/GameState.ts` — All main reducers (302 LOC, highly functional)

**Rendering:**
- `src/ui/GridRenderer.ts` — Grid display (141 LOC, manages 30 cell objects + sprites)
- `src/ui/CharacterSprites.ts` — 9 player characters (941 LOC, pixel art maps)
- `src/ui/TroggleSprites.ts` — 5 enemies (343 LOC, pixel art maps)

**Testing:**
- `specs/logic/RuleEngine.spec.ts` — Rule & equation validation
- `specs/state/GameState.spec.ts` — Reducer state transitions
- `specs/logic/TroggleAI.spec.ts` — Enemy AI algorithms

## Naming Conventions

**Files:**
- `PascalCase.ts` — Modules (classes or significant exports)
  - Example: `GameState.ts`, `RuleEngine.ts`, `DPad.ts`
- `lowercase.ts` — Utility modules (functions only)
  - Example: `constants.ts`, `types.ts`
- `*.spec.ts` — Test files, mirroring source structure
  - Example: `specs/logic/RuleEngine.spec.ts` → `src/game/logic/RuleEngine.ts`

**Directories:**
- `lowercase/` — All directories are lowercase
  - Examples: `game/`, `logic/`, `entities/`, `state/`, `ui/`, `scenes/`, `specs/`

**Functions:**
- `camelCase()` — All functions, methods, exported helpers
  - Examples: `createLevelState()`, `applyMove()`, `nextMove()`, `isCorrect()`
  - Exceptions: Type predicates use `is`-prefix (`isMultipleOf`, `isTroggleDue`)

**Variables & Constants:**
- `camelCase` — Local variables, parameters
- `UPPER_SNAKE_CASE` — Global constants
  - Examples: `ROWS`, `COLS`, `TOTAL_CELLS`, `PLAYER_MOVE_MS`, `FLASH_CORRECT_MS`

**Types & Interfaces:**
- `PascalCase` — All type names
  - Examples: `GameState`, `CellData`, `TroggleData`, `Rule`, `GameMode` (union type)
- `Type<T>` — Generics capitalized
  - Examples: `CollisionResult`, `Direction` (string literal union)

**Colors & Magic Numbers:**
- Exported from `constants.ts` as `COLOR_*` and numeric constants
  - Example: `COLOR_BG = 0x1a1a2e`, `CANVAS_WIDTH = 768`

## Where to Add New Code

**New Feature (e.g., "Difficulty Settings"):**
- Primary code: `src/game/logic/` (if logic change) or `src/game/state/Persistence.ts` (if save-related)
- UI layer: `src/scenes/SettingsScene.ts` (or new scene)
- Tests: `specs/logic/` or `specs/state/`

**New Game Mode (e.g., "Algebra"):**
- Add to `GameMode` union in `src/types.ts`
- Add rule generation in `src/game/logic/RuleEngine.ts` (generator function)
- Add grid generation in `src/game/logic/GridGenerator.ts` (conditional branch)
- Add to `GradeConfig.ts` mode list for appropriate grades
- Add to `MODE_LABELS` and `MODE_EXAMPLES` in `GradeConfig.ts`
- Test: Create `specs/logic/RuleEngine.spec.ts` rules for new mode
- UI: MainMenuScene automatically shows new mode in grade menus

**New Troggle Type (e.g., "Zigzag Walker"):**
- Add to `TroggleType` union in `src/types.ts`
- Add AI logic in `src/game/logic/TroggleAI.ts`, case in `nextMove()` function
- Add pixel art in `src/ui/TroggleSprites.ts`, call from `drawTroggle()`
- Add color in `TROGGLE_COLORS` in `src/constants.ts`
- Test: `specs/logic/TroggleAI.spec.ts`, add test cases for new behavior
- GameState automatically includes in troggle pool (line 27-33)

**New Character Sprite (e.g., "Pikachu"):**
- Add to `CharacterType` union in `src/types.ts`
- Add pixel art generator function in `src/ui/CharacterSprites.ts`
- Add price in `CHARACTER_PRICES` in `src/game/state/Persistence.ts`
- Add to `CHARACTER_UNLOCK_ORDER` in `Persistence.ts`
- UI automatically appears in CharacterSelectScene and ShopScene

**New Scene (e.g., "Tutorial"):**
- Create `src/scenes/TutorialScene.ts` extending Phaser.Scene
- Add to scene list in `src/main.ts` config
- Link from appropriate existing scene: `this.scene.start('Tutorial')`
- Use `this.scene.launch()` for overlays (pauses previous scene)

**Shared Utility (e.g., "Logger"):**
- Place in `src/game/logic/` if pure logic (math, rules)
- Place in `src/ui/` if Phaser-dependent
- Export from file, import where needed
- No global singletons; pass as parameter if possible

## Special Directories

**`specs/`:**
- Purpose: Vitest unit tests
- Generated: No
- Committed: Yes
- Structure: Mirrors `src/` exactly
- Convention: `*.spec.ts` suffix
- Run: `npm test` or `npm run test:watch`

**`dist/`:**
- Purpose: Production build output
- Generated: Yes (via `vite build`)
- Committed: No (in `.gitignore`)
- Contents: Minified JS, CSS, assets

**`public/`:**
- Purpose: Static assets (copied as-is to build)
- Contains: Minimal (mostly empty; all graphics are programmatic)
- Committed: Yes

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents
- Generated: By `/gsd:map-codebase`
- Committed: Yes
- Contains: ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, CONCERNS.md, STACK.md, INTEGRATIONS.md

---

*Structure analysis: 2026-03-28*
