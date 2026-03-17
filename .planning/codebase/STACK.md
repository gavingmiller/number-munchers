# Technology Stack

## Language & Runtime
- **TypeScript** ~5.9.3 (strict mode enabled)
- ES2022 compilation target
- Browser runtime (no server-side)

## Game Framework
- **Phaser 3.90.0** — Client-side game engine for rendering, input handling, scene management

## Build & Dev Tooling
- **Vite 4.5.14** — Build tool and dev server (port 5173)
- Manual chunk splitting: Phaser bundled separately for code splitting
- Build output: `dist/`

## Testing
- **Vitest 0.34.6** — Unit test runner (node environment)
- **@vitest/coverage-v8 4.0.18** — Code coverage
- 14 spec files, 143 tests, all passing
- Config: `vitest.config.ts`

## Mobile/Native Bridge
- **@capacitor/cli 8.1.0** — Mobile app scaffolding
- **@capacitor/core 8.1.0** — Runtime bridge
- **@capacitor/ios 8.1.0** — iOS platform integration
- App ID: `com.gmiller.numbermunchers`
- Web directory: `dist` (Vite output)
- Config: `capacitor.config.ts`

## Configuration Files
- `tsconfig.json` — TypeScript strict mode, ES2022
- `vite.config.ts` — Vite build config
- `vitest.config.ts` — Vitest node environment
- `capacitor.config.ts` — iOS bridge config
- `package.json` / `package-lock.json` — Dependencies

## Entry Points
- Web: `index.html` → `src/main.ts`
- Game config initialized in `src/main.ts`

## Dependencies (Production)
- `phaser` 3.90.0
- `@capacitor/core` 8.1.0

## Dependencies (Dev)
- `typescript` ~5.9.3
- `vite` 4.5.14
- `vitest` 0.34.6
- `@vitest/coverage-v8` 4.0.18
- `@capacitor/cli` 8.1.0
- `@capacitor/ios` 8.1.0
