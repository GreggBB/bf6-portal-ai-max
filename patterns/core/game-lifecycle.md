# Pattern: Game Lifecycle
> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/_StartHere_BasicTemplate/BasicTemplate.ts:63-112

## What This Does

The game lifecycle pattern handles initialization, runtime logic, and cleanup for a Portal mod. The primary entry point is `OnGameModeStarted()`, which is called once when the match begins.

---

## Core Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `mod.Wait` | `(seconds: number): Promise<void>` | Async delay - only usable in async functions |
| `mod.GetHQ` | `(index: number): mod.HQ` | Get HQ by index |
| `mod.EnableHQ` | `(hq: mod.HQ, enabled: boolean): void` | Enable/disable HQ spawning |
| `mod.GetCapturePoint` | `(index: number): mod.CapturePoint` | Get capture point by index |
| `mod.EnableGameModeObjective` | `(objective: mod.CapturePoint \| mod.HQ \| mod.Sector \| mod.MCOM, enabled: boolean): void` | Enable/disable objective |
| `mod.GetObjId` | `(object: any): number` | Get object's ID |
| `mod.EndGameMode` | `(winningTeam?: mod.Team): void` | End the game |
| `mod.SetGameModeTimeLimit` | `(seconds: number): void` | Set time limit |
| `mod.SetGameModeTargetScore` | `(score: number): void` | Set score to win |
| `mod.SetGameModeScore` | `(team: mod.Team, score: number): void` | Set team's score |
| `mod.GetGameModeScore` | `(team: mod.Team): number` | Get team's score |
| `mod.PauseGameModeTime` | `(paused: boolean): void` | Pause/resume game timer |
| `mod.ResetGameModeTime` | `(): void` | Reset timer to 0 |
| `mod.GetMatchTimeElapsed` | `(): number` | Get elapsed time in seconds |

---

## Working Code: Basic Initialization

From BasicTemplate.ts:63-112:

```typescript
export async function OnGameModeStarted() {
    // Enable HQ (spawn point) - requires HQ_PlayerSpawner placed in Godot
    const hq = mod.GetHQ(0);
    mod.EnableHQ(hq, true);

    // Enable capture point objective
    const capturePoint = mod.GetCapturePoint(0);
    mod.EnableGameModeObjective(capturePoint, true);

    // Get object ID for reference
    const capturePointId = mod.GetObjId(capturePoint);

    // Create position vectors
    const vector = mod.CreateVector(1, 2, 3);

    // Find closest player to position
    const player = mod.ClosestPlayerTo(vector);

    // Get team references
    const teamOfPlayer = mod.GetTeam(player);
    const teamObject = mod.GetTeam(0);

    // Display notification message
    const exampleMessage = mod.Message('example');
    mod.DisplayNotificationMessage(exampleMessage);
    mod.DisplayNotificationMessage(exampleMessage, player);
    mod.DisplayNotificationMessage(exampleMessage, teamOfPlayer);

    // Wait 5 seconds before continuing
    await mod.Wait(5);

    // Teleport player - angle is in RADIANS
    mod.Teleport(player, mod.CreateVector(100, 0, 100), mod.Pi());

    // Access vector components
    const x = mod.XComponentOf(vector);
    const y = mod.YComponentOf(vector);
    const z = mod.ZComponentOf(vector);
    const changedVector = mod.CreateVector(x + 10, y - 5, z * 2);

    // Read player state
    const eyePosition = mod.GetSoldierState(player, mod.SoldierStateVector.EyePosition);
    const facingDirection = mod.GetSoldierState(player, mod.SoldierStateVector.GetFacingDirection);
    const health = mod.GetSoldierState(player, mod.SoldierStateNumber.CurrentHealth);
    const isInWater = mod.GetSoldierState(player, mod.SoldierStateBool.IsInWater);
}
```

---

## Vector Operations

| Function | Signature | Description |
|----------|-----------|-------------|
| `mod.CreateVector` | `(x: number, y: number, z: number): mod.Vector` | Create a 3D vector |
| `mod.XComponentOf` | `(vector: mod.Vector): number` | Get X (left/right) |
| `mod.YComponentOf` | `(vector: mod.Vector): number` | Get Y (up/down) |
| `mod.ZComponentOf` | `(vector: mod.Vector): number` | Get Z (forward/back) |
| `mod.Pi` | `(): number` | Returns 3.14159... |

**Coordinate system**: X = left/right, Y = up/down, Z = forward/back

---

## Player State Reading

| State Type | Enum | Values |
|------------|------|--------|
| Vector states | `mod.SoldierStateVector` | `EyePosition`, `GetFacingDirection`, `GetPosition`, `GetVelocity` |
| Number states | `mod.SoldierStateNumber` | `CurrentHealth`, `MaxHealth`, `CurrentAmmo`, `AmmoInReserve` |
| Boolean states | `mod.SoldierStateBool` | `IsInWater`, `IsOnGround`, `IsAiming`, `IsSprinting`, `IsCrouching`, `IsProne` |

Usage:
```typescript
const eyePos = mod.GetSoldierState(player, mod.SoldierStateVector.EyePosition);
const health = mod.GetSoldierState(player, mod.SoldierStateNumber.CurrentHealth);
const inWater = mod.GetSoldierState(player, mod.SoldierStateBool.IsInWater);
```

---

## Team Operations

| Function | Signature | Description |
|----------|-----------|-------------|
| `mod.GetTeam` | `(playerOrIndex: mod.Player \| number): mod.Team` | Get team from player or index |
| `mod.SetTeam` | `(player: mod.Player, team: mod.Team): void` | Set player's team |
| `mod.SwitchTeams` | `(player: mod.Player): void` | Switch player to other team |

**Team indices**: 0 = Team 1, 1 = Team 2 (may have more in some modes)

---

## Messaging

| Function | Signature | Description |
|----------|-----------|-------------|
| `mod.Message` | `(key: string): mod.Message` | Get localized message by key |
| `mod.DisplayNotificationMessage` | `(message: mod.Message, target?: mod.Player \| mod.Team): void` | Show notification |

Messages must be defined in your `.strings.json` file.

---

## Constraints

1. **OnGameModeStarted can be async**: It's the only event that officially supports `async/await`
2. **GetHQ/GetCapturePoint indices**: Start at 0, correspond to order placed in Godot
3. **Godot placement required**: HQs, capture points, spawn points must exist in the Godot scene
4. **Teleport angle in radians**: Use `mod.Pi()` for 180 degrees
5. **Wait is in seconds**: `mod.Wait(5)` waits 5 seconds, not milliseconds
6. **Message keys**: Must exist in your mod's `.strings.json` file

---

## Related Patterns

- [event-hooks.md](event-hooks.md) - All available event hooks
- [async-patterns.md](async-patterns.md) - Using async/await properly
- [player/state.md](../player/state.md) - Reading player state
