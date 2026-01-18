# Battlefield 6 Portal SDK Pattern Library

> **SDK Version**: 1.1.3.0
> **Pattern Library Version**: v1.3 (Sprint 7 complete - Full SDK coverage)
> **Source**: Local SDK at `Battlefield Portal SDK/`
> **Purpose**: Verified, working code patterns for reliable mod development

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `Battlefield Portal SDK/CLAUDE.md` | Main orchestrator - process routing |
| `processes/discovery.md` | Gathering mod requirements |
| `processes/building.md` | Code generation workflow |
| `processes/validation.md` | Fixing validation errors |

---

## How to Use This Library

1. **Before writing mod code**, identify which patterns apply to your mod
2. **Copy code from patterns**, adapting variable names and logic as needed
3. **All `mod.*` functions in patterns are verified** against SDK types (`bf6-portal-mod-types`)
4. **Use `/portal:validate`** to check your code for invalid functions
5. **Use `/portal:build`** for guided mod construction using patterns

---

## Pattern Categories

### Core (`patterns/core/`)

| Pattern | File | Description |
|---------|------|-------------|
| Event Hooks | [event-hooks.md](core/event-hooks.md) | All 50+ exportable event functions |
| Game Lifecycle | [game-lifecycle.md](core/game-lifecycle.md) | OnGameModeStarted initialization, vectors, teams |
| State Management | [state-management.md](core/state-management.md) | GC/GD/GS architecture, PlayerProfile registry, async loops |
| Object Equality | [object-equality.md](core/object-equality.md) | Using GetObjId for team/player comparison (critical!) |
| Variable Chasing | [variable-chasing.md](core/variable-chasing.md) | ChaseVariableAtRate, ChaseVariableOverTime, smooth interpolation |

### Player (`patterns/player/`)

| Pattern | File | Description |
|---------|------|-------------|
| Input Control | [input-control.md](player/input-control.md) | EnableInputRestriction, EnableAllInputRestrictions |
| Spawning | [spawning.md](player/spawning.md) | Deploy, spawn points, HQs, teleporting, spawn modes |
| Equipment | [equipment.md](player/equipment.md) | AddEquipment, weapons, gadgets, ammo, weapon packages |
| Multi-Team | [multi-team.md](player/multi-team.md) | 4-team setup, team balancing, GetTeamNumber helper |
| Camera Control | [camera-control.md](player/camera-control.md) | SetCameraTypeForPlayer, first/third-person, spectate mode |
| Screen Effects | [screen-effects.md](player/screen-effects.md) | EnableScreenEffect, Saturated, Stealth visual modes |
| Soldier Effects | [soldier-effects.md](player/soldier-effects.md) | SetSoldierEffect, FreezeStatusEffect, HeatStatusEffect |

### UI (`patterns/ui/`)

| Pattern | File | Description |
|---------|------|-------------|
| Widgets | [widgets.md](ui/widgets.md) | AddUIText, AddUIContainer, AddUIButton, styling |
| Custom Notifications | [custom-notifications.md](ui/custom-notifications.md) | DisplayCustomNotificationMessage, 5 persistent HUD slots |

### Gameplay (`patterns/gameplay/`)

| Pattern | File | Description |
|---------|------|-------------|
| Breakthrough | [breakthrough.md](gameplay/breakthrough.md) | Sector-based capture mode, attacker tickets, sector transitions |
| Capture Points | [capture-points.md](gameplay/capture-points.md) | Conquest objectives, capture/neutralization, progress tracking |
| Scoring | [scoring.md](gameplay/scoring.md) | Game mode score, custom scoreboard, ticket bleed |
| Economy | [economy.md](gameplay/economy.md) | Cash tracking, rewards, purchases |
| Vehicles | [vehicles.md](gameplay/vehicles.md) | Vehicle spawners, ForcePlayerToSeat, OnVehicleSpawned |
| Checkpoints | [checkpoints.md](gameplay/checkpoints.md) | Lap tracking, distance-based detection, racing systems |
| Boundaries | [boundaries.md](gameplay/boundaries.md) | Kill zones, Y-coordinate checks, SkipManDown |
| Sectors | [sectors.md](gameplay/sectors.md) | Sector progression, HQ spawners, Rush/Breakthrough zones |
| MCOMs | [mcoms.md](gameplay/mcoms.md) | Rush objectives, armed/defused/destroyed events |
| Rounds | [rounds.md](gameplay/rounds.md) | Buy phases, round transitions, timers, team switching |
| Loot System | [loot-system.md](gameplay/loot-system.md) | LootSpawner, SpawnLoot, weapon tiers, AmmoTypes, ArmorTypes |
| Ring of Fire | [ring-of-fire.md](gameplay/ring-of-fire.md) | BR shrinking zone, RingOfFire object, custom damage |
| Strike Packages | [strike-packages.md](gameplay/strike-packages.md) | CallIn gadgets, airstrikes, artillery, supply drops |
| Emplacements | [emplacements.md](gameplay/emplacements.md) | EmplacementSpawner, turrets, anti-air, TOW launchers |

### Audio (`patterns/audio/`)

| Pattern | File | Description |
|---------|------|-------------|
| Audio | [audio.md](audio/audio.md) | Music packages, sound effects, voice-over announcements |

### Spatial (`patterns/spatial/`)

| Pattern | File | Description |
|---------|------|-------------|
| Math | [math.md](spatial/math.md) | Circle distribution, direction→euler, spawn lines |
| Area Triggers | [area-triggers.md](spatial/area-triggers.md) | Event-driven boundaries, OoB detection, PolygonVolume linking |
| Objects | [objects.md](spatial/objects.md) | SpawnObject, RuntimeSpawn enums, object lifecycle |
| World Icons | [world-icons.md](spatial/world-icons.md) | WorldIcon spawning, positioning, visibility |
| VFX | [vfx.md](spatial/vfx.md) | VFX lifecycle, fire/smoke/explosions, EnableVFX |

### AI (`patterns/ai/`)

| Pattern | File | Description |
|---------|------|-------------|
| Behavior System | [behavior-system.md](ai/behavior-system.md) | 18 AI functions: spawning, behaviors, combat, movement, events |

---

## Gap Analysis Status (All Sprints Complete)

See [GAP-ANALYSIS-2026-01-18.md](GAP-ANALYSIS-2026-01-18.md) for full details.

| Sprint | Focus | Status |
|--------|-------|--------|
| Sprint 1 | AI Foundation (18 functions) | ✓ Complete |
| Sprint 2 | Core Gameplay (rounds, equipment, spawning) | ✓ Complete |
| Sprint 3 | Spatial/UI (world icons, objects, VFX) | ✓ Complete |
| Sprint 4 | BR Features (loot, ring of fire, multi-team) | ✓ Complete |
| Sprint 5 | Experimental (strike packages) | ✓ Complete |
| Sprint 6 | Gap Audit + Utility Library | ✓ Complete |
| Sprint 7 | Final Cleanup (6 remaining SDK features) | ✓ Complete |

**Pattern Library v1.3 achieves complete SDK coverage for all major feature categories.**

---

## Utility Library (bf6-portal-utils-master)

Community-built utility modules. See CLAUDE.md for full documentation.

| Module | Purpose |
|--------|---------|
| Events | Centralized event subscription |
| FFA Spawning | Smart spawn point selection |
| Interact Multi-Click | Multi-click detection |
| Logger | On-screen debug logging |
| Map Detector | Current map detection workaround |
| Performance Stats | Server tick rate monitoring |
| Raycast | Abstracted raycasting with callbacks |
| SolidUI | Reactive UI framework |
| Sounds | Sound playback with pooling |
| Timers | setTimeout/setInterval |
| UI | OOP UI wrappers |

---

## Quick Reference: Most Used Functions

### Lifecycle
```typescript
export async function OnGameModeStarted() { }
export function OnPlayerJoinGame(eventPlayer: mod.Player): void { }
export function OnPlayerDeployed(eventPlayer: mod.Player): void { }
export function OnPlayerDied(eventPlayer: mod.Player, eventOtherPlayer: mod.Player, eventDeathType: mod.DeathType, eventWeaponUnlock: mod.WeaponUnlock): void { }
```

### Vectors & Math
```typescript
mod.CreateVector(x: number, y: number, z: number): mod.Vector
mod.XComponentOf(vector: mod.Vector): number
mod.DistanceBetween(a: mod.Vector, b: mod.Vector): number
mod.Pi(): number
```

### Teams & Players
```typescript
mod.GetTeam(playerOrIndex: mod.Player | number): mod.Team
mod.GetObjId(object: any): number
mod.ClosestPlayerTo(position: mod.Vector): mod.Player
mod.Teleport(player: mod.Player, position: mod.Vector, facingAngle: number): void
```

### Timing
```typescript
await mod.Wait(seconds: number): Promise<void>  // Only in async functions
```

### Messages
```typescript
mod.Message(key: string, ...args: any[]): mod.Message
mod.DisplayNotificationMessage(message: mod.Message, target?: mod.Player | mod.Team): void
```

---

## Adding New Patterns

When documenting a new pattern:

1. **Header format**:
```markdown
# Pattern: [Name]
> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/[ModName]/[File].ts:[LineNumbers]
```

2. **Include**:
   - What it does (plain English)
   - Working code (copied from verified mods)
   - Function table with signatures from SDK types
   - Constraints and gotchas

3. **Verify**: Every `mod.*` function must exist in SDK types (`bf6-portal-mod-types`)

---

## Source Mods

Patterns are extracted from these verified example mods:

| Mod | Location | Lines | Features |
|-----|----------|-------|----------|
| BasicTemplate | `mods/_StartHere_BasicTemplate/` | ~100 | Event hooks, basic functions |
| BombSquad | `mods/BombSquad/` | ~3,600 | Economy, UI, rounds, objectives |
| AcePursuit | `mods/AcePursuit/` | ~3,600 | Racing, checkpoints, vehicles, catchup mechanics |
| BumperCars | `mods/BumperCars/` | ~3,200 | Vehicle spawning, input restriction, shrinking ring |
| CustomConquest | `mods/CustomConquest V9.2/` | ~546KB (Blocks) | Conquest mode, ticket bleed, capture points, VO, music ✓ |
| Custom Rush | `mods/Custom Rush V2.0/` | ~364KB (Blocks) | Sectors, MCOMs, AreaTriggers, HQ spawners ✓ |
| Custom Breakthrough | `mods/Custom Breakthrough V1.1/` | ~524KB (Blocks) | Breakthrough mode, sector captures, AI, vehicle cleanup ✓ |
| Exfil | `mods/Exfil/` | ~2,000 | Extraction, AI, multi-team |
| Skirmish | `mods/Skirmish/` | ~81,000 | 4-team BR, buy phase, loot, Ring of Fire, spectate |
| WarFactory | `mods/WarFactory/` | ~5,000 | RTS hybrid, base capture, pooled economy, AI grunts |

---

## Version History

- **2026-01-18**: Pattern library v1.3
  - Sprint 7 (Final Cleanup) complete - **Full SDK coverage achieved**
  - Added: UI: custom-notifications.md (DisplayCustomNotificationMessage, 5 HUD slots)
  - Added: Player: screen-effects.md (EnableScreenEffect, Saturated, Stealth)
  - Added: Player: soldier-effects.md (SetSoldierEffect, Freeze, Heat status)
  - Added: Player: camera-control.md (SetCameraTypeForPlayer, first/third-person, spectate)
  - Added: Gameplay: emplacements.md (EmplacementSpawner, turrets, anti-air, TOW)
  - Added: Core: variable-chasing.md (ChaseVariableAtRate, ChaseVariableOverTime)
  - Sources: SDK index.d.ts, Skirmish (camera control), WarFactory (emplacements)

- **2026-01-18**: Pattern library v1.2
  - Sprint 6 (Gap Audit + Utility Library) complete
  - Added: Utility library documentation (bf6-portal-utils-master, 11 modules)
  - Final gap analysis: 6 low-priority items remain for future work
  - All critical gaps from original analysis resolved

- **2026-01-18**: Pattern library v1.1
  - Added: Gameplay: strike-packages.md (CallIn gadgets, airstrikes, supply drops)
  - Sprint 5 (Experimental) complete
  - Sources: SDK index.d.ts (CallIn_* gadgets), Skirmish (commented-out usage patterns)
  - Note: SDK-verified patterns; no working mod examples exist but API is documented

- **2026-01-18**: Pattern library v1.0
  - Added: Gameplay: loot-system.md (LootSpawner, SpawnLoot, weapon tiers, AmmoTypes, ArmorTypes)
  - Added: Gameplay: ring-of-fire.md (BR shrinking zone, RingOfFire object, custom damage)
  - Added: Player: multi-team.md (4-team setup, team balancing, GetTeamNumber helper)
  - Sprint 4 (BR Features) complete
  - Sources: Skirmish (loot system, ring of fire, multi-team management)

- **2026-01-18**: Pattern library v0.9
  - Added: Spatial: world-icons.md (WorldIcon spawning, team/player visibility)
  - Added: Spatial: objects.md (SpawnObject, RuntimeSpawn enums, cleanup patterns)
  - Added: Spatial: vfx.md (VFX lifecycle, fire/smoke/explosions, EnableVFX)
  - Sprint 3 (Spatial/UI) complete
  - Sources: Skirmish (world icons), BumperCars/AcePursuit (objects, VFX), Exfil (VFX helpers)

- **2026-01-18**: Pattern library v0.8
  - Added: Gameplay: rounds.md (round phases, timers, team switching)
  - Added: Player: equipment.md (weapons, gadgets, weapon packages, ammo)
  - Added: Player: spawning.md (spawn modes, HQs, teleporting)
  - Sprint 2 (Core Gameplay) complete
  - Sources: BombSquad (rounds, equipment, spawning), Skirmish (spawning, equipment)

- **2026-01-18**: Pattern library v0.7
  - Added: AI: behavior-system.md (18 AI functions)
  - New category: AI patterns
  - Sprint 1 (AI Foundation) complete
  - Documented: Spawning, behaviors, combat, movement, gadgets, event hooks
  - Sources: WarFactory AIBehaviorHandler, Exfil AISpawnHandler/AIEnemy

- **2026-01-18**: Pattern library v0.6
  - Added: Gameplay: breakthrough.md (Breakthrough mode, capture-based sectors)
  - Updated: Audio: audio.md (added Gauntlet package, 10+ new SFX)
  - Analyzed: Custom Breakthrough V1.1 (~524KB Portal Blocks)
  - Documented: Breakthrough vs Rush differences, vehicle cleanup pattern
  - New SFX: Sector unlock, capture ticks, countdown sounds

- **2026-01-18**: Pattern library v0.5
  - Added: Gameplay: sectors.md (sector progression, HQ spawners)
  - Added: Gameplay: mcoms.md (Rush objectives, armed/defused/destroyed)
  - Added: Spatial: area-triggers.md (event-driven boundaries)
  - Analyzed: Custom Rush V2.0 (~364KB Portal Blocks)
  - Documented: ObjId conventions for sector-based modes

- **2026-01-18**: Pattern library v0.4
  - Added: Gameplay: capture-points.md, scoring.md
  - Added: Audio: audio.md (music, SFX, voice-over)
  - Analyzed: CustomConquest V9.2 (~546KB Portal Blocks)
  - New category: Audio patterns
  - Documented: 43 MusicEvents, 40+ VoiceOverEvents2D, 7 VoiceOverFlags

- **2026-01-18**: Pattern library v0.3
  - Added: Gameplay: vehicles.md, checkpoints.md, boundaries.md
  - Added: Player: input-control.md
  - Added: Spatial: math.md
  - Analyzed: BumperCars (~3,200 lines), AcePursuit (~3,600 lines)
  - Core: Updated event-hooks.md with OnVehicleSpawned

- **2026-01-17**: Pattern library v0.2
  - Added: Core: state-management.md, object-equality.md
  - Analyzed: WarFactory (~5,000 lines), Skirmish (~81,000 lines)
  - Discovered 104 distinct mod.* functions across all mods

- **2026-01-17**: Initial pattern library (v0.1)
  - Core: event-hooks.md, game-lifecycle.md
  - UI: widgets.md
  - Gameplay: economy.md
