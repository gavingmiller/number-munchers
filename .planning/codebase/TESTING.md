# Testing Patterns

**Analysis Date:** 2026-03-28

## Test Framework

**Runner:**
- Vitest 0.34.6
- Config: `vitest.config.ts`:
  ```typescript
  export default defineConfig({
    test: {
      environment: 'node',
      include: ['specs/**/*.spec.ts'],
      exclude: ['node_modules', 'dist', 'ios'],
    },
  });
  ```

**Assertion Library:**
- Vitest built-in expect() API
- Common matchers: `.toBe()`, `.toEqual()`, `.toHaveLength()`, `.toContain()`, `.toMatch()`, `.toBeGreaterThan()`, `.toBeLessThanOrEqual()`

**Run Commands:**
```bash
npm run test              # Run all tests (Vitest run mode)
npm run test:watch       # Watch mode (re-run on file changes)
vitest run --coverage    # Coverage report
```

**Coverage:**
- @vitest/coverage-v8 v4.0.18 installed
- No minimum threshold enforced

## Test File Organization

**Location:** Parallel structure to source directories

**Pattern:** Co-located hierarchy:
- `src/game/logic/RuleEngine.ts` → `specs/logic/RuleEngine.spec.ts`
- `src/game/entities/Player.ts` → `specs/entities/Player.spec.ts`
- `src/game/state/GameState.ts` → `specs/state/GameState.spec.ts`

**Naming:** `[SourceName].spec.ts` convention

**Directory Structure:**
```
specs/
├── logic/               # Game logic tests (6 files)
│   ├── RuleEngine.spec.ts
│   ├── GridGenerator.spec.ts
│   ├── DifficultyTable.spec.ts
│   ├── CollisionSystem.spec.ts
│   ├── TroggleAI.spec.ts
│   └── GradeConfig.spec.ts
├── entities/            # Entity tests (3 files)
│   ├── Player.spec.ts
│   ├── Troggle.spec.ts
│   └── Cell.spec.ts
├── state/               # Game state tests (4 files)
│   ├── GameState.spec.ts
│   ├── Persistence.spec.ts
│   ├── ScoreTracker.spec.ts
│   └── HistoryTracker.spec.ts
├── utils/               # Utility tests (3 files)
│   ├── MathUtils.spec.ts
│   ├── FactorUtils.spec.ts
│   └── PrimeUtils.spec.ts
└── ui/                  # UI component tests (1 file)
    └── GridRenderer.spec.ts
```

**Total:** ~1998 lines of test code across 16 spec files, all passing

## Test Structure

**Basic Pattern:**

```typescript
import { describe, it, expect } from 'vitest';
import { isCorrect, generateRule } from '../../src/game/logic/RuleEngine.ts';
import type { Rule } from '../../src/types.ts';

describe('isCorrect', () => {
  it('detects multiples correctly', () => {
    const rule: Rule = { mode: 'multiples', target: 6, description: 'Multiples of 6' };
    expect(isCorrect(12, rule)).toBe(true);
    expect(isCorrect(18, rule)).toBe(true);
    expect(isCorrect(7, rule)).toBe(false);
  });

  it('detects factors correctly', () => {
    const rule: Rule = { mode: 'factors', target: 12, description: 'Factors of 12' };
    expect(isCorrect(3, rule)).toBe(true);
    expect(isCorrect(4, rule)).toBe(true);
    expect(isCorrect(5, rule)).toBe(false);
  });
});
```

**Organization:**
- One `describe()` per exported function or class
- Multiple `it()` blocks for different scenarios
- Descriptive test names: present tense - `'detects multiples correctly'`, `'moves down'`, `'does not mutate'`
- Implicit Arrange-Act-Assert: setup in it() block, execute in expect()

**Setup & Teardown:**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Persistence', () => {
  beforeEach(() => {
    mockLocalStorage.clear();  // Reset before each test
  });

  it('loadPlayerData returns defaults when empty', () => {
    const data = loadPlayerData();
    expect(data.history).toEqual([]);
  });
});
```

- `beforeEach()` resets shared state between tests
- No afterEach hooks (tests self-contained)
- No global setup files

## Mocking

**Framework:** Manual mocking (no Vitest vi.mock)

**localStorage Mock (from `specs/state/Persistence.spec.ts`):**

```typescript
const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  get length() { return Object.keys(store).length; },
  key: (_i: number) => null,
};
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage });
```

**What to Mock:**
- Browser APIs: localStorage (Persistence tests only)
- Nothing else mocked (game is offline; no network calls)

**What NOT to Mock:**
- Game logic functions (test real isCorrect, generateGrid, etc.)
- Randomization (test actual randomInt/shuffle across multiple iterations)
- State constructors (test real object creation)
- Phaser (tests avoid Scene classes; pure logic only)

## Fixtures and Factories

**Factory Functions:**

```typescript
// From specs/state/Persistence.spec.ts
function makeRecord(overrides: Partial<GameRecord> = {}): GameRecord {
  return {
    id: `game-${Date.now()}`,
    date: new Date().toISOString(),
    grade: 3,
    mode: 'multiples',
    character: 'claude',
    levelReached: 5,
    starsEarned: 20,
    totalAnswers: 25,
    correctAnswers: 20,
    wrongAnswers: 5,
    deaths: [],
    problems: [],
    ...overrides,
  };
}

// Usage: makeRecord({ grade: 2, mode: 'primes' })
```

**Inline Fixtures:**

```typescript
// From specs/logic/TroggleAI.spec.ts
const emptyGrid: CellData[] = [];
const player: PlayerData = { row: 3, col: 3, lives: 3 };

describe('nextMove', () => {
  it('fangs moves toward player when directly right', () => {
    const troggle = createTroggle('t1', 'fangs', 3, 0, 10);
    const dir = nextMove(troggle, player, emptyGrid);
    expect(dir).toBe('right');
  });
});
```

**Location:** Factories at file top; inline fixtures in describe() blocks; shared constants before first describe()

## Coverage

**Requirements:** None enforced

**Current State:**
- ~1998 lines of test code
- 16 spec files across logic, entities, state, utils, ui
- All passing
- Tests focus on deterministic game logic

**Test-to-Source Ratio:** ~1:1 (balanced coverage of core logic)

## Test Types

**Unit Tests (primary):**
- Pure function testing: RuleEngine, MathUtils, GridGenerator, utilities
- Input-output verification with deterministic and edge cases
- Type safety verified with explicit types
- Example: `isCorrect(12, { mode: 'multiples', target: 6 })` returns `true`
- Mocked data using factories for complex objects

**Integration Tests (secondary):**
- State transitions: GameState creation, apply moves/munches/ticks
- Persistence round-trip: save/load data consistency
- Grid generation with validation: generateGrid() output passes isCorrect() for 67-75% cells
- Example: Create level → Apply move → Verify state updated

**Property-Based Tests (limited):**
- Randomized functions tested across multiple iterations
- `randomInt(5, 10)` loop: 100 iterations verifying range
- `shuffle()` tested: no mutations, same length, same elements
- Grade-based rule generation: all levels (1-12) produce valid rules

**E2E Tests:** None (single-player offline game; no external integrations)

## Common Patterns

**Async Testing:**
- Not used (all game logic is synchronous)
- No promises or async/await

**Error/Edge Case Testing:**

```typescript
// From specs/logic/GridGenerator.spec.ts
it('all cells have valid row (0-5) and col (0-4)', () => {
  const grid = generateGrid(rule, config);
  for (const cell of grid) {
    expect(cell.row).toBeGreaterThanOrEqual(0);
    expect(cell.row).toBeLessThanOrEqual(5);
    expect(cell.col).toBeGreaterThanOrEqual(0);
    expect(cell.col).toBeLessThanOrEqual(4);
  }
});

it('has no duplicate positions', () => {
  const grid = generateGrid(rule, config);
  const positions = grid.map((c) => `${c.row},${c.col}`);
  const unique = new Set(positions);
  expect(unique.size).toBe(30);
});

it('missing_addends grid produces equation strings with underscores', () => {
  const maRule: Rule = { mode: 'missing_addends', target: 5, description: 'Missing number is 5' };
  const grid = generateGrid(maRule, { numberRangeMin: 1, numberRangeMax: 20 }, 1);
  for (const cell of grid) {
    expect(typeof cell.value).toBe('string');
    expect(cell.value as string).toContain('_');
  }
});
```

**Type Safety in Tests:**

```typescript
// Explicit type annotations to catch contract violations
const rule: Rule = { mode: 'multiples', target: 6, description: 'Multiples of 6' };
const troggle = {
  ...createTroggle('t1', 'reggie', 3, 2, 10),
  direction: 'right' as const  // Literal type assertion
};
```

**Boundary Testing:**

```typescript
// From specs/entities/Player.spec.ts
it('clamps up at row=0', () => {
  const player = { row: 0, col: 2, lives: 3 };
  const moved = movePlayer(player, 'up', grid);
  expect(moved.row).toBe(0);  // Already at boundary
});

it('does not mutate original player', () => {
  const player = createPlayer();
  movePlayer(player, 'down', grid);
  expect(player.row).toBe(2);  // Original unchanged
});

it('clamps right at col=4', () => {
  const player = { row: 2, col: 4, lives: 3 };
  const moved = movePlayer(player, 'right', grid);
  expect(moved.col).toBe(4);  // Already at boundary
});
```

**Deterministic + Randomized Testing:**

```typescript
// From specs/utils/MathUtils.spec.ts
it('returns values within range', () => {
  for (let i = 0; i < 100; i++) {
    const val = randomInt(5, 10);
    expect(val).toBeGreaterThanOrEqual(5);
    expect(val).toBeLessThanOrEqual(10);
  }
});

// From specs/logic/RuleEngine.spec.ts
it('produces an addition equation that equals target', () => {
  for (let i = 0; i < 20; i++) {
    const eq = generateEquation(10);
    const rule: Rule = { mode: 'equalities', target: 10, description: 'Equals 10' };
    expect(isCorrect(eq, rule)).toBe(true);
  }
});

// From specs/logic/RuleEngine.spec.ts - Loop testing across levels
it('generates a factors rule from curated pool for each level', () => {
  for (let level = 1; level <= 8; level++) {
    const maxPoolLevel = Math.max(...Object.keys(FACTORS_TARGET_POOLS).map(Number));
    const poolLevel = Math.min(level, maxPoolLevel);
    const pool = FACTORS_TARGET_POOLS[poolLevel];
    for (let i = 0; i < 20; i++) {
      const rule = generateRule('factors', level);
      expect(rule.mode).toBe('factors');
      expect(pool).toContain(rule.target);
    }
  }
});
```

**Regex Matching for Descriptions:**

```typescript
// From specs/logic/RuleEngine.spec.ts
expect(rule.description).toMatch(/^Multiples of \d+$/);
expect(rule.description).toMatch(/^Equals \d+$/);
expect(rule.description).toContain('_');
```

**Stateful Objects with Factory Overrides:**

```typescript
// Create base record with custom properties
const record = makeRecord({ grade: 2, mode: 'primes' });
expect(record.grade).toBe(2);
expect(record.mode).toBe('primes');
expect(record.id).toBeDefined();  // Default factory value
expect(record.starsEarned).toBe(20);  // Default factory value
```

---

*Testing analysis: 2026-03-28*
