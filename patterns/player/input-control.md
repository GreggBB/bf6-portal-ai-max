# Pattern: Input Control

> **SDK Version**: 1.1.3.0 (Battlefield 6)
> **Source**: mods/BumperCars/BumperCars.ts:34,1104-1116, mods/AcePursuit/AcePursuit.ts:343-376,631-651

---

## Overview

Input restrictions allow you to prevent players from performing specific actions. This is essential for:
- Countdown freezes (lock all movement before race starts)
- Vehicle-only modes (prevent weapon firing or dismounting)
- Catchup mechanics (disable sprint for leading players)
- Cutscenes or scripted sequences

---

## Core Functions

### Lock All Inputs

```typescript
// Lock all player inputs
mod.EnableAllInputRestrictions(player, true);

// Unlock all player inputs
mod.EnableAllInputRestrictions(player, false);
```

### Lock Specific Input

```typescript
// Disable a specific input
mod.EnableInputRestriction(player, mod.RestrictedInputs.FireWeapon, true);

// Re-enable that input
mod.EnableInputRestriction(player, mod.RestrictedInputs.FireWeapon, false);
```

---

## Working Code

### Countdown Freeze (AcePursuit pattern)

Lock all inputs during countdown, then release when race starts:

```typescript
async StartGame() {
    // Lock everyone before countdown
    for (const playerProfile of this.playersInRace) {
        if (mod.IsPlayerValid(playerProfile.player) &&
            mod.GetSoldierState(playerProfile.player, mod.SoldierStateBool.IsAlive)) {
            mod.EnableAllInputRestrictions(playerProfile.player, true);
        }
    }

    // Show countdown UI
    await this.RaceStartCountdown();

    // Release everyone
    for (const playerProfile of this.playersInRace) {
        if (mod.IsPlayerValid(playerProfile.player) &&
            mod.GetSoldierState(playerProfile.player, mod.SoldierStateBool.IsAlive)) {
            mod.EnableAllInputRestrictions(playerProfile.player, false);
        }
    }
}
```

### Disable Weapon Fire (BumperCars pattern)

Prevent players from firing weapons (e.g., vehicle-only mode):

```typescript
export function OnPlayerDeployed(eventPlayer: mod.Player) {
    // Remove weapons
    mod.RemoveEquipment(eventPlayer, mod.InventorySlots.MeleeWeapon);
    mod.RemoveEquipment(eventPlayer, mod.InventorySlots.PrimaryWeapon);
    mod.RemoveEquipment(eventPlayer, mod.InventorySlots.SecondaryWeapon);

    // Also block firing input as extra safety
    mod.EnableInputRestriction(eventPlayer, mod.RestrictedInputs.FireWeapon, true);
}
```

### Batch Restrict/Unrestrict (BumperCars pattern)

Helper methods for applying restrictions to all players:

```typescript
class PlayerManager {
    static async RestrictAllInputs(enabled: boolean) {
        for (const player of this.GetAvailablePlayers()) {
            mod.EnableAllInputRestrictions(player, enabled);
        }
    }

    static async RestrictWeaponFire(enabled: boolean) {
        for (const player of this.GetAvailablePlayers()) {
            mod.EnableInputRestriction(player, mod.RestrictedInputs.FireWeapon, enabled);
        }
    }
}
```

### Catchup Mechanic - Disable Sprint (AcePursuit pattern)

Disable sprint for leading players to help trailing players catch up:

```typescript
function updateCatchupMechanic(playersInRace: PlayerProfile[]) {
    if (playersInRace.length < 2) {
        // Only one player - no catchup needed
        const solo = playersInRace[0];
        if (solo && solo.sprintDisabled) {
            mod.EnableInputRestriction(solo.player, mod.RestrictedInputs.Sprint, false);
            solo.sprintDisabled = false;
        }
        return;
    }

    // Calculate how many players should have sprint disabled (top 30%)
    const disableCount = Math.max(1, Math.ceil(playersInRace.length * 0.3));

    // Players array is sorted by race position (leader first)
    for (let i = 0; i < playersInRace.length; i++) {
        const disableSprint = i < disableCount;  // First N players get restricted
        mod.EnableInputRestriction(playersInRace[i].player, mod.RestrictedInputs.Sprint, disableSprint);
        playersInRace[i].sprintDisabled = disableSprint;
    }
}
```

---

## Available RestrictedInputs

```typescript
enum RestrictedInputs {
    CameraPitch,           // Vertical camera movement
    CameraYaw,             // Horizontal camera movement
    Crouch,                // Crouch action
    CycleFire,             // Cycle fire mode
    CyclePrimary,          // Cycle primary weapon
    FireWeapon,            // Fire/shoot
    Interact,              // Interact with objects
    Jump,                  // Jump action
    MoveForwardBack,       // Forward/backward movement
    MoveLeftRight,         // Strafe movement
    Prone,                 // Go prone
    Reload,                // Reload weapon
    SelectCharacterGadget, // Select character gadget
    SelectMelee,           // Select melee weapon
    SelectOpenGadget,      // Select open gadget
    SelectPrimary,         // Select primary weapon
    SelectSecondary,       // Select secondary weapon
    SelectThrowable,       // Select throwable
    Sprint,                // Sprint action
    Zoom,                  // Aim down sights / zoom
}
```

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `EnableAllInputRestrictions` | `(player: Player, restrictInput: boolean): void` | Lock or unlock all inputs for a player |
| `EnableInputRestriction` | `(player: Player, inputRestriction: RestrictedInputs, restrictInput: boolean): void` | Lock or unlock a specific input |

---

## Common Use Cases

| Use Case | Inputs to Restrict |
|----------|-------------------|
| Countdown freeze | `EnableAllInputRestrictions(player, true)` |
| No shooting | `RestrictedInputs.FireWeapon` |
| No sprinting (catchup) | `RestrictedInputs.Sprint` |
| No jumping | `RestrictedInputs.Jump` |
| No reloading | `RestrictedInputs.Reload` |
| Stationary cutscene | `MoveForwardBack`, `MoveLeftRight`, `CameraPitch`, `CameraYaw` |
| Vehicle-only mode | `FireWeapon`, `SelectPrimary`, `SelectSecondary`, `SelectMelee` |

---

## Constraints & Gotchas

1. **Validity Check**: Always check `mod.IsPlayerValid(player)` before applying restrictions. Invalid players will cause errors.

2. **Alive Check**: Consider checking `mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)` - dead players may not need restrictions.

3. **Persistence**: Restrictions persist until explicitly removed. Remember to unlock on respawn/deploy if needed.

4. **All vs Specific**: `EnableAllInputRestrictions` is a master lock. After unlocking all, individual restrictions you set with `EnableInputRestriction` are still in effect.

5. **Vehicle Context**: In vehicles, some inputs may not apply. Test in your specific vehicle context.

6. **Player Disconnect**: Restrictions are cleared when a player disconnects. No cleanup needed.
