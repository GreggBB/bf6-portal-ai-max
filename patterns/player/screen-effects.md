# Pattern: Screen Effects

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: code/mod/index.d.ts:21469-21472, 22491-22494

---

## Overview

Screen effects apply visual post-processing filters to a player's view. These are player-specific effects that can enhance or alter how the game appears.

**Note**: `GetScreenEffect` is deprecated according to the SDK comments.

---

## Available Effects

```typescript
// Source: code/mod/index.d.ts:21469-21472
export enum ScreenEffects {
    Saturated,  // Increased color saturation
    Stealth,    // Reduced visibility/stealth visual mode
}
```

---

## Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `EnableScreenEffect` | `(player: Player, screenEffect: ScreenEffects, enable: boolean): void` | Enable/disable a screen effect for a player |
| `GetScreenEffect` | `(number: number): ScreenEffect` | **Deprecated** - Get screen effect by ID |

---

## Working Code

### Enable Screen Effect

```typescript
// Apply saturated view to a player
mod.EnableScreenEffect(player, mod.ScreenEffects.Saturated, true);

// Apply stealth visual mode
mod.EnableScreenEffect(player, mod.ScreenEffects.Stealth, true);
```

### Disable Screen Effect

```typescript
// Remove the saturated effect
mod.EnableScreenEffect(player, mod.ScreenEffects.Saturated, false);

// Remove stealth effect
mod.EnableScreenEffect(player, mod.ScreenEffects.Stealth, false);
```

### Apply Effect on Deploy

```typescript
export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    // Apply visual effect when player spawns
    mod.EnableScreenEffect(eventPlayer, mod.ScreenEffects.Saturated, true);
}
```

### Temporary Effect Pattern

```typescript
async function ApplyTemporaryEffect(
    player: mod.Player,
    effect: mod.ScreenEffects,
    durationSeconds: number
): Promise<void> {
    // Enable the effect
    mod.EnableScreenEffect(player, effect, true);

    // Wait for duration
    await mod.Wait(durationSeconds);

    // Disable if player still valid
    if (mod.IsPlayerValid(player)) {
        mod.EnableScreenEffect(player, effect, false);
    }
}

// Usage
ApplyTemporaryEffect(player, mod.ScreenEffects.Stealth, 10);
```

### Class-Based Effect System

```typescript
// Apply stealth effect for recon class
export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    const soldierClass = mod.GetSoldierState(eventPlayer, mod.SoldierStateEnum.GetSoldierClass);

    if (soldierClass === mod.SoldierClass.Recon) {
        // Recon gets stealth visual
        mod.EnableScreenEffect(eventPlayer, mod.ScreenEffects.Stealth, true);
    }
}
```

### Toggle Effect on Death/Respawn

```typescript
export function OnPlayerDied(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    // Clear effects on death
    mod.EnableScreenEffect(eventPlayer, mod.ScreenEffects.Saturated, false);
    mod.EnableScreenEffect(eventPlayer, mod.ScreenEffects.Stealth, false);
}
```

---

## Constraints & Gotchas

1. **Player-Specific**: Each effect is applied per-player. There's no global screen effect function.

2. **Limited Effects**: Only `Saturated` and `Stealth` are available in the enum. Other visual effects may need VFX or other systems.

3. **Persistence**: Effects persist until explicitly disabled or the player leaves.

4. **Check Player Validity**: Always verify player is valid before operations:
   ```typescript
   if (mod.IsPlayerValid(player)) {
       mod.EnableScreenEffect(player, mod.ScreenEffects.Saturated, false);
   }
   ```

5. **GetScreenEffect is Deprecated**: Don't rely on `GetScreenEffect` - use the enum values directly.

6. **No Intensity Control**: You can only enable/disable, not adjust intensity or parameters.

---

## Use Cases

- **Stealth gameplay** - Visual indicator for stealth mode
- **Power-up effects** - Temporary visual enhancement
- **Class abilities** - Class-specific visual modes
- **Game state indicators** - Different visuals for different phases
- **Damage feedback** - Could combine with damage events (though VFX may be better)

---

## Integration with Other Patterns

- [soldier-effects.md](soldier-effects.md) - Status effects affecting soldiers
- [../gameplay/rounds.md](../gameplay/rounds.md) - Apply effects during specific phases
- [../spatial/vfx.md](../spatial/vfx.md) - World-space visual effects
