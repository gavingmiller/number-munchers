# Directory Structure

```
number-munchers/
├── src/
│   ├── main.ts                          # Phaser game config entry point
│   ├── types.ts                         # Shared types (NO Phaser imports)
│   ├── constants.ts                     # Visual constants (canvas, layout, colors)
│   │
│   ├── game/
│   │   ├── logic/
│   │   │   ├── RuleEngine.ts            # Rule generation & validation
│   │   │   ├── GridGenerator.ts         # 6x5 grid generation
│   │   │   ├── TroggleAI.ts             # 5 troggle movement behaviors
│   │   │   ├── CollisionSystem.ts       # Collision detection
│   │   │   ├── DifficultyTable.ts       # Level scaling
│   │   │   ├── MathUtils.ts             # Multiples, random, shuffle
│   │   │   ├── PrimeUtils.ts            # Prime number checking
│   │   │   └── FactorUtils.ts           # Factor checking
│   │   │
│   │   ├── entities/
│   │   │   ├── Player.ts                # Player creation & movement
│   │   │   ├── Cell.ts                  # Cell creation & state
│   │   │   └── Troggle.ts               # Troggle creation & ticking
│   │   │
│   │   └── state/
│   │       ├── GameState.ts             # Level state, main reducers
│   │       └── ScoreTracker.ts          # Score & life management
│   │
│   ├── ui/
│   │   ├── GridRenderer.ts              # Grid + player/troggle sprites
│   │   ├── HUD.ts                       # Score, level, lives display
│   │   ├── RuleBanner.ts                # Rule description banner
│   │   ├── DPad.ts                      # On-screen d-pad buttons
│   │   ├── CharacterSprites.ts          # 9 player character pixel art
│   │   ├── TroggleSprites.ts            # 5 troggle type pixel art
│   │   └── DebugOverlay.ts              # Debug info display
│   │
│   └── scenes/
│       ├── BootScene.ts                 # Game initialization
│       ├── MainMenuScene.ts             # Mode selection
│       ├── CharacterSelectScene.ts      # Character selection (9 chars)
│       ├── GameScene.ts                 # Main gameplay loop
│       ├── GameOverScene.ts             # Life lost overlay
│       ├── CutsceneScene.ts             # Interlude every 3 levels
│       ├── HiScoreScene.ts              # Final score display
│       └── DebugScene.ts               # Testing/debugging scene
│
├── specs/
│   ├── logic/
│   │   ├── RuleEngine.spec.ts
│   │   ├── GridGenerator.spec.ts
│   │   ├── CollisionSystem.spec.ts
│   │   ├── DifficultyTable.spec.ts
│   │   └── TroggleAI.spec.ts
│   ├── entities/
│   │   ├── Cell.spec.ts
│   │   ├── Player.spec.ts
│   │   └── Troggle.spec.ts
│   ├── state/
│   │   ├── GameState.spec.ts
│   │   └── ScoreTracker.spec.ts
│   ├── utils/
│   │   ├── PrimeUtils.spec.ts
│   │   ├── FactorUtils.spec.ts
│   │   └── MathUtils.spec.ts
│   └── ui/
│       └── GridRenderer.spec.ts
│
├── public/                              # Static assets (minimal)
├── dist/                                # Production build output
├── index.html                           # Main HTML entry
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── capacitor.config.ts
└── README.md
```

## Key Locations

| What | Where |
|------|-------|
| Game logic (pure functions) | `src/game/logic/` |
| Entity factories | `src/game/entities/` |
| State management | `src/game/state/` |
| Phaser rendering | `src/ui/` |
| Scene lifecycle | `src/scenes/` |
| Shared types | `src/types.ts` |
| Visual constants | `src/constants.ts` |
| Tests | `specs/` (mirrors `src/` structure) |
| Build output | `dist/` |

## Naming Conventions

- **Files**: PascalCase for modules (`GameState.ts`, `TroggleAI.ts`)
- **Directories**: lowercase (`game`, `logic`, `entities`, `ui`, `scenes`, `specs`)
- **Tests**: `*.spec.ts` suffix, mirroring source structure
- **Types/Interfaces**: PascalCase (`GameState`, `CellData`)
- **Functions**: camelCase (`isCorrect`, `movePlayer`, `randomInt`)
- **Constants**: UPPER_SNAKE_CASE (`ROWS`, `COLS`, `TOTAL_CELLS`)
