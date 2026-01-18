# Pattern: Event Hooks
> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: code/mod/index.d.ts:24345-24538, mods/_StartHere_BasicTemplate/BasicTemplate.ts:14-61

## What This Does

Event hooks are functions you export from your mod that the Portal runtime calls when specific game events occur. They are the primary way to react to gameplay events.

**Critical**: These functions must be `export function` - they are not called by your code, they are called BY the game.

---

## Complete Event List

### Game Lifecycle Events

| Event | Signature | When Triggered |
|-------|-----------|----------------|
| `OnGameModeStarted` | `(): void` or `async (): Promise<void>` | Game mode begins. Use for initialization. Can be async. |
| `OnGameModeEnding` | `(): void` | Game mode is ending. Use for cleanup. |
| `OnTimeLimitReached` | `(): void` | Time limit reached (if configured). |

### Player Lifecycle Events

| Event | Signature | When Triggered |
|-------|-----------|----------------|
| `OnPlayerJoinGame` | `(eventPlayer: mod.Player): void` | Player joins the match |
| `OnPlayerLeaveGame` | `(eventNumber: number): void` | Player leaves. Note: receives number, not Player |
| `OnPlayerDeployed` | `(eventPlayer: mod.Player): void` | Player spawns into the game |
| `OnPlayerUndeploy` | `(eventPlayer: mod.Player): void` | Player returns to deploy screen |
| `OnPlayerSwitchTeam` | `(eventPlayer: mod.Player, eventTeam: mod.Team): void` | Player switches teams |

### Combat Events

| Event | Signature | When Triggered |
|-------|-----------|----------------|
| `OnPlayerDied` | `(eventPlayer: mod.Player, eventOtherPlayer: mod.Player, eventDeathType: mod.DeathType, eventWeaponUnlock: mod.WeaponUnlock): void` | Player dies. eventPlayer = victim, eventOtherPlayer = killer |
| `OnPlayerEarnedKill` | `(eventPlayer: mod.Player, eventOtherPlayer: mod.Player, eventDeathType: mod.DeathType, eventWeaponUnlock: mod.WeaponUnlock): void` | Player gets a kill. eventPlayer = killer |
| `OnPlayerEarnedKillAssist` | `(eventPlayer: mod.Player, eventOtherPlayer: mod.Player): void` | Player assists in a kill |
| `OnPlayerDamaged` | `(eventPlayer: mod.Player, eventOtherPlayer: mod.Player, eventDamageType: mod.DamageType, eventWeaponUnlock: mod.WeaponUnlock): void` | Player takes damage |
| `OnMandown` | `(eventPlayer: mod.Player, eventOtherPlayer: mod.Player): void` | Player enters downed state |
| `OnRevived` | `(eventPlayer: mod.Player, eventOtherPlayer: mod.Player): void` | Player is revived |

### Spatial/Trigger Events

| Event | Signature | When Triggered |
|-------|-----------|----------------|
| `OnPlayerEnterAreaTrigger` | `(eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger): void` | Player enters AreaTrigger volume |
| `OnPlayerExitAreaTrigger` | `(eventPlayer: mod.Player, eventAreaTrigger: mod.AreaTrigger): void` | Player exits AreaTrigger volume |
| `OnPlayerEnterCapturePoint` | `(eventPlayer: mod.Player, eventCapturePoint: mod.CapturePoint): void` | Player enters capture point |
| `OnPlayerExitCapturePoint` | `(eventPlayer: mod.Player, eventCapturePoint: mod.CapturePoint): void` | Player exits capture point |
| `OnPlayerInteract` | `(eventPlayer: mod.Player, eventInteractPoint: mod.InteractPoint): void` | Player interacts with InteractPoint |

### Vehicle Events

| Event | Signature | When Triggered |
|-------|-----------|----------------|
| `OnVehicleSpawned` | `(eventVehicle: mod.Vehicle): void` or `async` | Vehicle spawns (from spawner or dynamically). Can be async. |
| `OnVehicleDestroyed` | `(eventVehicle: mod.Vehicle): void` | Vehicle destroyed |
| `OnPlayerEnterVehicle` | `(eventPlayer: mod.Player, eventVehicle: mod.Vehicle): void` | Player enters any seat |
| `OnPlayerExitVehicle` | `(eventPlayer: mod.Player, eventVehicle: mod.Vehicle): void` | Player exits vehicle |
| `OnPlayerEnterVehicleSeat` | `(eventPlayer: mod.Player, eventVehicle: mod.Vehicle, eventNumber: number): void` | Player enters specific seat |
| `OnPlayerExitVehicleSeat` | `(eventPlayer: mod.Player, eventVehicle: mod.Vehicle, eventNumber: number): void` | Player exits specific seat |

### Objective Events

| Event | Signature | When Triggered |
|-------|-----------|----------------|
| `OnCapturePointCaptured` | `(eventCapturePoint: mod.CapturePoint): void` | Capture point fully captured |
| `OnCapturePointCapturing` | `(eventCapturePoint: mod.CapturePoint): void` | Capture point being contested |
| `OnCapturePointLost` | `(eventCapturePoint: mod.CapturePoint): void` | Capture point lost |
| `OnMCOMArmed` | `(eventMCOM: mod.MCOM): void` | MCOM armed |
| `OnMCOMDefused` | `(eventMCOM: mod.MCOM): void` | MCOM defused |
| `OnMCOMDestroyed` | `(eventMCOM: mod.MCOM): void` | MCOM destroyed |

### AI Events

| Event | Signature | When Triggered |
|-------|-----------|----------------|
| `OnAIMoveToFailed` | `(eventPlayer: mod.Player): void` | AI pathfinding failed |
| `OnAIMoveToRunning` | `(eventPlayer: mod.Player): void` | AI is moving to target |
| `OnAIMoveToSucceeded` | `(eventPlayer: mod.Player): void` | AI reached destination |
| `OnAIParachuteRunning` | `(eventPlayer: mod.Player): void` | AI is parachuting |
| `OnAIParachuteSucceeded` | `(eventPlayer: mod.Player): void` | AI landed from parachute |
| `OnAIWaypointIdleFailed` | `(eventPlayer: mod.Player): void` | AI waypoint idle failed |
| `OnAIWaypointIdleRunning` | `(eventPlayer: mod.Player): void` | AI idling at waypoint |
| `OnAIWaypointIdleSucceeded` | `(eventPlayer: mod.Player): void` | AI completed waypoint idle |
| `OnSpawnerSpawned` | `(eventPlayer: mod.Player, eventSpawner: mod.Spawner): void` | AI spawned from spawner |

### UI Events

| Event | Signature | When Triggered |
|-------|-----------|----------------|
| `OnPlayerUIButtonEvent` | `(eventPlayer: mod.Player, eventUIWidget: mod.UIWidget, eventUIButtonState: mod.UIButtonState): void` | Player clicks UI button |

### Ray Cast Events

| Event | Signature | When Triggered |
|-------|-----------|----------------|
| `OnRayCastHit` | `(eventPlayer: mod.Player, eventPoint: mod.Vector, eventNormal: mod.Vector): void` | Ray cast hit something |
| `OnRayCastMissed` | `(eventPlayer: mod.Player): void` | Ray cast hit nothing |

### Ring of Fire Events

| Event | Signature | When Triggered |
|-------|-----------|----------------|
| `OnRingOfFireZoneSizeChange` | `(eventRingOfFire: mod.RingOfFire, eventNumber: number): void` | Ring of fire zone changes |

### Ongoing Events (Continuous Updates)

These run continuously every tick for the specified entity type:

| Event | Signature | Use For |
|-------|-----------|---------|
| `OngoingGlobal` | `(): void` | Global per-tick logic |
| `OngoingPlayer` | `(eventPlayer: mod.Player): void` | Per-player per-tick logic |
| `OngoingTeam` | `(eventTeam: mod.Team): void` | Per-team per-tick logic |
| `OngoingVehicle` | `(eventVehicle: mod.Vehicle): void` | Per-vehicle per-tick logic |
| `OngoingAreaTrigger` | `(eventAreaTrigger: mod.AreaTrigger): void` | Per-trigger per-tick |
| `OngoingCapturePoint` | `(eventCapturePoint: mod.CapturePoint): void` | Per-capture-point per-tick |
| `OngoingHQ` | `(eventHQ: mod.HQ): void` | Per-HQ per-tick |
| `OngoingInteractPoint` | `(eventInteractPoint: mod.InteractPoint): void` | Per-interact-point per-tick |
| `OngoingMCOM` | `(eventMCOM: mod.MCOM): void` | Per-MCOM per-tick |
| `OngoingSpawner` | `(eventSpawner: mod.Spawner): void` | Per-AI-spawner per-tick |
| `OngoingSpawnPoint` | `(eventSpawnPoint: mod.SpawnPoint): void` | Per-spawn-point per-tick |
| `OngoingVehicleSpawner` | `(eventVehicleSpawner: mod.VehicleSpawner): void` | Per-vehicle-spawner per-tick |
| `OngoingWorldIcon` | `(eventWorldIcon: mod.WorldIcon): void` | Per-world-icon per-tick |
| `OngoingWaypointPath` | `(eventWaypointPath: mod.WaypointPath): void` | Per-waypoint per-tick |
| `OngoingLootSpawner` | `(eventLootSpawner: mod.LootSpawner): void` | Per-loot-spawner per-tick |
| `OngoingEmplacementSpawner` | `(eventEmplacementSpawner: mod.EmplacementSpawner): void` | Per-emplacement per-tick |
| `OngoingSector` | `(eventSector: mod.Sector): void` | Per-sector per-tick |
| `OngoingRingOfFire` | `(eventRingOfFire: mod.RingOfFire): void` | Per-ring-of-fire per-tick |

---

## Working Code Examples

### Basic Event Hooks (from BasicTemplate.ts:14-54)

```typescript
// Player joins the game
export function OnPlayerJoinGame(eventPlayer: mod.Player): void {
    // Setup logic for new player
}

// Player leaves the game - NOTE: receives number, not Player object
export function OnPlayerLeaveGame(eventNumber: number): void {
    // Cleanup logic
}

// Player spawns into game
export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    // Spawn-time logic
}

// Player dies
export function OnPlayerDied(
    eventPlayer: mod.Player,      // The player who died
    eventOtherPlayer: mod.Player, // The killer
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    // Death handling
}

// Player gets a kill
export function OnPlayerEarnedKill(
    eventPlayer: mod.Player,      // The killer
    eventOtherPlayer: mod.Player, // The victim
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    // Kill reward logic
}

// Player takes damage
export function OnPlayerDamaged(
    eventPlayer: mod.Player,      // Player who took damage
    eventOtherPlayer: mod.Player, // Player who dealt damage
    eventDamageType: mod.DamageType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    // Damage handling
}

// Player interacts with InteractPoint
export function OnPlayerInteract(
    eventPlayer: mod.Player,
    eventInteractPoint: mod.InteractPoint
): void {
    // Interaction logic
}

// Player enters/exits capture point
export function OnPlayerEnterCapturePoint(
    eventPlayer: mod.Player,
    eventCapturePoint: mod.CapturePoint
): void {}

export function OnPlayerExitCapturePoint(
    eventPlayer: mod.Player,
    eventCapturePoint: mod.CapturePoint
): void {}

// Player enters/exits area trigger
export function OnPlayerEnterAreaTrigger(
    eventPlayer: mod.Player,
    eventAreaTrigger: mod.AreaTrigger
): void {}

export function OnPlayerExitAreaTrigger(
    eventPlayer: mod.Player,
    eventAreaTrigger: mod.AreaTrigger
): void {}

// Game lifecycle
export function OnGameModeEnding(): void {}

export function OngoingGlobal(): void {
    // Runs every tick - use sparingly!
}

// Async game start - can use await
export async function OnGameModeStarted() {
    // Initialize game state here
    await mod.Wait(5); // Can wait
}

// Vehicle spawned - used for tracking dynamically spawned vehicles
// Can be sync or async
export function OnVehicleSpawned(eventVehicle: mod.Vehicle) {
    GameHandler.VehiclesSpawned.push(eventVehicle);
}

// Or async version for seating players
export async function OnVehicleSpawned(eventVehicle: mod.Vehicle) {
    await VehicleHandler.OnVehicleSpawned(eventVehicle);
}
```

---

## Constraints

1. **Must be exported**: Use `export function`, not just `function`
2. **Exact signatures required**: Parameter names and types must match exactly
3. **OnPlayerLeaveGame is special**: It receives a number (player ID), not a Player object
4. **Async only for OnGameModeStarted**: Other events cannot be async
5. **Ongoing events run every tick**: Use sparingly - they impact performance
6. **Godot placement required**: AreaTrigger, CapturePoint, InteractPoint must be placed in Godot editor with ObjId assigned

---

## Related Patterns

- [game-lifecycle.md](game-lifecycle.md) - Using OnGameModeStarted for initialization
- [async-patterns.md](async-patterns.md) - Using async/await with mod.Wait()
- [vehicles.md](../gameplay/vehicles.md) - Using OnVehicleSpawned for vehicle management
