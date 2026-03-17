# External Integrations

## Status: No External Integrations

Number Munchers is a **standalone browser game** with no external dependencies.

- No API endpoints (no fetch, axios, or HTTP clients)
- No database connections (no localStorage, indexedDB, Firebase, Supabase)
- No authentication providers
- No webhooks or external callbacks
- No CDN dependencies (all assets are procedurally generated pixel art)

## Game State
- Entirely client-side and in-memory
- No persistence layer — game state is ephemeral per session
- Scoring is immediate, no backend sync

## Capacitor (iOS)
- Configured for iOS deployment but used as build-time bridge only
- No native plugins or device APIs consumed in game source code
