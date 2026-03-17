# Technical Concerns

## Critical

### Rule Target Unsafe Access
- **Files**: `src/game/logic/RuleEngine.ts:34,36`
- `rule.target!` used via non-null assertion but `target` is optional in the `Rule` type
- Primes mode generates rules without targets — if `isCorrect()` is called with wrong mode routing, `undefined` could silently pass through comparisons

### Duplicate Equation Limit
- **File**: `src/game/logic/GridGenerator.ts:39-41`
- Hard-coded 10-attempt limit for unique equation generation
- Small targets with few equation representations may exhaust attempts and produce duplicates
- No fallback or error handling when limit exceeded

## High Priority

### Grid Value Duplication at High Levels
- **File**: `src/game/logic/GridGenerator.ts:99,108`
- Uses modulo wrapping when candidate pool is smaller than needed cells
- Narrow number ranges with few matching values produce heavy duplicates (e.g., multiples of 11 in range 1-20)

### Silent Equation Fallback
- **File**: `src/game/logic/RuleEngine.ts:70-78`
- Multiplication equation generation silently falls back to addition when no factor pairs found (target=0 or 1)
- No logging or indication the equation type changed

## Medium Priority

### Non-centralized Randomness
- **Files**: `src/game/logic/TroggleAI.ts:19`, `src/game/state/GameState.ts:54-57`, `src/scenes/DebugScene.ts:130`
- Mix of direct `Math.random()` and `randomInt()` helper
- Cannot seed RNG for reproducible debugging/testing

### Depth Values Not Centralized
- **File**: `src/ui/GridRenderer.ts:55,61`
- Player depth=5, troggle depth=4 hardcoded inline
- No centralized depth hierarchy constant

## Low Priority / TODOs

### Snake Directional Sprite
- **File**: `src/ui/TroggleSprites.ts:116`
- `// TODO: Snake sprite should change view perspective based on movement direction`
- Fangs always faces same direction regardless of movement

### Character Progression System
- **File**: `src/scenes/CharacterSelectScene.ts:6`
- `// TODO: Build a progression system (unlockable characters, level milestones, etc.)`
- All 9 characters selectable from start, no unlock mechanic

### Bonehead Entry Edge Case
- **File**: `src/game/state/GameState.ts:113-117`
- Bonehead entry hardcoded to 1000 ticks and 9999 moves
- Extreme scenarios (very short/long levels) could produce unexpected behavior

## Overall Assessment
Code quality is excellent. Strong test coverage (143 tests), strict TypeScript, clean architecture, immutable state management. No performance issues identified. Production-ready with minor robustness improvements recommended.
