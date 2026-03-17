# Testing

## Framework & Configuration
- **Framework**: Vitest 0.34.6
- **Environment**: `node` (no browser simulation)
- **Config**: `vitest.config.ts`
- **Test discovery**: `specs/**/*.spec.ts`
- **Exclusions**: `node_modules`, `dist`, `ios`
- **Commands**: `npm test` (once), `npm run test:watch` (watch mode)

## Test Suite
- **14 spec files** across 5 directories
- **143 tests**, all passing
- Coverage tool: `@vitest/coverage-v8`

## File Structure
Tests mirror `src/` structure under `specs/`:

```
specs/
├── logic/       → src/game/logic/
├── entities/    → src/game/entities/
├── state/       → src/game/state/
├── utils/       → src/game/logic/*Utils.ts
└── ui/          → src/ui/
```

## Test Files by Module

| File | Tests | Focus |
|------|-------|-------|
| `specs/state/GameState.spec.ts` | ~32 | State reducers, movement, collisions |
| `specs/logic/TroggleAI.spec.ts` | ~15 | AI behavior for 5 troggle types |
| `specs/logic/RuleEngine.spec.ts` | ~15 | Rules, equations, correctness |
| `specs/entities/Troggle.spec.ts` | ~12 | Troggle creation and ticking |
| `specs/utils/MathUtils.spec.ts` | ~9 | Math utilities |
| `specs/utils/PrimeUtils.spec.ts` | ~8 | Prime checking |
| `specs/entities/Player.spec.ts` | ~7 | Player creation and movement |
| `specs/state/ScoreTracker.spec.ts` | ~7 | Score and extra lives |
| `specs/logic/CollisionSystem.spec.ts` | ~6 | Collision detection |
| `specs/utils/FactorUtils.spec.ts` | ~6 | Factor checking |
| `specs/logic/GridGenerator.spec.ts` | ~5 | Grid generation |
| `specs/ui/GridRenderer.spec.ts` | ~5 | Visibility contract |
| `specs/logic/DifficultyTable.spec.ts` | ~13 | Level scaling + factors mode |
| `specs/entities/Cell.spec.ts` | ~3 | Cell creation |

## Assertion Patterns
- Import: `import { describe, it, expect } from 'vitest'`
- Common matchers: `.toBe()`, `.toEqual()`, `.toHaveLength()`, `.toContain()`, `.toMatch()`, `.toBeGreaterThan()`
- No custom matchers — standard Vitest/Chai only

## Test Organization
- `describe()` blocks grouped by function/behavior
- `it()` names use present tense: "returns", "detects", "moves", "does not mutate"
- Each test creates fresh data — no shared state

## Mocking Approach
- Hand-crafted mock objects (no mocking library)
- Factory functions: `makeState(overrides)`, `makeMockText()`
- Spread for shallow copies: `{ ...state, player: { ...state.player, row: 5 } }`
- No dependency injection in production — functions accept all params explicitly

## Key Testing Patterns
1. **Immutability verification**: "does not mutate original" tests
2. **Edge cases**: Boundary conditions (corners, max values, zero)
3. **Deterministic iteration**: Loop 20x for random-based functions
4. **State machine testing**: Status transitions (`life-lost` → `game-over`)
5. **Mock Phaser objects**: Stubs for Text, Graphics (UI tests only)
