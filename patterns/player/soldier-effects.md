# Pattern: Soldier Effects

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: code/mod/index.d.ts:21480-21483, 22683

---

## Overview

Soldier effects apply status conditions to players that affect their soldier's state. These are gameplay-affecting conditions like freeze and heat status effects.

---

## Available Effects

```typescript
// Source: code/mod/index.d.ts:21480-21483
export enum SoldierEffects {
    FreezeStatusEffect,  // Freezing/cold status
    HeatStatusEffect,    // Heat/burning status
}
```

---

## Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `SetSoldierEffect` | `(player: Player, soldierEffects: SoldierEffects, isEnabled: boolean): void` | Apply or remove a status effect |

---

## Working Code

### Apply Soldier Effect

```typescript
// Apply freeze status to a player
mod.SetSoldierEffect(player, mod.SoldierEffects.FreezeStatusEffect, true);

// Apply heat status to a player
mod.SetSoldierEffect(player, mod.SoldierEffects.HeatStatusEffect, true);
```

### Remove Soldier Effect

```typescript
// Remove freeze effect
mod.SetSoldierEffect(player, mod.SoldierEffects.FreezeStatusEffect, false);

// Remove heat effect
mod.SetSoldierEffect(player, mod.SoldierEffects.HeatStatusEffect, false);
```

### Environmental Hazard Pattern

```typescript
// Apply freeze effect when player enters cold zone
export function OnPlayerEnterAreaTrigger(
    eventPlayer: mod.Player,
    eventAreaTrigger: mod.AreaTrigger
): void {
    const triggerId = mod.GetObjId(eventAreaTrigger);

    // Assuming ObjId 10 is the freeze zone
    if (triggerId === 10) {
        mod.SetSoldierEffect(eventPlayer, mod.SoldierEffects.FreezeStatusEffect, true);
    }

    // Assuming ObjId 11 is the heat zone
    if (triggerId === 11) {
        mod.SetSoldierEffect(eventPlayer, mod.SoldierEffects.HeatStatusEffect, true);
    }
}

export function OnPlayerExitAreaTrigger(
    eventPlayer: mod.Player,
    eventAreaTrigger: mod.AreaTrigger
): void {
    const triggerId = mod.GetObjId(eventAreaTrigger);

    // Clear freeze effect when leaving cold zone
    if (triggerId === 10) {
        mod.SetSoldierEffect(eventPlayer, mod.SoldierEffects.FreezeStatusEffect, false);
    }

    // Clear heat effect when leaving heat zone
    if (triggerId === 11) {
        mod.SetSoldierEffect(eventPlayer, mod.SoldierEffects.HeatStatusEffect, false);
    }
}
```

### Temporary Effect with Duration

```typescript
async function ApplyTemporarySoldierEffect(
    player: mod.Player,
    effect: mod.SoldierEffects,
    durationSeconds: number
): Promise<void> {
    // Apply the effect
    mod.SetSoldierEffect(player, effect, true);

    // Wait for duration
    await mod.Wait(durationSeconds);

    // Remove effect if player still valid and alive
    if (mod.IsPlayerValid(player) && mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) {
        mod.SetSoldierEffect(player, effect, false);
    }
}

// Usage: Apply freeze for 5 seconds
ApplyTemporarySoldierEffect(player, mod.SoldierEffects.FreezeStatusEffect, 5);
```

### Clear All Effects on Death

```typescript
export function OnPlayerDied(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    // Clear any status effects on death
    mod.SetSoldierEffect(eventPlayer, mod.SoldierEffects.FreezeStatusEffect, false);
    mod.SetSoldierEffect(eventPlayer, mod.SoldierEffects.HeatStatusEffect, false);
}
```

### Damage-Based Effect Application

```typescript
export function OnPlayerDamaged(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDamageType: mod.DamageType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    // Apply heat effect when damaged by certain sources
    // (You would need to check damage type or weapon for specific conditions)
    // This is a pattern example - actual damage type checking may vary
}
```

### Weapon-Based Heat Effect

```typescript
// Track players using incendiary weapons and apply heat to their targets
const incendiaryWeapons = new Set([
    mod.Gadgets.Throwable_Incendiary_Grenade,
    // Add other incendiary weapons
]);

export function OnPlayerDamaged(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDamageType: mod.DamageType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    // Apply heat effect to damaged player
    // (Pattern example - specific weapon checking logic would go here)
    ApplyTemporarySoldierEffect(eventPlayer, mod.SoldierEffects.HeatStatusEffect, 3);
}
```

---

## Constraints & Gotchas

1. **Limited Effects**: Only `FreezeStatusEffect` and `HeatStatusEffect` are available.

2. **Player Must Be Alive**: Effects are applied to living soldiers:
   ```typescript
   if (mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) {
       mod.SetSoldierEffect(player, mod.SoldierEffects.FreezeStatusEffect, true);
   }
   ```

3. **Check Player Validity**: Always verify player is valid:
   ```typescript
   if (mod.IsPlayerValid(player)) {
       mod.SetSoldierEffect(player, effect, true);
   }
   ```

4. **Persistence**: Effects persist until explicitly removed or player dies/respawns.

5. **Visual Feedback Unknown**: The exact visual/gameplay effects (movement slow, damage over time, etc.) are SDK-defined but not documented. Test in-game.

6. **No Intensity Parameter**: Unlike some effects systems, you can only toggle on/off, not set intensity levels.

---

## Use Cases

- **Environmental hazards** - Cold zones, fire areas
- **Ability effects** - Freeze grenades, incendiary weapons
- **Map mechanics** - Dynamic weather effects
- **Game mode features** - Survival modes with environmental dangers
- **Status ailments** - Temporary debuffs

---

## Integration with Other Patterns

- [screen-effects.md](screen-effects.md) - Visual screen effects
- [../spatial/area-triggers.md](../spatial/area-triggers.md) - Trigger effects on area entry
- [../spatial/vfx.md](../spatial/vfx.md) - Visual effects for hazard zones
