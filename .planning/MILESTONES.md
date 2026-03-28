# Milestones: Number Munchers

## v1.0 — Core Game (Completed)

**Shipped:** 2026-03-28
**Phases:** 1-5 (informal, pre-GSD)

### What shipped:
- Grid-based math gameplay with 10 modes across 5 grades
- 5 troggle enemy types with distinct AI (reggie, fangs, squirt, ember, bonehead)
- 9 playable characters with programmatic pixel art
- Star-based progression system replacing points
- Character unlock shop (tiered 100-7500 stars)
- Game history tracking for parents (last 10 games)
- Settings with center/two-handed touch controls
- iOS app deployment with icon and splash screens
- 225+ tests, pixel-perfect rendering, grade-appropriate difficulty

### Key decisions:
- Phaser 3 + TypeScript + Vite stack
- Programmatic pixel art (no image assets)
- localStorage for all persistence
- Stars as universal currency
