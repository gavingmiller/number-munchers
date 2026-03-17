# Code Conventions

## Code Style
- **Indentation**: 2 spaces
- **Quotes**: Single quotes (`'multiples'`)
- **Semicolons**: Always included
- **Trailing commas**: Used in multi-line arrays/objects
- **Line length**: Generally under 100 characters

## Naming
- **Functions & variables**: camelCase (`isCorrect`, `movePlayer`, `randomInt`)
- **Types & interfaces**: PascalCase (`GameState`, `PlayerData`, `CellData`)
- **Type aliases**: PascalCase (`GameMode`, `CellState`, `Direction`)
- **Module-level constants**: UPPER_SNAKE_CASE (`ROWS`, `COLS`, `CANVAS_WIDTH`)
- **Files**: PascalCase matching content (`GameState.ts`, `TroggleAI.ts`)
- **Directories**: lowercase (`game`, `logic`, `entities`)

## TypeScript Patterns

### Types vs Interfaces
- `type` for union types: `type GameMode = 'multiples' | 'factors' | 'primes' | 'equalities'`
- `interface` for object contracts: `interface Rule { mode: GameMode; target?: number; ... }`
- Discriminated unions: `type CollisionResult = | { type: 'correct'; ... } | { type: 'wrong'; ... }`

### Imports
- `import type { TypeName } from '...'` for type-only imports
- `import { functionName } from '...'` for values
- ES modules with `.ts` extensions: `'../../types.ts'`
- No barrel exports — direct path imports only

### Other Patterns
- Explicit return types on all functions
- Strict mode enabled (`tsconfig.json`)
- Non-null assertions used sparingly (`rule.target!`)
- Optional parameters with `?` (`previousScore?: ScoreData`)
- Generics used sparingly (`shuffle<T>()`)

## Error Handling
- Defensive early returns for invalid states
- `Number.isNaN()` checks for numeric validation
- Default cases in switch statements
- No try-catch — game logic avoids exceptions
- Bounds checking with `Math.max()` / `Math.min()`

## Export Patterns
- Named exports only (`export function`, `export const`, `export type`)
- Single responsibility per file
- Private functions: no `export` keyword, plain `function`

## Immutability
- All state mutations use spread: `{ ...state, prop: newValue }`
- No array mutations — use `map()`, `filter()`, `concat()`
- Reducers are pure (no side effects)

## Comments
- File headers: `// ============================================================`
- JSDoc for exported functions: `/** Generate a random equation... */`
- Inline comments on complex properties: `moveTimer: number; // ticks until next move`
- Comments explain "why" not "what"
