# Pattern: Camera Control

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: code/mod/index.d.ts:221-225, 22479-22488
> Working Example: mods/Skirmish/Skirmish.ts:78-86, 372, 543

---

## Overview

Camera control allows you to change the player's view perspective between first-person, third-person, and free camera modes. This is useful for spectator systems, alternative gameplay modes, and cinematic effects.

---

## Available Camera Types

```typescript
// Source: code/mod/index.d.ts:221-225
export enum Cameras {
    FirstPerson,   // Standard FPS view
    Free,          // Free camera (spectator/cinematic)
    ThirdPerson,   // Third-person over-the-shoulder view
}
```

---

## Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `SetCameraTypeForAll` | `(cameraType: Cameras): void` | Set camera for all players |
| `SetCameraTypeForAll` | `(cameraType: Cameras, cameraIndex: number): void` | Set camera for all with index |
| `SetCameraTypeForPlayer` | `(player: Player, cameraType: Cameras): void` | Set camera for specific player |
| `SetCameraTypeForPlayer` | `(player: Player, cameraType: Cameras, cameraIndex: number): void` | Set camera with index |

---

## Working Code

### Basic Camera Assignment

```typescript
// Set first-person for a player
mod.SetCameraTypeForPlayer(player, mod.Cameras.FirstPerson);

// Set third-person for a player
mod.SetCameraTypeForPlayer(player, mod.Cameras.ThirdPerson);

// Set free camera for a player
mod.SetCameraTypeForPlayer(player, mod.Cameras.Free);

// Set camera for all players
mod.SetCameraTypeForAll(mod.Cameras.ThirdPerson);
```

### Third-Person Mode on Deploy (from Skirmish)

```typescript
// Source: mods/Skirmish/Skirmish.ts:370-374
export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    const playerProfile = PlayerProfile.Get(eventPlayer);

    if (GC.thirdPersonMode && playerProfile && !playerProfile.hasSetThirdPersonView) {
        mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson);
        playerProfile.hasSetThirdPersonView = true;
    }
}
```

### ADS Toggle System (from Skirmish)

Switch between third-person and first-person when aiming down sights:

```typescript
// Source: mods/Skirmish/Skirmish.ts:71-90
class PlayerProfile {
    isADS: boolean = false;
    // ... other properties
}

function UpdateADS() {
    PlayerProfile.playerInstances.forEach((player: mod.Player) => {
        let pp = PlayerProfile.Get(player);

        if (pp && mod.IsPlayerValid(player) && mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) {
            // Check if player is zooming/aiming
            if (mod.GetSoldierState(player, mod.SoldierStateBool.IsZooming)) {
                if (pp.isADS == false) {
                    // Switch to first-person when aiming
                    mod.SetCameraTypeForPlayer(player, mod.Cameras.FirstPerson);
                    pp.isADS = true;
                }
            }
            else {
                if (pp.isADS == true) {
                    // Return to third-person when not aiming
                    mod.SetCameraTypeForPlayer(player, mod.Cameras.ThirdPerson);
                    pp.isADS = false;
                }
            }
        }
    });
}

// Call this from OngoingGlobal or a timer
export function OngoingGlobal(): void {
    UpdateADS();
}
```

### Spectator Mode (from Skirmish)

```typescript
// Source: mods/Skirmish/Skirmish.ts:540-546
const SpectateMap = new Map<mod.Player, mod.Player>();

function SetSpectateTarget(spectator: mod.Player, target: mod.Player) {
    SpectateMap.set(spectator, target);
    // Set up spectate camera following target
    // (Additional spectate setup would go here)
}

function ClearSpectate(player: mod.Player) {
    // Return player to first-person when no targets available
    mod.SetCameraTypeForPlayer(player, mod.Cameras.FirstPerson);
    SpectateMap.delete(player);
}

function UpdateSpectatorCamera(player: mod.Player) {
    // Get alive players to spectate
    const alivePlayers = getAlivePlayers();

    if (alivePlayers.length > 0) {
        SetSpectateTarget(player, alivePlayers[0]);
    } else {
        // No valid targets, reset to first-person
        mod.SetCameraTypeForPlayer(player, mod.Cameras.FirstPerson);
        SpectateMap.delete(player);
    }
}
```

### Cinematic Camera Sequence

```typescript
async function PlayCinematicIntro(): Promise<void> {
    // Set all players to free camera for intro
    mod.SetCameraTypeForAll(mod.Cameras.Free);

    // Wait for cinematic duration
    await mod.Wait(5);

    // Return to first-person
    mod.SetCameraTypeForAll(mod.Cameras.FirstPerson);
}
```

### Vehicle Exit Camera Reset

```typescript
export function OnPlayerExitVehicle(
    eventPlayer: mod.Player,
    eventVehicle: mod.Vehicle
): void {
    // Ensure player is in correct camera mode after exiting vehicle
    if (GC.thirdPersonMode) {
        mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.ThirdPerson);
    } else {
        mod.SetCameraTypeForPlayer(eventPlayer, mod.Cameras.FirstPerson);
    }
}
```

---

## Camera Index Parameter

The optional `cameraIndex` parameter allows selection of specific camera configurations when multiple exist:

```typescript
// Set camera with specific index
mod.SetCameraTypeForPlayer(player, mod.Cameras.Free, 0);
mod.SetCameraTypeForAll(mod.Cameras.ThirdPerson, 1);
```

The exact behavior of camera indices depends on map/mode configuration.

---

## Constraints & Gotchas

1. **Player Must Be Valid**: Always check player validity:
   ```typescript
   if (mod.IsPlayerValid(player)) {
       mod.SetCameraTypeForPlayer(player, mod.Cameras.ThirdPerson);
   }
   ```

2. **Alive State Matters**: Camera changes work best on living players. Check state:
   ```typescript
   if (mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) {
       mod.SetCameraTypeForPlayer(player, mod.Cameras.ThirdPerson);
   }
   ```

3. **ADS Override**: In third-person mode, you may want first-person for aiming. Use `IsZooming` state to detect:
   ```typescript
   mod.GetSoldierState(player, mod.SoldierStateBool.IsZooming)
   ```

4. **Persistence**: Camera mode persists until changed. Set it again on respawn if needed.

5. **Free Camera Control**: The Free camera mode may have limited player control - test behavior in-game.

6. **Vehicle Cameras**: Vehicle seats may have their own camera behavior that overrides your settings.

---

## Use Cases

- **Third-person shooter mode** - Alternative gameplay perspective
- **Spectator system** - Dead players watch alive teammates
- **Cinematic sequences** - Free camera for intros/outros
- **ADS toggle** - First-person aiming in third-person mode
- **Photo mode** - Free camera for screenshots

---

## Integration with Other Patterns

- [spawning.md](spawning.md) - Set camera on player deploy
- [../gameplay/rounds.md](../gameplay/rounds.md) - Change camera between phases
- [../core/state-management.md](../core/state-management.md) - Track camera state per player
