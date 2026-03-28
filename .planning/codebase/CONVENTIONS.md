# Coding Conventions

**Analysis Date:** 2026-03-28

## Naming Patterns

**Files:**
- Functional modules (utilities, logic): PascalCase - `RuleEngine.ts`, `GridGenerator.ts`, `MathUtils.ts`
- Classes/Scenes: PascalCase - `GameScene.ts`, `LevelCompleteScene.ts`, `GridRenderer.ts`
- Type definition file: `types.ts` (shared types used by both game logic and scenes)
- Test files: match source name with `.spec.ts` suffix - `RuleEngine.spec.ts`, `Player.spec.ts`
- Directories: lowercase - `game`, `logic`, `entities`, `scenes`, `ui`

**Functions:**
- camelCase for all functions - `isCorrect()`, `generateGrid()`, `movePlayer()`, `nextMove()`
- Descriptive verb-noun pattern - `generateRule()`, `extractBlankValue()`, `getValidDirections()`, `checkPlayerCell()`
- Internal helper functions (not exported): same naming, descriptive - `generateMissingAddendsGrid()`, `activateTroggle()`, `reggieEntryDirection()`
- Unused parameters prefixed with underscore: `_grade?: GradeLevel` (see `src/game/logic/RuleEngine.ts:151` in `generateDivisionEquation()`)

**Variables:**
- camelCase for all variables
- Boolean variables use assertive names: `isCorrect`, `isMultipleOf`, `isReggieAtEdge`, `onTop`, `onBottom`
- Constants in UPPER_SNAKE_CASE: `TROGGLE_COLORS`, `CANVAS_WIDTH`, `GRADE_RANGE_CAP`, `EDGE_POSITIONS`
- Record/Map keys as UPPER_SNAKE_CASE: `FACTORS_TARGET_POOLS`, `FACTORS_BOARD_RANGE`, `GRADE_CONFIG`, `CHARACTER_PRICES`
- Grid coordinates: always `row`, `col` (never `x`/`y`)

**Types:**
- Type names in PascalCase: `GameState`, `PlayerData`, `TroggleData`, `CellData`, `Rule`
- Union types spelled out: `type GameMode = 'sums' | 'missing_addends' | 'even_odd' | ...` (see `src/types.ts:5`)
- Numeric literal types: `type GradeLevel = 1 | 2 | 3 | 4 | 5` (see `src/types.ts:6`)
- Direction type: `type Direction = 'up' | 'down' | 'left' | 'right'`
- Status unions: `type GameStatus = 'playing' | 'life-lost' | 'level-complete' | 'game-over' | 'cutscene'`

## Code Style

**Formatting:**
- TypeScript strict mode enabled (`tsconfig.json`: `strict: true`)
- Unused locals/parameters enforced: `noUnusedLocals: true`, `noUnusedParameters: true`
- No inline type assertions; explicit imports for shared types
- Import `.ts` file extensions explicitly (`...from '../../types.ts'`)
- 2-space indentation
- Single quotes for strings (`'multiples'`)
- Semicolons always included
- Trailing commas in multi-line arrays/objects

**Linting:**
- TypeScript compiler only (no ESLint/Prettier config files)
- `erasableSyntaxOnly: true` enforces syntax-only type annotations
- `noFallthroughCasesInSwitch: true` prevents missing breaks in switch statements
- `verbatimModuleSyntax: true` for precise module imports

## Import Organization

**Order:**
1. Type imports: `import type { GameState, Direction, ... } from '../../types.ts'`
2. Value imports: `import { createLevelState, applyMove, ... } from '../game/state/GameState.ts'`
3. Relative paths: use dot-relative imports with explicit `.ts` extensions
4. Phaser imports (scenes only): `import Phaser from 'phaser'`

**Path Patterns:**
- Shared types: always from root - `import type { Rule } from '../../types.ts'`
- Game logic: `import { isCorrect } from './RuleEngine.ts'` or `import { randomInt } from './MathUtils.ts'`
- Entities: `import { createPlayer } from '../entities/Player.ts'`
- State: `import { createLevelState } from '../state/GameState.ts'`
- UI components: `import { GridRenderer } from '../ui/GridRenderer.ts'` (scenes only)

**No barrel files:** Each module imports directly from specific source files.

## Error Handling

**Pattern:** Defensive by return type, not throwing errors

**Approach:**
- Return sentinel values (NaN, empty array, false) rather than throwing
- `extractBlankValue()` returns `NaN` if parsing fails (see `src/game/logic/RuleEngine.ts:69-87`)
- Check for NaN with `Number.isNaN()`: `if (Number.isNaN(num)) return false;` (see `RuleEngine.ts:51-52`)
- Guard clauses at function entry: `if (target === 0) return false;` in `isMultipleOf()` (see `MathUtils.ts:1-4`)

**Validation:**
- Type checks with typeof: `if (typeof value === 'string')` (see `RuleEngine.ts:34`)
- Bounds clamping: `Math.max(0, row - 1)` in `movePlayer()` (see `src/game/entities/Player.ts:14-27`)
- No try/catch blocks (logic is deterministic and pure)

## Logging

**Framework:** console (no logging in production code)

**Patterns:**
- No console.log/warn/error in core game logic
- No logging in state, entity, or utility modules
- Debug visualization only in `DebugOverlay.ts` for development

## Comments

**When to Comment:**
- Algorithm intent (not code description)
- Non-obvious edge cases
- Grade-level difficulty progressions
- Example: `// Grade 2 progression: levels 1-3 → 20, levels 4-6 → 30, levels 7+ → 50`

**JSDoc/TSDoc:**
- Function description above signature (1-2 sentences)
- Parameter types and return types in function signature
- Example: `/** Evaluate a simple equation string like "3+4", "8-1", "2×5". */`
- File headers: `// ============================================================`
- Property documentation in interfaces: `moveTimer: number;    // ticks until next move`

## Function Design

**Size:** Small, single-responsibility functions (typically 10-30 lines)

**Parameters:**
- Max 3-4 explicit parameters
- Optional parameters at end with `?:` syntax
- Unused parameters prefixed with underscore: `_grade?: GradeLevel`
- Grid boundary param: `grid: { rows: number; cols: number }`

**Return Values:**
- Return immutable copies using spread: `return { ...player, row, col }` (see `src/game/entities/Player.ts:29`)
- Preserve input: `shuffle()` returns new array, doesn't mutate
- Explicit return type declarations: `function movePlayer(...): PlayerData`

## Module Design

**Exports:**
- Named exports only (no default exports)
- Export types above function implementations
- Constants exported alongside functions: `export const FACTORS_TARGET_POOLS = { ... }`

**Module Boundaries:**
- `src/types.ts`: Type definitions only (no Phaser imports; shared by logic and scenes)
- `src/game/logic/`: Pure game logic (RuleEngine, GridGenerator, DifficultyTable, MathUtils, etc.)
- `src/game/entities/`: Entity constructors and operations (Player, Troggle, Cell)
- `src/game/state/`: Stateful operations and persistence (GameState, Persistence, ScoreTracker)
- `src/scenes/`: Phaser Scene classes and game orchestration
- `src/ui/`: Rendering and UI components (GridRenderer, HUD, DPad, Sprites)

**Immutability Pattern:**
- Game logic operates on immutable data structures
- State transformations return new objects with spread syntax
- Player/entity operations return copies, not mutations
- No array mutations — use `map()`, `filter()`, `concat()`

---

*Convention analysis: 2026-03-28*
