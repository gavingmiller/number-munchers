# Technology Stack

**Analysis Date:** 2026-03-28

## Languages

**Primary:**
- TypeScript ~5.9.3 - All source code, strict mode enabled
- HTML5 - Application entry point (`index.html`)
- CSS - Minimal inline styling in index.html

## Runtime

**Environment:**
- Browser runtime (DOM + Canvas APIs)
- iOS native wrapper via Capacitor

**Package Manager:**
- npm (package.json + package-lock.json)
- Also supports Bun (`bun.lock` exists)

## Frameworks

**Core:**
- Phaser 3.90.0 - 2D game engine (rendering, input, scene management, physics-free)

**Build/Dev:**
- Vite 4.5.14 - Dev server (port 5173), build bundler with code splitting
- TypeScript 5.9.3 - Type checking and transpilation

**Mobile:**
- @capacitor/cli 8.1.0 - CLI for iOS/Android project management
- @capacitor/core 8.1.0 - Native bridge runtime
- @capacitor/ios 8.1.0 - iOS platform integration

## Key Dependencies

**Critical:**
- phaser 3.90.0 - Game rendering, scene management, input handling

**Build-time Asset Generation:**
- @napi-rs/canvas 0.1.97 - Server-side canvas for generating iOS app icon and splash screens (script only, not in-game)

**Testing:**
- vitest 0.34.6 - Unit test runner (Node environment)
- @vitest/coverage-v8 4.0.18 - Code coverage reports

## Configuration

**Environment:**
- Development: `npm run dev` → Vite dev server on port 5173
- Production: `npm run build` → Type check + Vite bundle to `dist/`
- Testing: `npm test` (run) or `npm run test:watch` (watch mode)

**TypeScript:**
- Target: ES2022
- Module resolution: bundler (ESNext imports)
- Strict mode enabled: noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch
- Files: `src/**`, `specs/**`, `capacitor.config.ts`

**Build:**
- Vite base: `./` (relative paths for iOS asset serving)
- Assets directory: `assets/`
- Manual chunks: Phaser bundled separately
- Render options: pixelArt mode, rounded pixels

## Platform Requirements

**Development:**
- Node.js (supports npm and Bun)
- macOS or Linux for Vite dev server
- Modern browser with ES2022 + Canvas support

**Production:**
- iOS 14+ (via Capacitor)
- Web browsers with HTML5 Canvas (fallback to WebGL if available)
- localStorage support required (game saves)

**iOS Deployment:**
- Xcode for compiling native iOS app
- App ID: `com.gmiller.numbermunchers`
- Web directory: `dist/` (Vite output)
- Splash screens: 1284×2778, 1170×2532, 2048×2732, 1668×2388 (PNG assets)
- App icon: 1024×1024 (PNG)
- Content inset: always
- Preferred content mode: desktop

---

*Stack analysis: 2026-03-28*
