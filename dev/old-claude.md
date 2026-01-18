# Battlefield 6 Portal SDK - Claude Context

> **SDK Version**: 1.1.3.0
> **Last Updated**: 2026-01-18 (Sprint 7 complete - Pattern Library v1.3 - Full SDK coverage)

## Critical Constraint: BF2042 vs BF6 Isolation

**Battlefield 2042 was internally called "Battlefield 6" during development.** This causes LLMs to confuse the two games. While Portal exists for both and shares similarities, mixing code/documentation causes errors.

**Rule**: ALL code patterns must source from the local SDK only. Never use web-sourced BF2042 code examples.

---

## The Problem We're Solving

When building Portal mods, Claude tends to "invent" TypeScript commands based on general knowledge rather than the actual Portal SDK API. This causes compilation failures when uploaded to the Portal website.

**Solution**: A pattern library of verified working code, plus validation skills to check code before delivery.

---

## SDK Structure

```
Battlefield Portal SDK/
├── node_modules/
│   └── bf6-portal-mod-types/  # TypeScript types with JSDoc (npm package)
├── code/
│   ├── mod/index.d.ts      # 200+ functions, 24,540 lines - local reference copy
│   └── modlib/index.ts     # Helper utilities (Concat, And, WaitUntil, etc.)
├── mods/                   # 9 working example mods (~100,000 lines total)
│   ├── _StartHere_BasicTemplate/
│   ├── AcePursuit/         # Racing, checkpoints, catchup mechanics (~3,600 lines) ✓
│   ├── BombSquad/          # Economy, rounds, UI (~3,600 lines) ✓
│   ├── BumperCars/         # Vehicle spawning, shrinking ring (~3,200 lines) ✓
│   ├── CustomConquest V9.2/# Conquest mode, tickets, capture points, VO, music (~546KB Blocks) ✓
│   ├── Custom Rush V2.0/   # Rush mode, sectors, MCOMs, AreaTriggers (~364KB Blocks) ✓
│   ├── Custom Breakthrough V1.1/ # Breakthrough mode, sector captures, AI (~524KB Blocks) ✓
│   ├── Exfil/              # Extraction mode (~2,000 lines)
│   ├── Skirmish/           # 4-team BR, loot, Ring of Fire (~81,000 lines) ✓
│   └── WarFactory/         # RTS hybrid, base capture, AI grunts (~5,000 lines) ✓
├── patterns/               # OUR pattern library (v1.3 - Full SDK coverage)
│   ├── _index.md           # Master catalog
│   ├── core/               # Event hooks, game lifecycle, state management, variable chasing
│   ├── player/             # Input control, spawning, equipment, multi-team, camera, effects
│   ├── ui/                 # Widgets, custom notifications
│   ├── gameplay/           # Economy, vehicles, checkpoints, boundaries, capture points, scoring, sectors, MCOMs, breakthrough, loot, ring-of-fire, strike-packages, rounds, emplacements
│   ├── audio/              # Music, SFX, voice-over
│   ├── spatial/            # Math utilities, area triggers, world icons, objects, VFX
│   ├── ai/                 # AI behavior system (18 functions)
│   └── examples/           # Demo mods built from patterns
├── bf6-portal-utils-master/ # Community utility library (11 modules)
│   ├── events/             # Centralized event subscription
│   ├── ffa-spawning/       # Free-For-All spawn system
│   ├── interact-multi-click-detector/ # Multi-click detection
│   ├── logger/             # On-screen debug logging
│   ├── map-detector/       # Current map detection workaround
│   ├── performance-stats/  # Server tick rate monitoring
│   ├── raycast/            # Abstracted raycasting with callbacks
│   ├── solid-ui/           # Reactive UI framework (SolidJS-inspired)
│   ├── sounds/             # Sound playback with pooling
│   ├── timers/             # setTimeout/setInterval implementation
│   └── ui/                 # OOP UI wrappers
├── example spacials/       # User-created spatial JSON examples
│   ├── construct.json      # Elevated testing platform reference
│   └── battleman.json      # Bomberman-style arena with walls
├── spatial-generator/      # AI-assisted spatial JSON generation (Implementation Ready)
│   ├── CLAUDE.md           # Project context and status
│   ├── RESEARCH.md         # Spatial JSON format documentation
│   └── implementation-plan.md  # Detailed build plan with todos
├── experimental/           # Sandbox for features beyond documented SDK capabilities
│   ├── CLAUDE.md           # Session context
│   ├── METHODOLOGY.md      # 7-phase process for experimental features
│   ├── prototypes/         # Isolated prototype code
│   └── research/           # Per-feature research documents
├── agents/                 # Context-saving agent architecture (v0.1.0 Planning)
│   ├── CLAUDE.md           # Agent workflow context
│   └── RESEARCH.md         # Research on agent design
├── FbExportData/           # Asset catalogs, level data
└── GodotProject/           # Godot 4.4.1 editor for spatial editing
```

---

## Custom Skills Available

| Skill | Purpose |
|-------|---------|
| `/portal:validate` | Check code for invalid `mod.*` function calls |
| `/portal:build` | Guided workflow to build mods using only verified patterns |

---

## Workflow for Building Mods

### 1. Design Session
- User describes mod concept
- Identify which patterns apply from `patterns/_index.md`

### 2. Build Session (keep context < 40%)
- Read relevant pattern files
- Verify functions exist in SDK types (`bf6-portal-mod-types` or `code/mod/index.d.ts`) before using
- Assemble code incrementally
- Add source comments citing pattern files

### 3. Validate Session
- Run `/portal:validate` on generated code
- Fix any invalid functions

### 4. Deliver
- Provide complete `.ts` file
- Include required `.strings.json` entries
- Note any Godot setup requirements

---

## Pattern Library Status (v1.3 - Complete)

### Completed Patterns

**Core:**
- `patterns/core/event-hooks.md` - All 50+ event hooks including OnVehicleSpawned
- `patterns/core/game-lifecycle.md` - Initialization, vectors, teams
- `patterns/core/state-management.md` - GC/GD/GS architecture, PlayerProfile registry
- `patterns/core/object-equality.md` - **Critical**: Using GetObjId for comparisons
- `patterns/core/variable-chasing.md` - ChaseVariableAtRate, ChaseVariableOverTime, interpolation

**Player:**
- `patterns/player/input-control.md` - EnableInputRestriction, EnableAllInputRestrictions
- `patterns/player/equipment.md` - Weapons, gadgets, inventory slots
- `patterns/player/spawning.md` - Deploy, spawn points, teleporting
- `patterns/player/multi-team.md` - 4-team setup, team balancing
- `patterns/player/camera-control.md` - SetCameraTypeForPlayer, first/third-person, spectate
- `patterns/player/screen-effects.md` - EnableScreenEffect, Saturated, Stealth visual modes
- `patterns/player/soldier-effects.md` - SetSoldierEffect, FreezeStatusEffect, HeatStatusEffect

**UI:**
- `patterns/ui/widgets.md` - Full UI system
- `patterns/ui/custom-notifications.md` - DisplayCustomNotificationMessage, 5 persistent HUD slots

**Gameplay:**
- `patterns/gameplay/economy.md` - Cash/reward systems
- `patterns/gameplay/vehicles.md` - Vehicle spawners, ForcePlayerToSeat, OnVehicleSpawned
- `patterns/gameplay/checkpoints.md` - Distance-based detection, lap tracking, race ordering
- `patterns/gameplay/boundaries.md` - Kill zones, Y-coordinate checks, SkipManDown
- `patterns/gameplay/capture-points.md` - Conquest objectives, capture/neutralization, progress
- `patterns/gameplay/scoring.md` - Game mode score, custom scoreboard, ticket bleed
- `patterns/gameplay/sectors.md` - Sector progression, HQ spawners, Rush/Breakthrough zones
- `patterns/gameplay/mcoms.md` - Rush objectives, armed/defused/destroyed events
- `patterns/gameplay/breakthrough.md` - Breakthrough mode, capture-based sectors, vehicle cleanup
- `patterns/gameplay/rounds.md` - Round phases, timers, team switching
- `patterns/gameplay/loot-system.md` - LootSpawner, weapon tiers, rarity pools
- `patterns/gameplay/ring-of-fire.md` - BR shrinking zone mechanics
- `patterns/gameplay/strike-packages.md` - CallIn gadgets (airstrikes, artillery, supply drops)
- `patterns/gameplay/emplacements.md` - EmplacementSpawner, turrets, anti-air, TOW launchers

**Audio:**
- `patterns/audio/audio.md` - Music packages (Core, BR, Gauntlet), SFX, voice-over

**Spatial:**
- `patterns/spatial/math.md` - Circle distribution, direction→euler, spawn lines
- `patterns/spatial/area-triggers.md` - Event-driven boundaries, OoB detection, PolygonVolume linking
- `patterns/spatial/world-icons.md` - WorldIcon spawning, positioning, visibility
- `patterns/spatial/objects.md` - SpawnObject, RuntimeSpawn enums, object lifecycle
- `patterns/spatial/vfx.md` - VFX lifecycle, fire/smoke/explosions, EnableVFX

**AI:**
- `patterns/ai/behavior-system.md` - 18 AI functions (spawning, behaviors, combat, movement)

### SDK Coverage Status

**All major SDK feature categories are now documented.** The pattern library covers:
- 50+ event hooks
- 18 AI functions
- All camera, effect, and notification systems
- All spawner types (vehicle, emplacement, loot, AI)
- Complete UI widget system
- All gameplay modes (Conquest, Rush, Breakthrough, BR)

---

## Utility Library (bf6-portal-utils-master)

Community-built utility modules for common patterns. **Not SDK-official** but useful abstractions.

### Module Reference

| Module | Purpose | Key Features |
|--------|---------|--------------|
| **Events** | Centralized event subscription | Multiple handlers per event, type-safe |
| **FFA Spawning** | Free-For-All spawn system | Smart spawn point selection, spawn queue, AI handling |
| **Interact Multi-Click** | Detect multi-clicks on interact key | Custom UI triggers without interact points |
| **Logger** | On-screen debug logging | Works on console builds (unlike console.log) |
| **Map Detector** | Detect current map | Workaround for broken `mod.IsCurrentMap` API |
| **Performance Stats** | Monitor server tick rate | Identify performance issues |
| **Raycast** | Abstracted raycasting | Hit/miss attribution, callbacks, TTL system |
| **SolidUI** | Reactive UI framework | SolidJS-inspired signals, effects, memos |
| **Sounds** | Sound playback abstraction | Pooling, 2D/3D audio, duration management |
| **Timers** | setTimeout/setInterval | Cancellable timers, concurrent execution |
| **UI** | OOP UI wrappers | Containers, Text, Buttons, auto input mode |

### Usage Notes

- Import modules individually: `import { Events } from '../bf6-portal-utils-master/events'`
- Each module has its own README with detailed API documentation
- These are **helper patterns**, not raw SDK calls - verify compatibility with your mod

---

## Spatial JSON Generator (Implementation Ready)

Located in `spatial-generator/`, this is a programmatic API to generate `.spatial.json` files for level modifications.

### Status
**Research complete. Ready for implementation.** See `spatial-generator/implementation-plan.md` for build steps.

### Purpose
- Generate elevated testing platforms above existing levels
- Create simple arenas, mazes, or custom play spaces
- Bridge the gap between AI capabilities and Godot GUI-based editing

### Key Files
- `spatial-generator/CLAUDE.md` - Project context and status
- `spatial-generator/RESEARCH.md` - Comprehensive spatial JSON format documentation
- `spatial-generator/implementation-plan.md` - Detailed build plan with todos

### Design Decisions
- **Programmatic API** (not CLI) - More flexible for integration
- **New files only** - No merge/edit of existing spatials
- **Builder pattern** - Fluent API for composable generation

### Key Findings
- `FiringRange_Floor_A` tiles: X spacing = 3.537, Z spacing = 5.0101
- Standard elevation: Y = 90 (above typical ground ~64)
- Required objects: Sector, CombatArea, PolygonVolume, HQ_PlayerSpawner, SpawnPoint, DeployCam

### Reference Examples
- `example spacials/construct.json` - Elevated testing platform
- `example spacials/battleman.json` - Bomberman-style arena with walls

---

## Experimental Features

Located in `experimental/`, this is a sandbox for exploring mechanics beyond documented SDK capabilities (e.g., double jump, wall running, custom movement).

### When to Use
- User wants a feature not covered by existing patterns
- Need to explore if something is even possible
- Want to prototype without risking working mod code

### Key Principle
**Never contaminate working code.** All experimental work stays isolated in `experimental/`.

### Process
See `experimental/METHODOLOGY.md` for the full 7-phase process:
1. Question Framing → Define intent and success criteria
2. SDK Capability Audit → Search for primitives, document gaps
3. Approach Brainstorming → Generate and evaluate options
4. Isolated Prototyping → Build in `experimental/prototypes/` only
5. Empirical Testing → Test with actual gameplay
6. Validation → Confirm with user
7. Promotion/Archive → Extract pattern or document learning

### Current Research
| Feature | Status | Document |
|---------|--------|----------|
| Double Jump | Research Complete | `experimental/research/double-jump.md` |

---

## Context-Saving Agents (v0.1.0 Planning)

Located in `agents/`, this is an architecture for minimizing context window usage when building mods.

### The Problem
Claude's capability degrades past 40% context window. This project has ~125K lines of reference material that cannot all fit in one session.

### The Solution
Specialized agents that:
1. Hold domain knowledge in their prompts
2. Execute tasks independently (validate, research, build)
3. Return only results to main context (not full reference data)

### Planned Agents
| Agent | Purpose | Returns |
|-------|---------|---------|
| Portal Validator | Check `mod.*` calls against SDK | Error list only |
| Portal Researcher | Find relevant patterns for concept | Summary + snippets |
| Portal Builder | Assemble code from patterns | Complete `.ts` file |

### Status
See `agents/CLAUDE.md` for current progress and `agents/RESEARCH.md` for background research.

---

## Quick Reference: Most Used Functions

```typescript
// Events (export these - game calls them)
export async function OnGameModeStarted() { }
export function OnPlayerJoinGame(eventPlayer: mod.Player): void { }
export function OnPlayerDeployed(eventPlayer: mod.Player): void { }
export function OnPlayerDied(eventPlayer, eventOtherPlayer, eventDeathType, eventWeaponUnlock): void { }
export function OnVehicleSpawned(eventVehicle: mod.Vehicle): void { }

// Vectors
mod.CreateVector(x: number, y: number, z: number): mod.Vector
mod.XComponentOf(vector): number
mod.DistanceBetween(a: mod.Vector, b: mod.Vector): number

// Players & Teams
mod.GetTeam(playerOrIndex: mod.Player | number): mod.Team
mod.GetObjId(object: any): number  // Use for equality checks - see object-equality.md
mod.Teleport(player: mod.Player, position: mod.Vector, facingAngle: number): void
mod.IsPlayerValid(player: mod.Player): boolean  // Check before operations

// Object Equality (CRITICAL - === does not work for SDK objects)
// WRONG: if (team1 === team2)
// RIGHT: if (mod.GetObjId(team1) === mod.GetObjId(team2))

// Timing
await mod.Wait(seconds: number): Promise<void>  // Only in async functions

// Vehicles
mod.SpawnObject(mod.RuntimeSpawn_Common.VehicleSpawner, position, rotation): mod.Object
mod.SetVehicleSpawnerVehicleType(spawner, mod.VehicleList.Vector): void
mod.ForceVehicleSpawnerSpawn(spawner): void
mod.ForcePlayerToSeat(player, vehicle, seatIndex): void

// Input Control
mod.EnableAllInputRestrictions(player, true/false): void  // Lock/unlock all inputs
mod.EnableInputRestriction(player, mod.RestrictedInputs.Sprint, true/false): void

// Messages
mod.Message(key: string, ...args: any[]): mod.Message
mod.DisplayNotificationMessage(message: mod.Message, target?: mod.Player | mod.Team): void

// UI
mod.AddUIText(name, position, size, anchor, message): void
mod.AddUIContainer(name, position, size, anchor): void
mod.FindUIWidgetWithName(name: string): mod.UIWidget
```

---

## Validation Checklist

Before delivering mod code:

- [ ] Every `mod.*` call exists in SDK types (search `bf6-portal-mod-types` or `code/mod/index.d.ts`)
- [ ] Event hook signatures match exactly (parameter names and types)
- [ ] `mod.Message('key')` keys are documented for `.strings.json`
- [ ] Spatial objects (HQ, CapturePoint, AreaTrigger) note Godot requirements
- [ ] No functions invented from general TypeScript knowledge
- [ ] No code sourced from BF2042 web documentation
- [ ] **Object equality uses `mod.GetObjId()`** - never `===` for teams/players/objects
- [ ] Player arrays use try-catch or validity checks (players can become invalid)

---

## Debugging

Portal logs output to:
```
C:\Users\{username}\AppData\Local\Temp\Battlefield™ 6\PortalLog.txt
```

Use `console.log()` in mod code to write here.

---

## Adding New Patterns

When extracting new patterns from example mods:

1. Read the source mod file
2. Extract working code
3. Verify every `mod.*` call exists in SDK types
4. Create pattern document with header:
```markdown
# Pattern: [Name]
> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/[ModName]/[File].ts:[LineNumbers]
```
5. Include: What it does, working code, function table, constraints
6. Update `patterns/_index.md`

---

## Key Files to Read

When starting a new session:
1. This file (`CLAUDE.md`)
2. `patterns/_index.md` - What patterns exist
3. Specific pattern files for the mod type being built
4. SDK types - To verify functions (search `bf6-portal-mod-types` in node_modules, or `code/mod/index.d.ts`)

---

## Skirmish Mod Deep Dive (Source: `mods/Skirmish/Skirmish.ts`)

The Skirmish mod is the most comprehensive example (~81,000 lines), implementing a 4-team Battle Royale with loot, economy, and Ring of Fire.

### Strike Packages / Call-In Gadgets

The SDK provides call-in gadgets that players can equip and use:

```typescript
// Available CallIn Gadgets (mod.Gadgets enum)
mod.Gadgets.CallIn_Air_Strike       // Air strike
mod.Gadgets.CallIn_Ammo_Drop        // Ammo resupply drop
mod.Gadgets.CallIn_Anti_Vehicle_Drop // Anti-vehicle weapon drop
mod.Gadgets.CallIn_Artillery_Strike  // Artillery bombardment
mod.Gadgets.CallIn_Mobile_Redeploy   // Mobile spawn point
mod.Gadgets.CallIn_Smoke_Screen      // Smoke cover
mod.Gadgets.CallIn_UAV_Overwatch     // Reconnaissance UAV
mod.Gadgets.CallIn_Weapon_Drop       // Weapon supply drop

// Equipping a call-in gadget to a player
mod.AddEquipment(player, mod.Gadgets.CallIn_Air_Strike);
mod.AddEquipment(player, mod.Gadgets.CallIn_Artillery_Strike, mod.InventorySlots.Callins);

// Inventory slot specifically for call-ins
mod.InventorySlots.Callins
```

**Note**: The Skirmish mod had call-ins commented out using `mod.MiscGadgets.*` (which is empty). The correct enum is `mod.Gadgets.CallIn_*`.

### Equipment System

```typescript
// Adding weapons and gadgets
mod.AddEquipment(player, weapon: mod.Weapons): void
mod.AddEquipment(player, gadget: mod.Gadgets): void
mod.AddEquipment(player, gadget: mod.Gadgets, slot: mod.InventorySlots): void
mod.AddEquipment(player, armor: mod.ArmorTypes): void

// Removing equipment
mod.RemoveEquipment(player, slot: mod.InventorySlots): void
mod.RemoveEquipment(player, weapon: mod.Weapons): void
mod.RemoveEquipment(player, gadget: mod.Gadgets): void

// Checking equipment
mod.HasEquipment(player, weapon: mod.Weapons): boolean
mod.HasEquipment(player, gadget: mod.Gadgets): boolean
mod.IsInventorySlotActive(player, slot: mod.InventorySlots): boolean

// Inventory Slots
mod.InventorySlots.Callins       // Call-in gadgets
mod.InventorySlots.ClassGadget   // Class-specific gadget
mod.InventorySlots.GadgetOne     // First gadget slot
mod.InventorySlots.GadgetTwo     // Second gadget slot
mod.InventorySlots.MeleeWeapon   // Melee weapon
mod.InventorySlots.MiscGadget    // Misc gadget slot
mod.InventorySlots.PrimaryWeapon // Primary weapon
mod.InventorySlots.SecondaryWeapon // Secondary weapon
mod.InventorySlots.Throwable     // Throwable gadgets

// Ammo management
mod.SetInventoryAmmo(player, slot: mod.InventorySlots, ammo: number): void
mod.SetInventoryMagazineAmmo(player, slot: mod.InventorySlots, magAmmo: number): void
mod.GetInventoryAmmo(player, slot: mod.InventorySlots): number
mod.GetInventoryMagazineAmmo(player, slot: mod.InventorySlots): number
```

### Ring of Fire (BR Shrinking Zone)

The Ring of Fire is a built-in Portal object for Battle Royale shrinking zones:

```typescript
// Get the Ring of Fire object (placed in Godot editor)
const ringOfFire = mod.GetRingOfFire(objectId: number): mod.RingOfFire

// Start the ring shrinking sequence
mod.RingOfFireStart(ringOfFire): void

// Configure the ring
mod.SetRingOfFireDamageAmount(ringOfFire, damageAmount: number): void  // Damage to players outside
mod.SetRingOfFireStableTime(ringOfFire, stableTime: number): void      // Time between shrinks

// Remove the ring
mod.UnspawnObject(ringOfFire): void

// Event hook - fires when ring size changes
export function OnRingOfFireZoneSizeChange(eventRingOfFire: mod.RingOfFire, eventNumber: number): void {
    // eventNumber indicates the current ring stage
}
```

**Custom Ring Implementation** (from Skirmish's `RingOfFireAnalogue`):
```typescript
// Custom damage checking for players outside ring
const playerPosition = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
const distanceFromRing = mod.DistanceBetween(playerPosition, ringCenterPosition);
if (distanceFromRing > currentRingRadius) {
    mod.DealDamage(player, damageAmount);
}
```

### Loot System

The loot system uses `LootSpawner` objects and rarity pools:

```typescript
// Get a loot spawner (placed in Godot editor)
const spawner = mod.GetLootSpawner(spawnerIndex: number): mod.LootSpawner

// Spawn loot at a spawner
mod.SpawnLoot(spawner, weapon: mod.Weapons): void
mod.SpawnLoot(spawner, gadget: mod.Gadgets): void
mod.SpawnLoot(spawner, ammo: mod.AmmoTypes): void
mod.SpawnLoot(spawner, armor: mod.ArmorTypes): void

// Ammo types for loot
mod.AmmoTypes.AR_Carbine_Ammo
mod.AmmoTypes.Pistol_SMG_Ammo
mod.AmmoTypes.Sniper_DMR_Ammo
mod.AmmoTypes.LMG_Ammo
mod.AmmoTypes.Armor_Plate

// Armor types
mod.ArmorTypes.SoftArmor
mod.ArmorTypes.CeramicArmor
```

**Loot Pool Configuration Pattern** (from Skirmish):
```typescript
const LOOT_POOLS = {
    weapons: {
        primary: [
            // Common tier
            [mod.Weapons.Carbine_M4A1, mod.Weapons.AssaultRifle_L85A3, ...],
            // Uncommon tier
            [mod.Weapons.AssaultRifle_AK4D, mod.Weapons.AssaultRifle_NVO_228E, ...],
            // Rare tier
            [mod.Weapons.DMR_M39_EMR, mod.Weapons.LMG_DRS_IAR, ...],
            // Epic tier
            [mod.Weapons.LMG_M250, mod.Weapons.Sniper_PSR, ...],
            // Legendary tier
            [mod.Weapons.Sniper_SV_98, mod.Weapons.Shotgun_M87A1, ...]
        ]
    }
};
// Roll rarity, then pick random item from that tier
```

### Multi-Team Management (4 Teams)

```typescript
// Initialize 4 teams
TeamData.Initialize([mod.GetTeam(1), mod.GetTeam(2), mod.GetTeam(3), mod.GetTeam(4)]);

// Assign player to team with lowest member count (auto-balancing)
const teamMemberCount = [0, 0, 0, 0];  // Track counts for teams 1-4
const lowestCount = Math.min(...teamMemberCount);
const teamsWithLowestCount = [0,1,2,3].filter(i => teamMemberCount[i] === lowestCount);
const selectedTeam = teamsWithLowestCount[Math.floor(Math.random() * teamsWithLowestCount.length)] + 1;
mod.SetTeam(player, mod.GetTeam(selectedTeam));

// Get team number from player (using GetObjId for comparison)
function GetTeamNumber(player: mod.Player): number {
    const teamId = mod.GetTeam(player);
    for (let i = 1; i <= 4; i++) {
        if (mod.GetObjId(teamId) === mod.GetObjId(mod.GetTeam(i))) {
            return i;
        }
    }
    return -1;
}
```

### Player Spawning System

```typescript
// Enable/disable player deployment
mod.EnableAllPlayerDeploy(enable: boolean): void
mod.EnablePlayerDeploy(player, enable: boolean): void

// Spawn player from a numbered spawn point (placed in Godot)
mod.SpawnPlayerFromSpawnPoint(player, spawnPointId: number): void
mod.SpawnPlayerFromSpawnPoint(player, spawnPoint: mod.SpawnPoint): void

// Check if player is alive
mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive): boolean
mod.GetSoldierState(player, mod.SoldierStateBool.IsManDown): boolean
mod.GetSoldierState(player, mod.SoldierStateBool.IsDead): boolean

// Get player position
mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition): mod.Vector
```

### World Icons

```typescript
// Get a world icon (placed in Godot editor)
const icon = mod.GetWorldIcon(iconNumber: number): mod.WorldIcon

// Configure world icon
mod.SetWorldIconImage(icon, mod.WorldIconImages.Hazard): void
mod.SetWorldIconColor(icon, mod.CreateVector(r, g, b)): void
mod.SetWorldIconPosition(icon, position: mod.Vector): void
mod.SetWorldIconText(icon, message: mod.Message): void
mod.SetWorldIconOwner(icon, team: mod.Team): void  // Only visible to team
mod.SetWorldIconOwner(icon, player: mod.Player): void  // Only visible to player

// Enable/disable icon elements
mod.EnableWorldIconImage(icon, enable: boolean): void
mod.EnableWorldIconText(icon, enable: boolean): void

// Available icon images
mod.WorldIconImages.Alert
mod.WorldIconImages.Bomb
mod.WorldIconImages.BombArmed
mod.WorldIconImages.Cross
mod.WorldIconImages.DangerPing
mod.WorldIconImages.Eye
mod.WorldIconImages.Flag
mod.WorldIconImages.Hazard
mod.WorldIconImages.Skull
mod.WorldIconImages.Triangle
```

### InteractPoints (Buy Stations)

```typescript
// Get and enable interact points (placed in Godot editor)
mod.GetInteractPoint(index: number): mod.InteractPoint
mod.EnableInteractPoint(interactPoint, enable: boolean): void

// Event hook when player interacts
export function OnPlayerInteract(eventPlayer: mod.Player): void {
    // Triggered when player uses interact point
}
```

### Helper Utilities (from Skirmish's H class)

```typescript
// Safe array conversion
function toArray<T>(value: T | T[] | undefined): T[] {
    if (value === undefined) return [];
    return Array.isArray(value) ? value : [value];
}

// Format seconds to [minutes, secondsTens, secondsOnes]
function FormatTime(sec: number): [number, number, number] {
    if (sec < 0) sec = 0;
    const minutes = Math.floor(sec / 60);
    const remainingSeconds = Math.floor(sec % 60);
    return [minutes, Math.floor(remainingSeconds / 10), remainingSeconds % 10];
}

// Vector lerp
function LerpVector(a: mod.Vector, b: mod.Vector, t: number): mod.Vector {
    return mod.CreateVector(
        Lerp(mod.XComponentOf(a), mod.XComponentOf(b), t),
        Lerp(mod.YComponentOf(a), mod.YComponentOf(b), t),
        Lerp(mod.ZComponentOf(a), mod.ZComponentOf(b), t)
    );
}

// Get all players grouped by team
function GetPlayersOnTeam(): Record<string, mod.Player[]> {
    const players = mod.AllPlayers();
    const teams: Record<string, mod.Player[]> = {};
    const n = mod.CountOf(players);
    for (let i = 0; i < n; i++) {
        const player = mod.ValueInArray(players, i);
        const teamId = mod.GetObjId(mod.GetTeam(player));
        if (!teams[teamId]) teams[teamId] = [];
        teams[teamId].push(player);
    }
    return teams;
}
```

### GC/GD/GS Architecture (Game Config/Data/State)

Skirmish uses a clean separation pattern:

```typescript
// GC - Game Configuration (static settings)
class GC {
    static maxPlayers = 16;
    static maxRounds = 1;
    static teamAmount = 4;
    static startingCurrency = 500;
    static currencyGainOnKill = 100;
    static teamColors: mod.Vector[] = [...];
    static availableSpawnPoints: mod.Vector[] = [...];
}

// GD - Game Data (runtime state)
class GD {
    static currentRound = 0;
    static roundActive = false;
    static teamDataArray: TeamData[] = [];
}

// GS - Game State (state machine methods)
class GS {
    static StartPreRound() { ... }
    static StartRound() { ... }
    static EndRound() { ... }
}
```

---

> **Note**: This is the preserved original CLAUDE.md from before the process restructure (2026-01-18).
> For the current lean orchestrator, see the parent folder's `CLAUDE.md`.
