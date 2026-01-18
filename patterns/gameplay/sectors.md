# Pattern: Sector Progression

> **SDK Version**: 1.1.3.0 (Battlefield 6)
> **Source**: mods/Custom Rush V2.0 (spatial analysis), code/mod/index.d.ts

---

## Overview

Sectors divide a map into sequential zones that activate/deactivate as gameplay progresses. Used in:
- **Rush**: Attackers advance through sectors by destroying MCOMs
- **Breakthrough**: Similar to Rush with capture-based progression
- **Custom modes**: Any linear progression through map areas

Each sector contains:
- A **SectorArea** (PolygonVolume defining boundaries)
- An **AreaTrigger** for detecting player presence
- **HQ spawners** for each team (shift with sector)
- **Objectives** (MCOMs, CapturePoints, etc.)

---

## Spatial Object Structure

Sectors are defined in Godot spatial files with linked objects:

```
Sector (ObjId: 101)
├── SectorArea (PolygonVolume defining play area)
├── AreaTrigger (ObjId: 601, links to SectorArea)
├── MCOM (ObjId: 201)
├── MCOM2 (ObjId: 202)
├── TEAM_1_HQ (ObjId: 301)
│   ├── HQArea (PolygonVolume)
│   └── SpawnPoints (4x)
└── TEAM_2_HQ (ObjId: 401)
    ├── HQArea (PolygonVolume)
    └── SpawnPoints (4x)
```

### ObjId Convention (Rush Example)

| Object Type | ObjId Range | Formula |
|-------------|-------------|---------|
| Sectors | 100-105 | `100 + sectorIndex` |
| AreaTriggers | 600-605 | `600 + sectorIndex` |
| MCOMs | 201-208 | `200 + (sector * 2) + mcomIndex` |
| Attacker HQs | 301-304 | `300 + sectorNum` |
| Defender HQs | 401-404 | `400 + sectorNum` |
| Sector Vehicles | 1100-1399 | `1000 + (sector * 100) + vehicleIndex` |

---

## SDK Types & Functions

### Types

```typescript
type Sector = { _opaque: typeof SectorSymbol };
type HQ = { _opaque: typeof HQSymbol };
```

### Retrieving Objects

```typescript
// Get sector by ObjId
mod.GetSector(number: number): Sector;

// Get HQ spawner by ObjId
mod.GetHQ(number: number): HQ;
```

### Enabling/Disabling

```typescript
// Enable or disable a sector (affects objectives within)
mod.EnableGameModeObjective(objective: Sector, enable: boolean): void;

// Enable or disable HQ spawner
mod.EnableHQ(hq: HQ, enable: boolean): void;

// Assign HQ to a team
mod.SetHQTeam(hq: HQ, teamID: Team): void;
```

### Events

```typescript
// Ongoing iterator for all sectors
export function OngoingSector(eventSector: mod.Sector): void;

// Ongoing iterator for all HQs
export function OngoingHQ(eventHQ: mod.HQ): void;
```

---

## Implementation Pattern

### State Management

```typescript
class SectorState {
    static currentSector: number = 1;
    static totalSectors: number = 4;

    // Cached spatial objects (loaded once at start)
    static sectors: mod.Sector[] = [];
    static areaTriggers: mod.AreaTrigger[] = [];
    static attackerHQs: mod.HQ[] = [];
    static defenderHQs: mod.HQ[] = [];
}
```

### Initialization

```typescript
export async function OnGameModeStarted() {
    // Load all sectors (Sector0 is staging, Sector1-4 are playable)
    for (let i = 0; i <= 5; i++) {
        SectorState.sectors.push(mod.GetSector(100 + i));
        SectorState.areaTriggers.push(mod.GetAreaTrigger(600 + i));
    }

    // Load HQ spawners for each playable sector
    for (let i = 1; i <= 4; i++) {
        SectorState.attackerHQs.push(mod.GetHQ(300 + i));
        SectorState.defenderHQs.push(mod.GetHQ(400 + i));
    }

    // Disable all HQs initially
    SectorState.attackerHQs.forEach(hq => mod.EnableHQ(hq, false));
    SectorState.defenderHQs.forEach(hq => mod.EnableHQ(hq, false));

    // Activate first sector
    ActivateSector(1);
}
```

### Sector Activation

```typescript
function ActivateSector(sectorNum: number) {
    const idx = sectorNum - 1;  // Array is 0-indexed

    // Disable previous sector's HQs
    if (sectorNum > 1) {
        mod.EnableHQ(SectorState.attackerHQs[idx - 1], false);
        mod.EnableHQ(SectorState.defenderHQs[idx - 1], false);
        mod.EnableAreaTrigger(SectorState.areaTriggers[sectorNum - 1], false);
    }

    // Enable current sector's HQs
    mod.EnableHQ(SectorState.attackerHQs[idx], true);
    mod.EnableHQ(SectorState.defenderHQs[idx], true);

    // Enable AreaTrigger for boundary detection
    mod.EnableAreaTrigger(SectorState.areaTriggers[sectorNum], true);

    SectorState.currentSector = sectorNum;

    // Announce sector change
    mod.PlayVOAnnouncement(mod.VOAnnouncement.SectorTakenAttacker, mod.GetTeam(1));

    console.log(`Sector ${sectorNum} activated`);
}
```

### Sector Advancement

```typescript
function AdvanceToNextSector() {
    const nextSector = SectorState.currentSector + 1;

    if (nextSector > SectorState.totalSectors) {
        // Attackers have won
        EndGame(mod.GetTeam(1));
        return;
    }

    // Optional: Cleanup vehicles from previous sector
    CleanupPreviousSectorVehicles();

    // Activate next sector
    ActivateSector(nextSector);

    // Reset attacker tickets (Rush-specific)
    ResetAttackerTickets();
}
```

---

## Vehicle Per-Sector Pattern

Assign vehicles to sectors using ObjId ranges:

```typescript
// Sector 1 vehicles: 1100-1199
// Sector 2 vehicles: 1200-1299
// etc.

function GetVehiclesForSector(sectorNum: number): mod.VehicleSpawner[] {
    const spawners: mod.VehicleSpawner[] = [];
    const baseId = 1000 + (sectorNum * 100);

    // Try to get up to 100 spawners for this sector
    for (let i = 0; i < 100; i++) {
        try {
            const spawner = mod.GetVehicleSpawner(baseId + i);
            if (spawner) spawners.push(spawner);
        } catch {
            break;  // No more spawners in this range
        }
    }

    return spawners;
}

function EnableSectorVehicles(sectorNum: number) {
    const spawners = GetVehiclesForSector(sectorNum);
    spawners.forEach(spawner => {
        mod.EnableVehicleSpawner(spawner, true);
    });
}

function CleanupPreviousSectorVehicles() {
    // Destroy unoccupied vehicles from previous sector
    // Implementation depends on vehicle tracking system
}
```

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `GetSector` | `(number): Sector` | Get sector by ObjId |
| `GetHQ` | `(number): HQ` | Get HQ spawner by ObjId |
| `EnableHQ` | `(hq, enable): void` | Enable/disable spawn point |
| `SetHQTeam` | `(hq, teamID): void` | Assign HQ to team |
| `EnableGameModeObjective` | `(Sector, enable): void` | Enable/disable sector |
| `EnableAreaTrigger` | `(areaTrigger, enable): void` | Enable/disable boundary trigger |
| `GetAreaTrigger` | `(number): AreaTrigger` | Get trigger by ObjId |
| `PlayVOAnnouncement` | `(announcement, team): void` | Play voice-over |

---

## VO Announcements

```typescript
mod.VOAnnouncement.SectorTakenAttacker    // Attackers captured sector
mod.VOAnnouncement.SectorTakenDefender    // Defenders held sector
```

---

## Constraints & Gotchas

1. **Sector0 is staging**: Often used as attacker starting area with no objectives, just an AreaTrigger.

2. **Final sector is empty**: The last sector (e.g., Sector5) typically has no MCOMs - it's the defender's final fallback.

3. **HQ indexing**: HQs are numbered per-sector (301 for Sector1's attacker HQ), not globally.

4. **AreaTrigger pairing**: Each sector needs an AreaTrigger linked to its PolygonVolume for OoB detection.

5. **Object caching**: Load all spatial objects once at game start. Don't call `GetSector()` repeatedly in loops.

6. **Team assignment**: HQs have a `Team` property in spatial data, but you can override with `SetHQTeam()` at runtime.

---

## Related Patterns

- [MCOMs](mcoms.md) - Rush objectives within sectors
- [Area Triggers](../spatial/area-triggers.md) - Boundary detection
- [Capture Points](capture-points.md) - Alternative sector objectives
- [Scoring](scoring.md) - Ticket systems for sector modes
