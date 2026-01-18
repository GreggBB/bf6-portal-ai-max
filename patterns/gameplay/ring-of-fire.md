# Pattern: Ring of Fire (BR Shrinking Zone)

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/Skirmish/Skirmish.ts:3008-3260

---

## Overview

The Ring of Fire is Portal's built-in shrinking zone mechanic for Battle Royale modes. It damages players outside the safe area and progressively shrinks to force encounters. Portal provides both a native `RingOfFire` object and the ability to implement custom ring logic.

---

## Core Concepts

### Native Ring of Fire

The SDK provides a `RingOfFire` object that handles:
- Visual ring boundary display
- Automatic shrinking behavior
- Zone size change events

### Custom Ring Implementation

For more control, you can implement your own ring logic that:
- Tracks ring position and radius
- Applies damage to players outside the zone
- Controls shrink timing and speed

---

## Working Code

### Using the Native RingOfFire Object

```typescript
// Source: mods/Skirmish/Skirmish.ts:3060-3080

// Get the RingOfFire object (placed in Godot editor with ID 1)
const ringOfFireObjectID = 1;
const ringOfFire = mod.GetRingOfFire(ringOfFireObjectID);

// Start the ring shrinking sequence
mod.RingOfFireStart(ringOfFire);

// Configure the ring damage (damage per tick to players outside)
mod.SetRingOfFireDamageAmount(ringOfFire, 900);

// Set how long the ring stays stable between shrinks (seconds)
mod.SetRingOfFireStableTime(ringOfFire, 35);

// Stop/remove the ring
mod.UnspawnObject(ringOfFire);
```

### Ring of Fire Controller (Singleton Pattern)

```typescript
// Source: mods/Skirmish/Skirmish.ts:3025-3118
class RingOfFireController {
    private static instance: RingOfFireController;

    #ringOfFireObjectID = 1;

    // Timing arrays for each shrink phase
    static shrinkTime = [35, 35, 35, 35, 35, 35, 35, 35];
    static stableTime = [35, 35, 35, 35, 35, 35, 35, 35];

    static ringOfFireDamage = 900;
    static CurrentRing = 0;
    static Time: number = 35;

    static setTime() {
        this.CurrentRing += 1;
        this.Time = this.shrinkTime[this.CurrentRing % this.shrinkTime.length];
    }

    private constructor() {
        console.log('RingOfFireController instance created!');
    }

    public static getInstance(): RingOfFireController {
        if (!RingOfFireController.instance) {
            RingOfFireController.instance = new RingOfFireController();
        }
        return RingOfFireController.instance;
    }

    public startRing(): void {
        console.log("Starting ring of fire");
        mod.RingOfFireStart(mod.GetRingOfFire(this.#ringOfFireObjectID));
        mod.SetRingOfFireDamageAmount(
            mod.GetRingOfFire(this.#ringOfFireObjectID),
            RingOfFireController.ringOfFireDamage
        );
        this.runShrinkSequence();
    }

    public stopRing(): void {
        mod.UnspawnObject(mod.GetRingOfFire(this.#ringOfFireObjectID));
    }

    public setStableTime(time: number): void {
        mod.SetRingOfFireStableTime(mod.GetRingOfFire(this.#ringOfFireObjectID), time);
    }

    public setDamageAmount(damageAmount: number): void {
        mod.SetRingOfFireDamageAmount(mod.GetRingOfFire(this.#ringOfFireObjectID), damageAmount);
    }

    public async runShrinkSequence() {
        while (true) {
            // Check if we've reached the final ring
            if (RingOfFireController.CurrentRing >= RingOfFireController.shrinkTime.length) {
                // Final ring reached - display message
                return;
            }

            if (RingOfFireController.Time > 0) {
                RingOfFireController.Time -= 0.1;

                if (RingOfFireController.Time > 0) {
                    // Update UI with countdown
                    const formattedTime = formatTime(RingOfFireController.Time);
                    // Update timer display...
                }
            }

            await mod.Wait(0.1);
        }
    }
}

// Usage
const controller = RingOfFireController.getInstance();
controller.startRing();
```

### Ring Zone Size Change Event

```typescript
// Source: mods/Skirmish/Skirmish.ts:3013-3021
// This event fires when the native RingOfFire changes size

export function OnRingOfFireZoneSizeChange(eventRingOfFire: mod.RingOfFire, eventNumber: number) {
    console.log("CurrentRing: " + RingOfFireController.CurrentRing);
    console.log("Time: " + RingOfFireController.Time);
    console.log("Event number: " + eventNumber);

    // Update internal state when ring shrinks
    RingOfFireController.setTime();
}
```

### Custom Ring Implementation (RingOfFireAnalogue)

```typescript
// Source: mods/Skirmish/Skirmish.ts:3121-3260
// Full custom implementation for more control

class RingOfFireAnalogue {
    static timeTilNextShrink: number = 35;
    static baseTimeTilNextShrink: number = 45;
    static safeTimeTillNextShrink: number = 35;

    // Ring sizes for each phase
    static ringRadii: number[] = [300, 150, 75, 37.5, 18.75];

    // Map center point
    static possibleRingFieldOrigin: mod.Vector = mod.CreateVector(-1000.449, 120.386, 279.615);

    static currentRingRadius: number = 300;
    static targetRingRadius: number = 300;
    static currentRingPosition: mod.Vector = mod.CreateVector(0, 0, 0);
    static targetRingPosition: mod.Vector = mod.CreateVector(0, 0, 0);

    static currentRingStage: number = 0;
    static shrinkSpeed: number = 0.5;

    static isShrinking: boolean = false;
    static shrinkComplete: boolean = false;
    static moveComplete: boolean = false;

    static Initialize() {
        this.currentRingRadius = this.ringRadii[0];
        this.currentRingStage = 0;
        this.currentRingPosition = this.GetRandomRingPosition(true);
        this.timeTilNextShrink = this.safeTimeTillNextShrink;
        this.isShrinking = false;
        this.shrinkComplete = false;
        this.moveComplete = false;
        this.Update();
    }

    static async Update() {
        while (GD.roundActive) {
            this.CheckToDamagePlayers();
            this.CheckToShrinkRing();
            await mod.Wait(0.1);
        }
    }

    static async CheckToDamagePlayers() {
        // Filter out invalid players first
        const validPlayers = PlayerProfile.playersInRound.filter(player => {
            try {
                return player && mod.IsPlayerValid(player);
            } catch {
                return false;
            }
        });

        // Check each valid player
        validPlayers.forEach(player => {
            try {
                if (mod.IsPlayerValid(player) &&
                    mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) {

                    const playerPosition = mod.GetSoldierState(
                        player,
                        mod.SoldierStateVector.GetPosition
                    );
                    const distanceFromRing = mod.DistanceBetween(
                        playerPosition,
                        this.currentRingPosition
                    );

                    // Player is outside the ring
                    if (distanceFromRing > this.currentRingRadius) {
                        mod.DealDamage(player, 1);  // Damage per tick
                    }
                }
            } catch (error) {
                console.log(`Error processing player: ${error}`);
            }
        });
    }

    static async CheckToShrinkRing() {
        if (!this.isShrinking && this.currentRingStage < this.ringRadii.length - 1) {
            // Timer countdown
            this.timeTilNextShrink -= 0.1;

            // Update UI with time remaining...
        }

        // Start shrinking when timer reaches zero
        if (!this.isShrinking &&
            this.timeTilNextShrink <= 0 &&
            this.currentRingStage < this.ringRadii.length - 1) {

            this.isShrinking = true;
            this.ShrinkRing();
            this.MoveRing();
            this.currentRingStage++;

        } else if (this.isShrinking && this.shrinkComplete && this.moveComplete) {
            // Reset for next shrink phase
            this.timeTilNextShrink = this.safeTimeTillNextShrink;
            this.isShrinking = false;
            this.shrinkComplete = false;
            this.moveComplete = false;
        }
    }

    static async ShrinkRing() {
        if (this.currentRingStage >= this.ringRadii.length - 1) {
            this.shrinkComplete = true;
            return;
        }

        this.targetRingRadius = this.ringRadii[this.currentRingStage + 1];

        while (true) {
            if ((this.currentRingRadius - this.targetRingRadius) > 2) {
                // Gradually shrink radius
                this.currentRingRadius = lerpConstant(
                    this.currentRingRadius,
                    this.targetRingRadius,
                    this.shrinkSpeed
                );
                await mod.Wait(0.1);
            } else {
                this.shrinkComplete = true;
                break;
            }
        }
    }

    static async MoveRing() {
        this.targetRingPosition = this.GetRandomRingPosition(false);

        while (true) {
            if (mod.DistanceBetween(this.currentRingPosition, this.targetRingPosition) > 2) {
                // Gradually move ring center
                this.currentRingPosition = lerpVectorConstant(
                    this.currentRingPosition,
                    this.targetRingPosition,
                    this.shrinkSpeed
                );
                await mod.Wait(0.1);
            } else {
                this.moveComplete = true;
                break;
            }
        }
    }

    static GetRandomRingPosition(isFirst: boolean): mod.Vector {
        // Generate random position within map bounds
        // First ring can be anywhere, subsequent rings stay within previous ring
        // Implementation depends on map geometry
        return mod.CreateVector(0, 0, 0);
    }
}

// Helper: Linear interpolation with constant speed
function lerpConstant(current: number, target: number, speed: number): number {
    const diff = target - current;
    if (Math.abs(diff) < speed) return target;
    return current + Math.sign(diff) * speed;
}

function lerpVectorConstant(a: mod.Vector, b: mod.Vector, speed: number): mod.Vector {
    return mod.CreateVector(
        lerpConstant(mod.XComponentOf(a), mod.XComponentOf(b), speed),
        lerpConstant(mod.YComponentOf(a), mod.YComponentOf(b), speed),
        lerpConstant(mod.ZComponentOf(a), mod.ZComponentOf(b), speed)
    );
}
```

### Integration Example

```typescript
// In OnGameModeStarted
export async function OnGameModeStarted() {
    // Initialize teams, players, etc.

    // Option 1: Use native Ring of Fire
    const controller = RingOfFireController.getInstance();
    controller.startRing();

    // Option 2: Use custom implementation
    // RingOfFireAnalogue.Initialize();
}

// Clean up when round ends
async function EndRound() {
    // Stop the ring
    RingOfFireController.getInstance().stopRing();
    // or: RingOfFireAnalogue clear/stop
}
```

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `GetRingOfFire` | `(number: number): RingOfFire` | Get ring object by ID |
| `RingOfFireStart` | `(ringOfFire: RingOfFire): void` | Start the shrinking sequence |
| `SetRingOfFireDamageAmount` | `(ringOfFire: RingOfFire, damage: number): void` | Set damage to players outside |
| `SetRingOfFireStableTime` | `(ringOfFire: RingOfFire, time: number): void` | Set time between shrinks |
| `UnspawnObject` | `(object: Object): void` | Remove ring from world |
| `DealDamage` | `(player: Player, amount: number): void` | Apply damage to player |
| `DistanceBetween` | `(a: Vector, b: Vector): number` | Calculate distance |
| `GetSoldierState` | `(player: Player, state: SoldierStateVector.GetPosition): Vector` | Get player position |
| `GetSoldierState` | `(player: Player, state: SoldierStateBool.IsAlive): boolean` | Check if player alive |

### Event Hooks

```typescript
// Fires when native RingOfFire changes size
export function OnRingOfFireZoneSizeChange(
    eventRingOfFire: mod.RingOfFire,
    eventNumber: number
): void;
```

---

## Native vs Custom Implementation

| Aspect | Native RingOfFire | Custom (Analogue) |
|--------|-------------------|-------------------|
| **Visual** | Built-in ring display | Must create own visuals |
| **Damage** | Automatic | Manual per-player checks |
| **Shrinking** | Pre-configured behavior | Full control over timing |
| **Movement** | Fixed center | Can move ring center |
| **Setup** | Place in Godot, configure | Code-only implementation |
| **Events** | OnRingOfFireZoneSizeChange | Custom event handling |

---

## Constraints & Gotchas

1. **Ring Object Persistence**: The native RingOfFire cannot be stopped mid-round easily - once started, it continues. Skirmish uses single-round mode for this reason:
   ```typescript
   static maxRounds: number = 1; // Cannot shut down RingOfFire between rounds
   ```

2. **Player Validity**: Always check player validity before damage:
   ```typescript
   if (mod.IsPlayerValid(player) &&
       mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) {
       // Safe to check position and deal damage
   }
   ```

3. **Damage Tick Rate**: For custom implementation, damage is applied per update tick (0.1s). Adjust damage amount accordingly.

4. **Godot Setup**: Native RingOfFire requires placing the object in Godot editor with a specific ID.

5. **Ring Event Timing**: `OnRingOfFireZoneSizeChange` fires after the ring finishes shrinking, not during.

---

## Integration with Other Patterns

- **Loot System** (`patterns/gameplay/loot-system.md`): Coordinate loot density with ring stages
- **Multi-Team** (`patterns/player/multi-team.md`): Track surviving teams within ring
- **Spawning** (`patterns/player/spawning.md`): Spawn players within current ring
- **World Icons** (`patterns/spatial/world-icons.md`): Mark ring center/boundaries
