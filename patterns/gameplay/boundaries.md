# Pattern: Kill Boundaries

> **SDK Version**: 1.1.3.0 (Battlefield 6)
> **Source**: mods/BumperCars/BumperCars.ts:1352-1369

---

## Overview

Kill boundaries detect when players exit valid play areas and eliminate them. Common uses:
- Fall-off-platform detection (Y-coordinate check)
- Out-of-bounds zones
- Ring of fire / shrinking safe zones

---

## Y-Coordinate Kill Zone

A continuous loop that kills players who fall below a certain height:

```typescript
class GameHandler {
    static KillHeight: number = 100;  // Y-coordinate threshold

    static async StartKillBoundaryLoop() {
        this.KillPlayersBelowYCords(this.KillHeight);
    }

    static async KillPlayersBelowYCords(yCord: number) {
        while (true) {
            PlayerProfile.playerInstances.forEach(player => {
                // Skip invalid or dead players
                if (!mod.IsPlayerValid(player)) return;
                if (!mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) return;

                // Get player position
                const playerPos = mod.GetSoldierState(
                    player,
                    mod.SoldierStateVector.GetPosition
                );

                // Check if below kill threshold
                if (mod.YComponentOf(playerPos) <= yCord) {
                    // Skip man-down state for instant death
                    mod.SkipManDown(player, true);

                    // Destroy their vehicle too (prevents ghost vehicles)
                    const veh = mod.GetVehicleFromPlayer(player);
                    mod.DealDamage(veh, 9000);

                    // Kill the player
                    mod.Kill(player);
                }
            });

            await mod.Wait(1);  // Check every second
        }
    }
}
```

---

## Key Functions

### SkipManDown

Prevents the "downed" state where players can be revived:

```typescript
// true = skip man-down, player dies instantly
mod.SkipManDown(player, true);

// false = normal behavior, player goes down before death
mod.SkipManDown(player, false);
```

**Why use it**: Without `SkipManDown(true)`, players who fall off platforms will enter "man-down" state and could potentially be revived, breaking the game logic.

### Kill

Immediately kills a player:

```typescript
// Kill a player
mod.Kill(player);

// Also works on vehicles
mod.Kill(vehicle);
```

### Getting Player Position

```typescript
const position = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
const yHeight = mod.YComponentOf(position);
```

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `Kill` | `(player: Player): void` | Kill the player |
| `Kill` | `(vehicle: Vehicle): void` | Destroy the vehicle |
| `SkipManDown` | `(player: Player, skip: boolean): void` | If true, player dies instantly without downed state |
| `DealDamage` | `(target: Vehicle, damage: number): void` | Damage a vehicle |
| `GetVehicleFromPlayer` | `(player: Player): Vehicle` | Get vehicle player is in |
| `GetSoldierState` | `(player, SoldierStateVector.GetPosition): Vector` | Get player position |
| `YComponentOf` | `(vector: Vector): number` | Extract Y component |
| `IsPlayerValid` | `(player: Player): boolean` | Check if player reference is valid |

---

## Complete Example: Arena Boundary System

```typescript
class ArenaManager {
    // Kill height below platform
    static readonly KILL_HEIGHT = 120;

    // Track game state
    static gameRunning = false;

    static async StartBoundaryCheck() {
        this.gameRunning = true;

        while (this.gameRunning) {
            for (const profile of PlayerProfile.playerInstances) {
                this.CheckPlayerBounds(profile);
            }
            await mod.Wait(0.5);  // Check twice per second
        }
    }

    static CheckPlayerBounds(player: mod.Player) {
        if (!mod.IsPlayerValid(player)) return;
        if (!mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) return;

        const pos = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
        const y = mod.YComponentOf(pos);

        if (y <= this.KILL_HEIGHT) {
            console.log("Player fell off platform");
            this.EliminatePlayer(player);
        }
    }

    static EliminatePlayer(player: mod.Player) {
        // Skip man-down for clean death
        mod.SkipManDown(player, true);

        // Destroy vehicle if in one
        try {
            const vehicle = mod.GetVehicleFromPlayer(player);
            if (vehicle) {
                mod.DealDamage(vehicle, 9999);
            }
        } catch {
            // Player wasn't in vehicle, that's fine
        }

        // Kill the player
        mod.Kill(player);
    }

    static StopBoundaryCheck() {
        this.gameRunning = false;
    }
}
```

---

## Alternative: Distance-Based Boundaries

For circular or complex boundary shapes:

```typescript
class CircularBoundary {
    static readonly CENTER = { x: -610, y: 133, z: -34 };
    static readonly MAX_RADIUS = 200;

    static async CheckBoundaries() {
        while (true) {
            for (const player of PlayerProfile.playerInstances) {
                if (!mod.IsPlayerValid(player)) continue;
                if (!mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) continue;

                const pos = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
                const centerVec = mod.CreateVector(
                    this.CENTER.x,
                    this.CENTER.y,
                    this.CENTER.z
                );

                const distance = mod.DistanceBetween(pos, centerVec);

                if (distance > this.MAX_RADIUS) {
                    mod.SkipManDown(player, true);
                    mod.Kill(player);
                }
            }

            await mod.Wait(1);
        }
    }
}
```

---

## Integration with OnPlayerDied

Handle death events for game logic:

```typescript
export function OnPlayerDied(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
) {
    // Remove from active players list
    GameHandler.RemovePlayerFromGame(mod.GetObjId(eventPlayer));

    // Check win condition
    if (GameHandler.playersInGame.length <= 1) {
        GameHandler.RoundOver();
    }
}
```

---

## Constraints & Gotchas

1. **SkipManDown Timing**: Call `SkipManDown(player, true)` BEFORE `Kill(player)`. Calling it after has no effect.

2. **Vehicle Cleanup**: Always destroy the player's vehicle when killing them from a boundary. Otherwise "ghost vehicles" can remain in the game.

3. **Check Rate**: Balance check frequency vs performance:
   - `Wait(1)` = 1 check/second (good for slow-moving games)
   - `Wait(0.1)` = 10 checks/second (needed for fast vehicles)

4. **Player Validity**: Always check `mod.IsPlayerValid(player)` before operations. Players can disconnect between checks.

5. **IsAlive Check**: Skip dead players to avoid double-killing or errors.

6. **Loop Termination**: Include a way to stop the boundary loop when the game/round ends.
