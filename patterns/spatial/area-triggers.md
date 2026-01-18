# Pattern: Area Triggers

> **SDK Version**: 1.1.3.0 (Battlefield 6)
> **Source**: mods/Custom Rush V2.0 (spatial analysis), code/mod/index.d.ts

---

## Overview

AreaTriggers are event-driven spatial volumes that detect player entry and exit. Unlike polling-based boundary checks (see [boundaries.md](../gameplay/boundaries.md)), AreaTriggers fire events automatically when players cross their boundaries.

**Use cases**:
- Out-of-bounds detection per sector
- Objective zones (capture areas, interact zones)
- Trigger-based events (cutscenes, spawns, VO)
- Dynamic play area boundaries

---

## Spatial Structure

AreaTriggers are defined in Godot and linked to a PolygonVolume that defines their shape:

```
Sector1 (ObjId: 101)
├── PolygonVolume1 (defines sector shape)
│   ├── points: PackedVector2Array(...)
│   └── height: 40.0
└── AreaTrigger (ObjId: 601)
    └── Area: NodePath("../PolygonVolume1")  // Links to shape
```

### Spatial JSON Example

```json
{
    "name": "AreaTrigger1",
    "ObjId": 601,
    "Area": "Sector1/SectorArea1",
    "type": "AreaTrigger",
    "position": { "x": -189.73, "y": 87.24, "z": 17.96 },
    "id": "Sector1/AreaTrigger1",
    "linked": ["Area"]
}
```

The `Area` property references a PolygonVolume that defines the trigger's 2D footprint and height.

---

## SDK Types & Functions

### Type

```typescript
type AreaTrigger = { _opaque: typeof AreaTriggerSymbol };
```

### Core Functions

```typescript
// Get AreaTrigger by ObjId
mod.GetAreaTrigger(areaTriggerNumber: number): AreaTrigger;

// Enable or disable the trigger (disabled triggers don't fire events)
mod.EnableAreaTrigger(areaTrigger: AreaTrigger, enable: boolean): void;
```

### Events

```typescript
// Fires when a player enters the AreaTrigger volume
export function OnPlayerEnterAreaTrigger(
    eventPlayer: mod.Player,
    eventAreaTrigger: mod.AreaTrigger
): void;

// Fires when a player exits the AreaTrigger volume
export function OnPlayerExitAreaTrigger(
    eventPlayer: mod.Player,
    eventAreaTrigger: mod.AreaTrigger
): void;

// Iterator for all AreaTriggers
export function OngoingAreaTrigger(eventAreaTrigger: mod.AreaTrigger): void;
```

---

## Implementation Pattern

### Basic Setup

```typescript
class AreaTriggerManager {
    // Cache triggers by purpose
    static sectorTriggers: mod.AreaTrigger[] = [];
    static oobTrigger: mod.AreaTrigger | null = null;

    static Initialize() {
        // Load sector AreaTriggers (ObjIds 600-605)
        for (let i = 0; i <= 5; i++) {
            const trigger = mod.GetAreaTrigger(600 + i);
            this.sectorTriggers.push(trigger);

            // Disable all initially
            mod.EnableAreaTrigger(trigger, false);
        }
    }

    static EnableSectorTrigger(sectorNum: number) {
        // Disable previous
        this.sectorTriggers.forEach(t => mod.EnableAreaTrigger(t, false));

        // Enable current
        mod.EnableAreaTrigger(this.sectorTriggers[sectorNum], true);
    }
}
```

### Event Handlers

```typescript
// Track players currently out of bounds
const playersOoB: Map<number, boolean> = new Map();

export function OnPlayerEnterAreaTrigger(
    eventPlayer: mod.Player,
    eventAreaTrigger: mod.AreaTrigger
) {
    const playerId = mod.GetObjId(eventPlayer);
    const triggerId = mod.GetObjId(eventAreaTrigger);

    // Check if this is the active sector trigger
    const activeTrigger = AreaTriggerManager.sectorTriggers[currentSector];
    if (triggerId === mod.GetObjId(activeTrigger)) {
        // Player entered play area - cancel OoB timer
        playersOoB.set(playerId, false);
        CancelOoBCountdown(eventPlayer);

        console.log(`Player ${playerId} entered sector ${currentSector}`);
    }
}

export function OnPlayerExitAreaTrigger(
    eventPlayer: mod.Player,
    eventAreaTrigger: mod.AreaTrigger
) {
    const playerId = mod.GetObjId(eventPlayer);
    const triggerId = mod.GetObjId(eventAreaTrigger);

    // Check if this is the active sector trigger
    const activeTrigger = AreaTriggerManager.sectorTriggers[currentSector];
    if (triggerId === mod.GetObjId(activeTrigger)) {
        // Player left play area - start OoB countdown
        playersOoB.set(playerId, true);
        StartOoBCountdown(eventPlayer);

        console.log(`Player ${playerId} left sector ${currentSector}`);
    }
}
```

---

## Out-of-Bounds Pattern

AreaTriggers enable cleaner OoB handling than position polling:

```typescript
class OoBManager {
    static readonly OOB_WARNING_TIME = 10;  // seconds before death
    static oobTimers: Map<number, number> = new Map();

    static async StartOoBCountdown(player: mod.Player) {
        const playerId = mod.GetObjId(player);

        // Show warning UI
        mod.DisplayNotificationMessage(
            mod.Message("OOB_WARNING"),
            player
        );

        // Start countdown
        this.oobTimers.set(playerId, this.OOB_WARNING_TIME);

        while (this.oobTimers.get(playerId)! > 0) {
            await mod.Wait(1);

            // Check if player returned to bounds
            if (!playersOoB.get(playerId)) {
                this.oobTimers.delete(playerId);
                return;
            }

            // Check if player is still valid
            if (!mod.IsPlayerValid(player)) {
                this.oobTimers.delete(playerId);
                return;
            }

            // Decrement timer
            const remaining = this.oobTimers.get(playerId)! - 1;
            this.oobTimers.set(playerId, remaining);

            // Update UI with countdown
            // (implementation depends on UI pattern)
        }

        // Timer expired - kill player
        if (mod.IsPlayerValid(player) && playersOoB.get(playerId)) {
            mod.SkipManDown(player, true);
            mod.Kill(player);
        }
    }

    static CancelOoBCountdown(player: mod.Player) {
        const playerId = mod.GetObjId(player);
        this.oobTimers.delete(playerId);

        // Hide warning UI
        // (implementation depends on UI pattern)
    }
}
```

---

## Comparing Boundary Methods

| Method | Pros | Cons |
|--------|------|------|
| **AreaTrigger (event-driven)** | Precise boundaries, no polling overhead, supports complex shapes | Requires Godot setup, limited to PolygonVolume shapes |
| **Y-Coordinate (polling)** | Simple, no Godot setup | Only horizontal plane, requires continuous loop |
| **Distance-based (polling)** | Good for circular zones | Requires continuous loop, only simple shapes |

**Recommendation**: Use AreaTriggers for sector boundaries and complex zones. Use Y-coordinate checks for fall-off-map detection.

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `GetAreaTrigger` | `(number): AreaTrigger` | Get trigger by ObjId |
| `EnableAreaTrigger` | `(areaTrigger, enable): void` | Enable/disable event firing |

---

## Constraints & Gotchas

1. **Disabled triggers don't fire**: `EnableAreaTrigger(trigger, false)` completely disables the trigger - no enter/exit events.

2. **Initial state unknown**: When enabling a trigger, you don't know if players are already inside. Consider a brief position check on activation.

3. **Vehicle handling**: AreaTriggers detect the player, not their vehicle. A player inside a vehicle will still trigger enter/exit events.

4. **Height matters**: PolygonVolumes have a `height` property. Players above or below the volume won't trigger events.

5. **Object equality**: Always use `mod.GetObjId()` to compare triggers:
   ```typescript
   if (mod.GetObjId(eventAreaTrigger) === mod.GetObjId(targetTrigger)) { ... }
   ```

6. **Multiple triggers**: A player can be inside multiple AreaTriggers simultaneously. Track state per-trigger if needed.

---

## Godot Setup Notes

*Detailed Godot setup will be covered in a future spatial editing guide.*

Basic structure in Godot:
1. Create a `Sector` node
2. Add a `PolygonVolume` child with 2D points and height
3. Add an `AreaTrigger` child and link its `Area` property to the PolygonVolume
4. Assign unique ObjIds to both Sector and AreaTrigger

---

## Related Patterns

- [Sectors](../gameplay/sectors.md) - Sector progression using AreaTriggers
- [Boundaries](../gameplay/boundaries.md) - Alternative polling-based approach
- [MCOMs](../gameplay/mcoms.md) - Objectives within triggered zones
