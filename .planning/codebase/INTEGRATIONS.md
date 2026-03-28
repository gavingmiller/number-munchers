# External Integrations

**Analysis Date:** 2026-03-28

## APIs & External Services

**None.** Number Munchers makes no HTTP requests or API calls at runtime.

## Data Storage

**Client-side Persistence:**
- Browser localStorage (key: `numberMunchers_player`)
- Format: JSON
- Implementation: `src/game/state/Persistence.ts`
- Persists: game history, character unlocks, theme/music unlocks, control settings
- Fallback: If localStorage is unavailable or corrupted, app reverts to default player data

**In-Memory State:**
- Game session state is ephemeral
- Survives page refresh if localStorage is intact
- Lost on browser close (unless user manually cleared cache)

## Authentication & Identity

**None.** Single-player app with no user accounts or authentication.

## Monitoring & Observability

**Error Tracking:** None

**Logs:** None (console logs for debug scenes only in `src/scenes/DebugScene.ts`)

## CI/CD & Deployment

**Web Hosting:**
- Vite build output (`dist/`) can be served from any static file server
- Compatible with CDNs (relative asset paths via `base: './'`)

**iOS Deployment:**
- Capacitor bridge → native Xcode project
- App ID: `com.gmiller.numbermunchers`
- Build: `npm run build` → `dist/` → Capacitor sync → Xcode build

**Asset Generation (Build-time only):**
- Script: `scripts/generate-ios-assets.ts` (runs via Bun)
- Generates iOS app icons and splash screens using @napi-rs/canvas
- Output: `assets/ios/` (not used in game runtime)
- Does NOT run as part of standard build pipeline

## Environment Configuration

**Required env vars:** None

**Secrets location:** N/A (no API keys or secrets needed)

**Browser APIs Used:**
- Window.localStorage — game state persistence
- Canvas API — rendering (via Phaser)
- Touch/Pointer API — mobile input (via Phaser)
- Gamepad API — controller support (not currently implemented)

## Webhooks & Callbacks

**Incoming:** None

**Outgoing:** None

---

*Integration audit: 2026-03-28*
