# Pattern: Vehicles

> **SDK Version**: 1.1.3.0 (Battlefield 6)
> **Source**: mods/BumperCars/BumperCars.ts:1118-1176, mods/AcePursuit/AcePursuit.ts:1150-1256

---

## Overview

Vehicle management in Portal includes spawning vehicles dynamically, tracking spawned vehicles via events, and forcing players into vehicle seats. This pattern is essential for racing games, vehicle-only modes, and any mod that programmatically assigns vehicles.

---

## Core Workflow

The vehicle spawning workflow follows this sequence:

1. **Create Vehicle Spawner** - `mod.SpawnObject(mod.RuntimeSpawn_Common.VehicleSpawner, position, rotation)`
2. **Set Vehicle Type** - `mod.SetVehicleSpawnerVehicleType(spawner, vehicleType)`
3. **Trigger Spawn** - `mod.ForceVehicleSpawnerSpawn(spawner)`
4. **Handle Event** - `export function OnVehicleSpawned(eventVehicle)` fires when vehicle spawns
5. **Seat Player** - `mod.ForcePlayerToSeat(player, vehicle, seatIndex)`

**Critical**: There's a delay between `ForceVehicleSpawnerSpawn` and the vehicle actually appearing. Wait ~1 second or use proximity detection in `OnVehicleSpawned` to match vehicles to players.

---

## Working Code

### Basic Vehicle Spawning (BumperCars pattern)

```typescript
// Track spawned vehicles globally
static VehiclesSpawned: mod.Vehicle[] = [];

// Event hook - export this at module level
export function OnVehicleSpawned(eventVehicle: mod.Vehicle) {
    HoH_GameHandler.VehiclesSpawned.push(eventVehicle);
}

// Spawn vehicles and seat players
static async SpawnVehiclesAndSeatPlayer() {
    const vehicleType = mod.VehicleList.Vector; // or any VehicleList enum value

    for (let index = 0; index < players.length; index++) {
        const player = players[index];
        const spawnPosition = spawnPoints[index];

        // Create spawner with rotation facing desired direction
        const vehSpawner = mod.SpawnObject(
            mod.RuntimeSpawn_Common.VehicleSpawner,
            mod.CreateVector(spawnPosition.x, spawnPosition.y, spawnPosition.z),
            mod.CreateVector(0, 0, 0),  // rotation (pitch, yaw, roll)
            mod.CreateVector(1, 1, 1)   // scale
        );

        // Configure and spawn
        mod.SetVehicleSpawnerVehicleType(vehSpawner, vehicleType);
        mod.ForceVehicleSpawnerSpawn(vehSpawner);
    }

    // Wait for vehicles to spawn
    await mod.Wait(1);

    // Seat each player in their vehicle
    for (let index = 0; index < players.length; index++) {
        const player = players[index];
        const vehicle = VehiclesSpawned[index];

        if (vehicle && player) {
            mod.ForcePlayerToSeat(player, vehicle, 0); // seat 0 = driver
        }
    }

    VehiclesSpawned = []; // Clear for next use
}
```

### Advanced: Proximity-Based Vehicle Assignment (AcePursuit pattern)

When you need to match spawned vehicles to specific players reliably:

```typescript
type VehicleAssignment = {
    player: mod.Player;
    position: mod.Vector;
    vehicleSpawner: mod.VehicleSpawner;
    vehicle?: mod.Vehicle;
};

class VehicleHandler {
    static playerNeedingVehicle: VehicleAssignment[] = [];

    static RequestVehicle(player: mod.Player, position: mod.Vector, vehicleType: mod.VehicleList) {
        const vehSpawner = mod.SpawnObject(
            mod.RuntimeSpawn_Common.VehicleSpawner,
            position,
            mod.CreateVector(0, 0, 0)
        );

        // Track the pending assignment
        VehicleHandler.playerNeedingVehicle.push({
            player: player,
            position: position,
            vehicleSpawner: vehSpawner
        });

        mod.SetVehicleSpawnerVehicleType(vehSpawner, vehicleType);
        mod.ForceVehicleSpawnerSpawn(vehSpawner);
    }

    static async OnVehicleSpawned(eventVehicle: mod.Vehicle) {
        if (VehicleHandler.playerNeedingVehicle.length === 0) {
            return;
        }

        // Get spawned vehicle position
        const vehiclePos = mod.GetVehicleState(eventVehicle, mod.VehicleStateVector.VehiclePosition);

        // Find which pending assignment this vehicle belongs to (proximity check)
        let closestDistance: number | null = null;
        let targetAssignment: VehicleAssignment | undefined;

        for (const assignment of VehicleHandler.playerNeedingVehicle) {
            const distance = mod.DistanceBetween(vehiclePos, assignment.position);
            if (distance <= 25 && (closestDistance === null || distance < closestDistance)) {
                closestDistance = distance;
                targetAssignment = assignment;
            }
        }

        if (!targetAssignment) {
            console.log("Could not match vehicle to pending assignment");
            return;
        }

        // Remove from pending list
        const index = VehicleHandler.playerNeedingVehicle.indexOf(targetAssignment);
        if (index !== -1) {
            VehicleHandler.playerNeedingVehicle.splice(index, 1);
        }

        // Teleport player above vehicle, then seat them
        const spawnOffset = mod.Add(vehiclePos, mod.CreateVector(0, 10, 0));
        mod.Teleport(targetAssignment.player, spawnOffset, 0);

        await mod.Wait(0.5);
        mod.ForcePlayerToSeat(targetAssignment.player, eventVehicle, 0);
    }
}

// Module-level event hook
export async function OnVehicleSpawned(eventVehicle: mod.Vehicle) {
    VehicleHandler.OnVehicleSpawned(eventVehicle);
}
```

### Pre-placed Vehicle Spawners (from Godot scene)

If you have spawners placed in the Godot scene:

```typescript
// Get pre-placed spawner by index (1-based)
const spawner1 = mod.GetVehicleSpawner(1);
const spawner2 = mod.GetVehicleSpawner(2);

// Configure and trigger
mod.SetVehicleSpawnerVehicleType(spawner1, mod.VehicleList.F22);
mod.ForceVehicleSpawnerSpawn(spawner1);
```

### Checking Vehicle State

```typescript
// Get all vehicles in the game
const allVehicles = mod.AllVehicles();
const count = mod.CountOf(allVehicles);

for (let i = 0; i < count; i++) {
    const vehicle = mod.ValueInArray(allVehicles, i) as mod.Vehicle;

    // Check if occupied
    const isOccupied = mod.IsVehicleOccupied(vehicle);

    // Get vehicle position
    const position = mod.GetVehicleState(vehicle, mod.VehicleStateVector.VehiclePosition);

    // Get facing direction
    const facing = mod.GetVehicleState(vehicle, mod.VehicleStateVector.FacingDirection);

    // Get velocity
    const velocity = mod.GetVehicleState(vehicle, mod.VehicleStateVector.LinearVelocity);
}
```

### Getting Vehicle from Player

```typescript
// Get the vehicle a player is currently in
const vehicle = mod.GetVehicleFromPlayer(player);

// Damage or destroy the vehicle
mod.DealDamage(vehicle, 9000);
```

### Forcing Player to Exit

```typescript
// Multiple overloads available
mod.ForcePlayerExitVehicle(player, vehicle);
mod.ForcePlayerExitVehicle(vehicle);  // Ejects all occupants
mod.ForcePlayerExitVehicle(player);   // Ejects player from whatever vehicle they're in
```

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `SpawnObject` | `(RuntimeSpawn_Common.VehicleSpawner, position: Vector, rotation: Vector, scale?: Vector): Object` | Create a vehicle spawner at runtime |
| `GetVehicleSpawner` | `(number: number): VehicleSpawner` | Get pre-placed spawner by index (1-based) |
| `SetVehicleSpawnerVehicleType` | `(spawner: VehicleSpawner, vehicleType: VehicleList): void` | Set which vehicle type to spawn |
| `ForceVehicleSpawnerSpawn` | `(spawner: VehicleSpawner): void` | Trigger immediate vehicle spawn |
| `ForcePlayerToSeat` | `(player: Player, vehicle: Vehicle, seatNumber: number): void` | Force player into vehicle seat (0 = driver, -1 = first available) |
| `ForcePlayerExitVehicle` | `(player?: Player, vehicle?: Vehicle): void` | Force player(s) out of vehicle |
| `GetVehicleFromPlayer` | `(player: Player): Vehicle` | Get vehicle player is currently in |
| `GetVehicleState` | `(vehicle: Vehicle, stateVector: VehicleStateVector): Vector` | Get position/facing/velocity |
| `IsVehicleOccupied` | `(vehicle: Vehicle): boolean` | Check if anyone is in the vehicle |
| `AllVehicles` | `(): Array` | Get array of all vehicles |
| `DealDamage` | `(target: Vehicle, damage: number): void` | Damage a vehicle |
| `UnspawnObject` | `(object: Object): void` | Remove spawner or vehicle |

---

## Available Vehicle Types

```typescript
enum VehicleList {
    Abrams,         // M1 Abrams tank
    AH64,           // Apache attack helicopter
    Cheetah,        // AA vehicle
    CV90,           // Infantry fighting vehicle
    Eurocopter,     // Transport helicopter
    F16,            // Fighter jet
    F22,            // Stealth fighter
    Flyer60,        // Light helicopter
    Gepard,         // AA tank
    GolfCart,       // Utility vehicle
    JAS39,          // Fighter jet
    Leopard,        // Leopard tank
    M2Bradley,      // Bradley IFV
    Marauder,       // Armored transport
    Marauder_Pax,   // Passenger variant
    Quadbike,       // ATV
    RHIB,           // Boat
    SU57,           // Russian stealth fighter
    UH60,           // Blackhawk helicopter
    UH60_Pax,       // Passenger variant
    Vector,         // Light ground vehicle
}
```

---

## Vehicle State Vectors

```typescript
enum VehicleStateVector {
    FacingDirection,   // Direction vehicle is facing
    LinearVelocity,    // Current movement velocity
    VehiclePosition,   // World position
}
```

---

## Additional Spawner Configuration

```typescript
// Auto-spawn settings
mod.SetVehicleSpawnerAutoSpawn(spawner, false);  // Disable automatic respawn
mod.SetVehicleSpawnerRespawnTime(spawner, 30);   // 30 seconds respawn time

// Abandon settings
mod.SetVehicleSpawnerTimeUntilAbandon(spawner, 60);  // Time until unoccupied vehicle is abandoned
mod.SetVehicleSpawnerAbandonVehiclesOutOfCombatArea(spawner, true);
mod.SetVehicleSpawnerApplyDamageToAbandonVehicle(spawner, true);

// Keep-alive radius
mod.SetVehicleSpawnerKeepAliveSpawnerRadius(spawner, 100);
mod.SetVehicleSpawnerKeepAliveAbandonRadius(spawner, 50);
```

---

## Event Hook

Add this export at the module level to receive spawned vehicles:

```typescript
// Can be sync or async
export function OnVehicleSpawned(eventVehicle: mod.Vehicle) {
    // Track or process the spawned vehicle
}

// Or async version
export async function OnVehicleSpawned(eventVehicle: mod.Vehicle) {
    await processVehicle(eventVehicle);
}
```

---

## Constraints & Gotchas

1. **Spawn Delay**: Vehicles don't spawn instantly after `ForceVehicleSpawnerSpawn`. Wait at least 0.5-1 second before attempting to seat players.

2. **Proximity Matching**: When spawning multiple vehicles simultaneously, use proximity checks in `OnVehicleSpawned` to correctly match vehicles to intended players.

3. **Seat Numbers**: Seat 0 is always the driver. Use -1 to place player in first available seat.

4. **Spawner Cleanup**: Remember to `UnspawnObject` vehicle spawners when done, especially if spawning dynamically.

5. **Vehicle Validity**: Vehicles can be destroyed. Always check before operating on vehicle references.

6. **Teleport Before Seating**: For reliable seating, teleport the player near the vehicle position before calling `ForcePlayerToSeat`.
