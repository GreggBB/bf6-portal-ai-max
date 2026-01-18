# Pattern: Emplacement Spawners

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: code/mod/index.d.ts:21537-21541, 22512-22554, 23790
> Working Example: mods/WarFactory/WarFactory.ts:727-740, 1634-1640

---

## Overview

Emplacement spawners create stationary weapons like turrets, anti-air guns, and TOW missile launchers. Players can man these emplacements for defensive/offensive capabilities. The spawner system handles respawning, abandonment, and type configuration.

---

## Available Emplacement Types

```typescript
// Source: code/mod/index.d.ts:21537-21541
export enum StationaryEmplacements {
    BGM71TOW,   // Anti-tank missile launcher
    GDF009,     // Anti-aircraft gun
    M2MG,       // Heavy machine gun
}
```

---

## Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `GetEmplacementSpawner` | `(number: number): EmplacementSpawner` | Get spawner by ObjId |
| `SetEmplacementSpawnerType` | `(spawner: EmplacementSpawner, type: StationaryEmplacements): void` | Set weapon type |
| `ForceEmplacementSpawnerSpawn` | `(spawner: EmplacementSpawner): void` | Force immediate spawn |
| `SetEmplacementSpawnerAutoSpawn` | `(spawner: EmplacementSpawner, enabled: boolean): void` | Enable/disable auto-respawn |
| `SetEmplacementSpawnerRespawnTime` | `(spawner: EmplacementSpawner, respawnTime: number): void` | Set respawn delay |
| `SetEmplacementSpawnerAbandonVehicleOutOfCombatArea` | `(spawner: EmplacementSpawner, enabled: boolean): void` | Destroy if outside combat area |
| `SetEmplacementSpawnerApplyDamageToAbandonVehicle` | `(spawner: EmplacementSpawner, enabled: boolean): void` | Destroy abandoned emplacements |
| `SetEmplacementSpawnerKeepAliveAbandonRadius` | `(spawner: EmplacementSpawner, radius: number): void` | Distance for abandonment check |
| `SetEmplacementSpawnerSpawnerRadius` | `(spawner: EmplacementSpawner, radius: number): void` | Distance from spawner for abandonment |
| `SetEmplacementSpawnerTimeUntilAbandon` | `(spawner: EmplacementSpawner, time: number): void` | Idle time before abandonment |

---

## Working Code

### Basic Emplacement Spawning (from WarFactory)

```typescript
// Source: mods/WarFactory/WarFactory.ts:727-740
interface StationaryData {
    stationarySpawnpointID: number,
    type?: mod.StationaryEmplacements,
}

async function SpawnEmplacement(data: StationaryData): Promise<void> {
    const spawner = mod.GetEmplacementSpawner(data.stationarySpawnpointID);

    // Set the emplacement type if specified
    if (data.type) {
        mod.SetEmplacementSpawnerType(spawner, data.type);
    }

    // Enable auto-respawning
    mod.SetEmplacementSpawnerAutoSpawn(spawner, true);

    // Force immediate spawn
    mod.ForceEmplacementSpawnerSpawn(spawner);
}
```

### Emplacement Configuration Presets (from WarFactory)

```typescript
// Source: mods/WarFactory/WarFactory.ts:1634-1640
enum StationaryPresetID {
    AirPortOne_AirGuns,
    AirPortTwo_AirGuns,
    TankBaseOne_AntiAir,
    TankBaseTwo_AntiAir,
    CenterBase_AntiTank,
}

const presetStationaryDataSource: Record<StationaryPresetID, StationaryData[]> = {
    [StationaryPresetID.AirPortOne_AirGuns]: [
        { stationarySpawnpointID: 5, type: mod.StationaryEmplacements.GDF009 }
    ],
    [StationaryPresetID.AirPortTwo_AirGuns]: [
        { stationarySpawnpointID: 111, type: mod.StationaryEmplacements.GDF009 }
    ],
    [StationaryPresetID.TankBaseOne_AntiAir]: [
        { stationarySpawnpointID: 83, type: mod.StationaryEmplacements.GDF009 }
    ],
    [StationaryPresetID.TankBaseTwo_AntiAir]: [
        { stationarySpawnpointID: 121, type: mod.StationaryEmplacements.GDF009 }
    ],
    [StationaryPresetID.CenterBase_AntiTank]: [
        { stationarySpawnpointID: 122, type: mod.StationaryEmplacements.BGM71TOW }
    ],
};
```

### Initialize Multiple Emplacements

```typescript
async function InitializeBaseDefenses(): Promise<void> {
    // Anti-air emplacements
    const aaSpawnerIds = [5, 111, 83, 121];
    for (const id of aaSpawnerIds) {
        const spawner = mod.GetEmplacementSpawner(id);
        mod.SetEmplacementSpawnerType(spawner, mod.StationaryEmplacements.GDF009);
        mod.SetEmplacementSpawnerAutoSpawn(spawner, true);
        mod.SetEmplacementSpawnerRespawnTime(spawner, 60); // 60 second respawn
        mod.ForceEmplacementSpawnerSpawn(spawner);
    }

    // Anti-tank emplacements
    const atSpawnerIds = [122];
    for (const id of atSpawnerIds) {
        const spawner = mod.GetEmplacementSpawner(id);
        mod.SetEmplacementSpawnerType(spawner, mod.StationaryEmplacements.BGM71TOW);
        mod.SetEmplacementSpawnerAutoSpawn(spawner, true);
        mod.SetEmplacementSpawnerRespawnTime(spawner, 90); // 90 second respawn
        mod.ForceEmplacementSpawnerSpawn(spawner);
    }
}
```

### Configure Abandonment Behavior

```typescript
function ConfigureEmplacementAbandonment(spawnerId: number): void {
    const spawner = mod.GetEmplacementSpawner(spawnerId);

    // Destroy if player goes outside combat area
    mod.SetEmplacementSpawnerAbandonVehicleOutOfCombatArea(spawner, true);

    // Apply damage to abandoned emplacements
    mod.SetEmplacementSpawnerApplyDamageToAbandonVehicle(spawner, true);

    // Player must be within 50 units to keep alive
    mod.SetEmplacementSpawnerKeepAliveAbandonRadius(spawner, 50);

    // Emplacement considered abandoned if 100+ units from spawner
    mod.SetEmplacementSpawnerSpawnerRadius(spawner, 100);

    // 30 seconds idle before considered abandoned
    mod.SetEmplacementSpawnerTimeUntilAbandon(spawner, 30);
}
```

### Dynamic Emplacement System

```typescript
class EmplacementManager {
    private emplacements: Map<number, mod.EmplacementSpawner> = new Map();

    register(spawnerId: number, type: mod.StationaryEmplacements): void {
        const spawner = mod.GetEmplacementSpawner(spawnerId);
        mod.SetEmplacementSpawnerType(spawner, type);
        this.emplacements.set(spawnerId, spawner);
    }

    spawnAll(): void {
        this.emplacements.forEach(spawner => {
            mod.SetEmplacementSpawnerAutoSpawn(spawner, true);
            mod.ForceEmplacementSpawnerSpawn(spawner);
        });
    }

    disableAll(): void {
        this.emplacements.forEach(spawner => {
            mod.SetEmplacementSpawnerAutoSpawn(spawner, false);
        });
    }

    setRespawnTime(seconds: number): void {
        this.emplacements.forEach(spawner => {
            mod.SetEmplacementSpawnerRespawnTime(spawner, seconds);
        });
    }
}

// Usage
const emplacementManager = new EmplacementManager();
emplacementManager.register(5, mod.StationaryEmplacements.GDF009);
emplacementManager.register(122, mod.StationaryEmplacements.BGM71TOW);
emplacementManager.spawnAll();
```

### Team-Based Emplacement Activation

```typescript
function ActivateTeamEmplacements(teamNumber: number): void {
    const teamEmplacements: Record<number, number[]> = {
        1: [5, 83],    // Team 1 emplacement spawner IDs
        2: [111, 121], // Team 2 emplacement spawner IDs
    };

    const spawnerIds = teamEmplacements[teamNumber] || [];

    for (const id of spawnerIds) {
        const spawner = mod.GetEmplacementSpawner(id);
        mod.SetEmplacementSpawnerAutoSpawn(spawner, true);
        mod.ForceEmplacementSpawnerSpawn(spawner);
    }
}
```

---

## Godot Setup

In Godot, place `StationaryEmplacementSpawner` objects:

```
[node name="StationaryEmplacementSpawner" instance=ExtResource("StationaryEmplacementSpawner")]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, -24.7812, -0.47168, 2.67896)
ObjId = 5
StationaryEmplacementType = 1
P_DefaultRespawnTime = 60
```

Properties:
- **ObjId**: Unique identifier for `GetEmplacementSpawner(id)`
- **StationaryEmplacementType**: Default type (can be overridden in code)
- **P_DefaultRespawnTime**: Default respawn time in seconds

---

## Event Hook

```typescript
// Per-emplacement-spawner tick logic
export function OngoingEmplacementSpawner(
    eventEmplacementSpawner: mod.EmplacementSpawner
): void {
    // Runs every tick for each emplacement spawner
    // Use for monitoring or dynamic behavior
}
```

---

## Constraints & Gotchas

1. **Godot Placement Required**: Emplacement spawners must be placed in Godot editor with valid ObjId.

2. **Type Must Be Set**: Call `SetEmplacementSpawnerType` before spawning if you want a specific type.

3. **ForceSpawn is Immediate**: `ForceEmplacementSpawnerSpawn` spawns immediately, ignoring respawn timer.

4. **Auto-Spawn Default**: Check your Godot settings - auto-spawn may be on by default.

5. **Abandonment System**: The abandonment parameters control when unattended emplacements are destroyed:
   - `KeepAliveAbandonRadius` - Distance from nearest player
   - `SpawnerRadius` - Distance from the spawner itself
   - `TimeUntilAbandon` - Idle time threshold

6. **Limited Types**: Only 3 emplacement types available: BGM71TOW, GDF009, M2MG.

---

## Use Cases

- **Base defense** - Stationary weapons at capture points
- **Anti-air coverage** - GDF009 at strategic locations
- **Anti-vehicle positions** - BGM71TOW at chokepoints
- **Upgrade systems** - Unlock emplacements as rewards (like WarFactory)
- **Dynamic spawning** - Spawn emplacements based on game state

---

## Integration with Other Patterns

- [capture-points.md](capture-points.md) - Spawn emplacements at captured objectives
- [vehicles.md](vehicles.md) - Alternative to vehicle spawners for static weapons
- [../ai/behavior-system.md](../ai/behavior-system.md) - AI defending emplacement positions
