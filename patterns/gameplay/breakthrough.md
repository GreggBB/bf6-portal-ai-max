# Pattern: Breakthrough Mode

> **SDK Version**: 1.1.3.0 (Battlefield 6)
> **Source**: mods/Custom Breakthrough V1.1 (Portal Blocks), spatial analysis

---

## Overview

Breakthrough is an asymmetric attacking/defending mode where:
- **Attackers (Team 1)** push through sequential sectors capturing objectives
- **Defenders (Team 2)** hold each sector until attackers run out of tickets
- Sectors unlock progressively - capturing all objectives in a sector opens the next

Unlike Rush (which uses MCOMs that are armed/defused), Breakthrough uses **CapturePoints** with percentage-based progress.

---

## Breakthrough vs Rush

| Aspect | Rush | Breakthrough |
|--------|------|--------------|
| Objectives | MCOMs (arm/defuse) | CapturePoints (hold territory) |
| Win Condition | Destroy all MCOMs | Capture all points in sector |
| Progress | Binary (armed/not) | Percentage-based capture |
| Timer | MCOM arm countdown | Sector time limit |
| Events | OnMCOMArmed/Defused/Destroyed | OnCapturePointCaptured |

---

## ObjId Convention

```
Sectors:       ObjId 100-105 (100 = Sector 0/staging, 101+ = playable)
CapturePoints: ObjId 1100-1199 for Sector 1, 1200-1299 for Sector 2, etc.
HQ Spawners:   ObjId 301+ (Team 1/Attackers), 401+ (Team 2/Defenders)
AreaTriggers:  ObjId 600-605 (one per sector)
AI_Spawners:   ObjId 901+ (for custom bot support)
```

---

## Spatial Layout

Each sector contains:

```
Sector1 (ObjId: 101)
├── SectorArea (PolygonVolume defining boundaries)
├── AreaTrigger1 (ObjId: 601, links to SectorArea)
├── CapturePointA (ObjId: 1100)
│   ├── CaptureArea (PolygonVolume)
│   ├── InfantrySpawnPoints_Team1 (3-4 spawns)
│   └── InfantrySpawnPoints_Team2 (3-4 spawns)
├── CapturePointB (ObjId: 1101)
│   ├── CaptureArea (PolygonVolume)
│   ├── InfantrySpawnPoints_Team1 (3-4 spawns)
│   └── InfantrySpawnPoints_Team2 (3-4 spawns)
├── TEAM_1_HQ (ObjId: 301, Attackers)
│   ├── HQArea (PolygonVolume)
│   └── SpawnPoints (4x)
└── TEAM_2_HQ (ObjId: 401, Defenders)
    ├── HQArea (PolygonVolume)
    └── SpawnPoints (4x)
```

---

## State Management

```typescript
// Global state
class BreakthroughState {
    static initialized: boolean = false;
    static gameEnded: boolean = false;
    static currentSector: number = 1;
    static totalSectors: number = 4;
    static sectorTimeLimit: number = 1200;  // 20 minutes per sector
    static sectorTimeRemaining: number = 1200;

    // Cached objects
    static sectors: mod.Sector[] = [];
    static sectorCapturePoints: mod.CapturePoint[] = [];  // Current sector's points
    static allCapturePoints: mod.CapturePoint[] = [];
}

// Team state
class TeamState {
    static attackerTickets: number = 600;
    static defenderTickets: number = 600;
    static attackerTeam: mod.Team;
    static defenderTeam: mod.Team;
}
```

---

## Filtering Capture Points by Sector

Use ObjId ranges to get objectives for the current sector:

```typescript
function GetCapturePointsForSector(sectorNum: number): mod.CapturePoint[] {
    const allPoints = mod.AllCapturePoints();
    const baseId = 1000 + (sectorNum * 100);  // Sector 1 = 1100-1199
    const maxId = baseId + 100;

    return mod.FilteredArray(
        allPoints,
        mod.And(
            mod.GreaterThanEqualTo(mod.GetObjId(mod.CurrentArrayElement()), baseId),
            mod.LessThan(mod.GetObjId(mod.CurrentArrayElement()), maxId)
        )
    );
}

// Sort by ObjId for consistent ordering (A, B, C...)
function GetSortedCapturePoints(sectorNum: number): mod.CapturePoint[] {
    const points = GetCapturePointsForSector(sectorNum);
    return mod.SortedArray(points, mod.GetObjId(mod.CurrentArrayElement()));
}
```

---

## Sector Win Condition

Check if all objectives in current sector are captured by attackers:

```typescript
function CheckSectorCaptured(): boolean {
    const points = BreakthroughState.sectorCapturePoints;

    return mod.IsTrueForAll(
        points,
        mod.And(
            mod.Equals(mod.GetCaptureProgress(mod.CurrentArrayElement()), 1),
            mod.Equals(
                mod.GetCurrentOwnerTeam(mod.CurrentArrayElement()),
                TeamState.attackerTeam
            )
        )
    );
}
```

---

## Sector Transition

```typescript
async function AdvanceToNextSector() {
    const nextSector = BreakthroughState.currentSector + 1;

    if (nextSector > BreakthroughState.totalSectors) {
        // Attackers have won - captured all sectors
        EndGame(TeamState.attackerTeam);
        return;
    }

    // Play sector unlock sound
    mod.PlaySound(sfxAreaUnlock, 2);

    // Disable current sector objectives
    DisableSectorObjectives(BreakthroughState.currentSector);

    // Optional: Clean up unoccupied vehicles
    if (vehicleCleanupEnabled) {
        CleanupSectorVehicles();
    }

    // Enable next sector
    EnableSector(nextSector);

    // Reset sector timer
    BreakthroughState.sectorTimeRemaining = BreakthroughState.sectorTimeLimit;

    // Update HQ spawners
    UpdateHQSpawners(nextSector);

    // Play VO announcement
    mod.PlayVO(
        mod.RuntimeSpawn_Common.VO,
        mod.VoiceOverEvents2D.ObjectiveTerritoryTaken,
        mod.VoiceOverFlags.Alpha,
        TeamState.attackerTeam
    );

    mod.PlayVO(
        mod.RuntimeSpawn_Common.VO,
        mod.VoiceOverEvents2D.ObjectiveTerritoryLost,
        mod.VoiceOverFlags.Alpha,
        TeamState.defenderTeam
    );

    BreakthroughState.currentSector = nextSector;
}
```

---

## Ticket System

Attackers lose tickets on death; defenders typically have unlimited respawns:

```typescript
export function OnPlayerDied(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    const playerTeam = mod.GetTeam(eventPlayer);

    // Only attackers lose tickets
    if (mod.GetObjId(playerTeam) === mod.GetObjId(TeamState.attackerTeam)) {
        TeamState.attackerTickets -= 1;

        // Check for attacker defeat
        if (TeamState.attackerTickets <= 0) {
            EndGame(TeamState.defenderTeam);
        }
    }
}
```

---

## Audio Integration

Breakthrough uses extensive audio feedback:

### SFX Objects (spawned at game start)

```typescript
// Spawn SFX objects for later playback
const sfxVO = mod.SpawnObject(
    mod.RuntimeSpawn_Common.SFX_VOModule_OneShot2D,
    mod.CreateVector(0, 0, 0),
    mod.CreateVector(0, 0, 0)
);

const sfxCaptureFriendly = mod.SpawnObject(
    mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_CapturingTickFriendly_OneShot2D,
    mod.CreateVector(0, 0, 0),
    mod.CreateVector(0, 0, 0)
);

const sfxCaptureEnemy = mod.SpawnObject(
    mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_CapturingTickEnemy_OneShot2D,
    mod.CreateVector(0, 0, 0),
    mod.CreateVector(0, 0, 0)
);

const sfxCaptured = mod.SpawnObject(
    mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_OnCapturedByFriendly_OneShot2D,
    mod.CreateVector(0, 0, 0),
    mod.CreateVector(0, 0, 0)
);

const sfxOoBCountdown = mod.SpawnObject(
    mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_OutOfBounds_Countdown_OneShot2D,
    mod.CreateVector(0, 0, 0),
    mod.CreateVector(0, 0, 0)
);

const sfxAreaUnlock = mod.SpawnObject(
    mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_CaptureObjectives_AreaUnlock_OneShot2D,
    mod.CreateVector(0, 0, 0),
    mod.CreateVector(0, 0, 0)
);

const sfxCountdownFinal = mod.SpawnObject(
    mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_Intro_Countdown_Final_OneShot2D,
    mod.CreateVector(0, 0, 0),
    mod.CreateVector(0, 0, 0)
);

const sfxFinalImpact = mod.SpawnObject(
    mod.RuntimeSpawn_Common.SFX_UI_Gamemode_Shared_Intro_FinalImpact_OneShot2D,
    mod.CreateVector(0, 0, 0),
    mod.CreateVector(0, 0, 0)
);
```

### Music Packages

```typescript
mod.LoadMusic(mod.MusicPackages.Core);
mod.LoadMusic(mod.MusicPackages.Gauntlet);
mod.SetMusicParam(mod.MusicParams.Core_Amplitude, 1);
mod.SetMusicParam(mod.MusicParams.Gauntlet_Amplitude, 1);

// Play overtime music when tickets < 50
if (TeamState.attackerTickets < 50) {
    mod.PlayMusic(mod.MusicEvents.Core_Overtime_Loop);
}
```

---

## Vehicle Cleanup on Sector Change

Optional feature to destroy unoccupied vehicles when sectors change:

```typescript
function CleanupSectorVehicles() {
    const allVehicles = mod.AllVehicles();

    mod.ForEach(allVehicles, (vehicle) => {
        // Only destroy if no players inside
        if (mod.CountOf(mod.AllPlayersInVehicle(vehicle)) === 0) {
            mod.DestroyObject(vehicle);
        }
    });
}
```

---

## AI Support

Custom Breakthrough includes custom AI since default bots don't work well:

```typescript
// AI subroutines
// - AI_ObjectiveSpawn: Spawn AI at objective positions
// - AI_Scouting: AI movement and patrol behavior
// - AI_VehicleDeploy: AI vehicle usage
// - AI_VehicleReset: Reset AI vehicle state

// AI reacts to captures - sprint when close to enemy
function UpdateAIMoveSpeed(aiPlayer: mod.Player) {
    const enemyDistance = mod.DistanceBetween(
        mod.GetObjectPosition(
            mod.ClosestPlayerTo(
                mod.GetObjectPosition(aiPlayer),
                enemyTeam
            )
        ),
        mod.GetObjectPosition(aiPlayer)
    );

    if (enemyDistance < 30) {
        mod.AISetMoveSpeed(aiPlayer, mod.MoveSpeed.Sprint);
    } else {
        mod.AISetMoveSpeed(aiPlayer, mod.MoveSpeed.InvestigateRun);
    }
}
```

---

## UI Colors

Custom Breakthrough uses RGB vectors for UI text colors:

```typescript
const friendlyTextColor = mod.CreateVector(0, 0.8, 1);      // Cyan
const enemyTextColor = mod.CreateVector(1, 0.2, 0.2);       // Red
const neutralTextColor = mod.CreateVector(0, 0.2, 0.5);     // Dark blue
const deadTextColor = mod.CreateVector(0.6, 0.1, 0.1);      // Dark red
```

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `AllCapturePoints` | `(): CapturePoint[]` | Get all capture points |
| `GetCaptureProgress` | `(cp: CapturePoint): number` | Get capture % (0-1) |
| `GetCurrentOwnerTeam` | `(cp: CapturePoint): Team` | Get owning team |
| `EnableGameModeObjective` | `(obj, enable): void` | Enable/disable objective |
| `SetCapturePointNeutralizationTime` | `(cp, seconds): void` | Set neutralize time |
| `IsTrueForAll` | `(array, condition): boolean` | Check condition on all elements |
| `FilteredArray` | `(array, condition): array` | Filter array by condition |
| `SortedArray` | `(array, sortValue): array` | Sort array by value |

---

## Constraints & Gotchas

1. **CapturePoint ObjId ranges**: Must follow convention (1100-1199 for Sector 1) for filtering to work.

2. **Sector0 is staging**: Typically attacker spawn area with no objectives.

3. **InitialOwner**: CapturePoints should have `InitialOwner: Team2` (defenders) in spatial data.

4. **UI in redeploy screen**: Sector change UI displays even when players are in deploy screen.

5. **AI limitations**: Default AI bots don't work - requires custom AI implementation.

6. **Vehicle spawners**: Vehicles spawn on map, not selectable from spawn menu.

7. **Capture point UI bug**: UI triggers when above/below capture area (game bug).

---

## Related Patterns

- [Sectors](sectors.md) - Sector progression fundamentals
- [Capture Points](capture-points.md) - Capture mechanics
- [Scoring](scoring.md) - Ticket systems
- [Area Triggers](../spatial/area-triggers.md) - OoB detection
- [Audio](../audio/audio.md) - Music and SFX integration
