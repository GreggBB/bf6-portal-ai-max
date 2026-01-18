# Pattern: Spawning System

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/BombSquad/BombSquad.ts:68-76, 381-437, 798-819
> Source: mods/Skirmish/Skirmish.ts:1663-1814, 3504-3547

---

## Overview

The spawning system controls how and where players enter the game. This includes spawn modes (auto, manual deploy, spectating), HQ spawners, spawn points, teleportation, and forced spawning.

---

## Spawn Modes

```typescript
// Source: code/mod/index.d.ts:21521-21525
export enum SpawnModes {
    AutoSpawn,   // Players spawn automatically when ready
    Deploy,      // Players manually choose to deploy
    Spectating,  // Dead players spectate (no respawn until next round)
}

// Set the global spawn mode
// Source: mods/BombSquad/BombSquad.ts:121
mod.SetSpawnMode(mod.SpawnModes.AutoSpawn);

// Source: mods/Skirmish/Skirmish.ts:1805
mod.SetSpawnMode(mod.SpawnModes.Spectating);
```

---

## Working Code

### HQ Spawner Setup (Godot Objects)

```typescript
// Source: mods/BombSquad/BombSquad.ts:68-76
const attackersHQID: number = 1;
const defendersHQID: number = 2;

let attackersHQ: mod.HQ = mod.GetHQ(attackersHQID);
let defendersHQ: mod.HQ = mod.GetHQ(defendersHQID);

// Get HQ position for teleporting
let hqPos: mod.Vector = mod.GetObjectPosition(attackersHQ);
```

### Controlling Player Deployment

```typescript
// Source: mods/Skirmish/Skirmish.ts:1667, 1803
// Enable deployment for all players
mod.EnableAllPlayerDeploy(true);

// Disable deployment (lock players out of spawning)
mod.EnableAllPlayerDeploy(false);

// Enable/disable for specific player
mod.EnablePlayerDeploy(player, true);
mod.EnablePlayerDeploy(player, false);
```

### Teleporting Players on Deploy

```typescript
// Source: mods/BombSquad/BombSquad.ts:381-408
export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    let teamID = mod.GetObjId(mod.GetTeam(eventPlayer));
    let attackingTeamID = mod.GetObjId(attackingTeam);

    if (teamID == attackingTeamID) {
        let hqPos: mod.Vector = mod.GetObjectPosition(attackersHQ);
        mod.Teleport(eventPlayer, hqPos, 0);
    } else {
        let hqPos: mod.Vector = mod.GetObjectPosition(defendersHQ);
        mod.Teleport(eventPlayer, hqPos, 0);
    }
}
```

### Forcing Spawn from Spawn Points

```typescript
// Source: mods/Skirmish/Skirmish.ts:3504-3547
async function ForceSpawnAllPlayers(): Promise<void> {
    console.log("Force spawning all players...");

    // Enable deployment for all players temporarily
    mod.EnableAllPlayerDeploy(true);
    await mod.Wait(1);

    const players = PlayerProfile.playerInstances;

    for (const player of players) {
        if (!mod.IsPlayerValid(player)) {
            continue;
        }

        // Check if player is dead/in deploy screen
        if (!mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) {
            // Get the player's team number
            const teamNumber = H.GetTeamNumber(player);

            if (teamNumber < 1 || teamNumber > 4) {
                continue;
            }

            // Spawn the player from numbered spawn point
            mod.SpawnPlayerFromSpawnPoint(player, teamNumber);
        }
    }

    // Wait for all spawns to complete
    await mod.Wait(2);

    console.log("Force spawn complete");
}
```

### Undeploy All Players

```typescript
// Source: mods/BombSquad/BombSquad.ts:818
// Force all players back to the deploy screen
mod.UndeployAllPlayers();
```

### Getting Spawn Point Objects

```typescript
// Get spawn point by ObjId (set in Godot)
let spawnPoint: mod.SpawnPoint = mod.GetSpawnPoint(1);

// Spawn player from SpawnPoint object
mod.SpawnPlayerFromSpawnPoint(player, spawnPoint);

// Or by spawn point ID number
mod.SpawnPlayerFromSpawnPoint(player, 1);
```

---

## Spawn Position Patterns

### Fixed Spawn Positions Array

```typescript
// Source: mods/Skirmish/Skirmish.ts:1476-1500
class GC {
    static availableSpawnPoints: mod.Vector[] = [
        mod.CreateVector(100, 65, 100),   // Spawn point 0
        mod.CreateVector(200, 65, 100),   // Spawn point 1
        mod.CreateVector(300, 65, 100),   // Spawn point 2
        mod.CreateVector(400, 65, 100),   // Spawn point 3
    ];

    static spawnHeightOffset: number = 50; // For parachute drops
}
```

### Teleport with Spread (Multiple Players)

```typescript
// Source: mods/Skirmish/Skirmish.ts:1580-1595
function GetSpawnPositionWithOffset(spawnPointIndex: number, playerIndex: number): mod.Vector {
    const baseSpawnPoint = GC.availableSpawnPoints[spawnPointIndex];

    // Offset players so they don't spawn on top of each other
    const spreadRadius = 5;
    const angle = (playerIndex / 4) * 2 * Math.PI;
    const xOffset = Math.cos(angle) * spreadRadius;
    const zOffset = Math.sin(angle) * spreadRadius;

    return mod.CreateVector(
        mod.XComponentOf(baseSpawnPoint) + xOffset,
        mod.YComponentOf(baseSpawnPoint) + GC.spawnHeightOffset,
        mod.ZComponentOf(baseSpawnPoint) + zOffset
    );
}
```

### Teleport Players by Team

```typescript
// Source: mods/Skirmish/Skirmish.ts:1776-1796
// In StartRound
PlayerProfile.deployedPlayers.forEach(player => {
    const playerTeamNumber = H.GetTeamNumber(player);
    const spawnPosition = this.GetTeamSpawnPosition(playerTeamNumber);

    // Teleport player to their team's assigned spawn position
    mod.Teleport(player, spawnPosition, 0);

    console.log("Player " + mod.GetObjId(player) + " on team " + playerTeamNumber +
        " teleported to spawn at " +
        mod.XComponentOf(spawnPosition) + ", " +
        mod.YComponentOf(spawnPosition) + ", " +
        mod.ZComponentOf(spawnPosition));
});
```

---

## Spawn State Checks

```typescript
// Check player spawn/death states
mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)    // True if alive
mod.GetSoldierState(player, mod.SoldierStateBool.IsManDown)  // True if downed
mod.GetSoldierState(player, mod.SoldierStateBool.IsDead)     // True if dead

// Get player position (only if alive)
let playerPos = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);

// Check if player is valid (hasn't left)
if (mod.IsPlayerValid(player)) {
    // Safe to operate on player
}
```

---

## Disable Player Join (Mid-Game)

```typescript
// Source: mods/Skirmish/Skirmish.ts:1802
// Prevent new players from joining mid-round
mod.DisablePlayerJoin();
```

---

## Godot Setup Requirements

### HQ_PlayerSpawner

In Godot, place `HQ_PlayerSpawner` objects and configure:

- **ObjId**: Unique identifier to get with `mod.GetHQ(id)`
- **Team**: Which team spawns here
- **InfantrySpawns**: Array of SpawnPoint nodes

```
// Example from Skirmish.tscn
[node name="TEAM_1_HQ" instance=ExtResource("HQ_PlayerSpawner")]
P_ObjId = 1
P_Team = "Team1"
InfantrySpawns = [NodePath("SpawnPoint_1_1"), NodePath("SpawnPoint_1_2"), ...]
```

### SpawnPoint

SpawnPoint nodes define exact spawn locations within an HQ:

```
[node name="SpawnPoint_1_1" parent="TEAM_1_HQ" instance=ExtResource("SpawnPoint")]
transform = Transform3D(1, 0, 0, 0, 1, 0, 0, 0, 1, 120, 65, 140)
```

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `SetSpawnMode` | `(mode: SpawnModes): void` | Set global spawn behavior |
| `EnableAllPlayerDeploy` | `(enable: boolean): void` | Allow/prevent all players from deploying |
| `EnablePlayerDeploy` | `(player: Player, enable: boolean): void` | Allow/prevent specific player from deploying |
| `SpawnPlayerFromSpawnPoint` | `(player: Player, spawnPointId: number): void` | Spawn player at numbered spawn point |
| `SpawnPlayerFromSpawnPoint` | `(player: Player, spawnPoint: SpawnPoint): void` | Spawn player at SpawnPoint object |
| `UndeployAllPlayers` | `(): void` | Force all players to deploy screen |
| `DisablePlayerJoin` | `(): void` | Prevent new players from joining |
| `GetHQ` | `(id: number): HQ` | Get HQ spawner by ObjId |
| `GetSpawnPoint` | `(id: number): SpawnPoint` | Get spawn point by ObjId |
| `GetObjectPosition` | `(object: Object): Vector` | Get position of spatial object |
| `Teleport` | `(player: Player, position: Vector, facingAngle: number): void` | Move player to position |
| `IsPlayerValid` | `(player: Player): boolean` | Check if player reference is valid |
| `GetSoldierState` | `(player: Player, state: SoldierStateBool): boolean` | Check player state (IsAlive, etc.) |
| `GetSoldierState` | `(player: Player, state: SoldierStateVector): Vector` | Get player position |

---

## Common Spawn Patterns

### Auto-Spawn Mode (BombSquad Style)

```typescript
export async function OnGameModeStarted() {
    mod.SetSpawnMode(mod.SpawnModes.AutoSpawn);
    // Players auto-spawn when they join
}

export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    // Handle spawn - teleport to correct position
    let teamHQ = getTeamHQ(eventPlayer);
    mod.Teleport(eventPlayer, mod.GetObjectPosition(teamHQ), 0);
}
```

### Round-Based Spawning (Skirmish Style)

```typescript
class GS {
    static async StartPreRound() {
        mod.EnableAllPlayerDeploy(true);
        // Players can deploy during pre-round
    }

    static async StartRound() {
        mod.EnableAllPlayerDeploy(false);
        mod.SetSpawnMode(mod.SpawnModes.Spectating);
        // Dead players spectate, no respawn
    }

    static async EndRound() {
        // Prepare for next round
        mod.UndeployAllPlayers();
    }
}
```

### Forced Team Spawn

```typescript
async function SpawnTeamAtPosition(team: mod.Team, position: mod.Vector) {
    const teamPlayers = getPlayersOnTeam(team);

    for (let i = 0; i < teamPlayers.length; i++) {
        const player = teamPlayers[i];
        const offset = getSpreadOffset(i, teamPlayers.length);
        const spawnPos = mod.CreateVector(
            mod.XComponentOf(position) + offset.x,
            mod.YComponentOf(position),
            mod.ZComponentOf(position) + offset.z
        );
        mod.Teleport(player, spawnPos, 0);
    }
}
```

---

## Constraints & Gotchas

1. **Team Comparison**: Always use `mod.GetObjId()` when comparing teams:
   ```typescript
   if (mod.GetObjId(mod.GetTeam(player)) === mod.GetObjId(attackingTeam))
   ```

2. **Player Validity**: Players can leave at any time. Always check:
   ```typescript
   if (mod.IsPlayerValid(player)) {
       mod.Teleport(player, position, 0);
   }
   ```

3. **Spawn Point IDs**: Spawn point IDs are set in Godot. Make sure your code matches the spatial configuration.

4. **Wait After Spawn**: After `SpawnPlayerFromSpawnPoint`, wait briefly before teleporting:
   ```typescript
   mod.SpawnPlayerFromSpawnPoint(player, 1);
   await mod.Wait(0.5);
   mod.Teleport(player, customPosition, 0);
   ```

5. **Deploy vs Teleport**: `SpawnPlayerFromSpawnPoint` brings a player into the game. `Teleport` moves an already-spawned player. Don't teleport dead players.

6. **HQ Position**: Use `mod.GetObjectPosition(hq)` to get the HQ's position, not the spawn points within it.

---

## Integration with Other Patterns

- **Rounds** (`patterns/gameplay/rounds.md`): Control spawning per phase
- **Sectors** (`patterns/gameplay/sectors.md`): Change HQ spawners as sectors are captured
- **Boundaries** (`patterns/gameplay/boundaries.md`): Kill players outside bounds
- **Area Triggers** (`patterns/spatial/area-triggers.md`): Detect players in spawn areas
