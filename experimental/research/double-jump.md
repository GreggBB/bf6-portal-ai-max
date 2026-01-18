# Experimental Movement Mechanics Research

> **Research Topic**: Custom movement mechanics beyond SDK defaults
> **Example Use Case**: Double jump, wall running, enhanced mobility
> **Status**: Research Complete
> **Last Updated**: 2026-01-18

---

## Problem Statement

The Battlefield Portal SDK provides limited direct control over player movement. The primary documented lever is **player speed** via `mod.SetPlayerMovementSpeedMultiplier()`. However, users may want mechanics like:

- Double jump
- Wall running
- Grappling hooks
- Dash/dodge abilities
- Jetpack/hover
- Super jump

This research explores what's possible within SDK constraints.

---

## Research Questions

1. What player movement functions exist in the SDK?
2. Can we manipulate player velocity/position directly?
3. What events can we hook into for movement detection?
4. Are there any vehicle or gadget mechanics we could repurpose?
5. What do existing mods do for movement manipulation?

---

## Executive Summary

**Key Finding**: The SDK does NOT provide direct velocity/impulse manipulation. However, we CAN implement custom movement mechanics like double jump through a combination of:

1. **State Detection** - Robust soldier state queries (`IsJumping`, `IsInAir`, `IsOnGround`)
2. **Input Control** - Enable/disable specific inputs (`RestrictedInputs.Jump`)
3. **Teleportation** - Position manipulation via `Teleport()`
4. **Polling Loops** - Frame-by-frame state monitoring via `await mod.Wait()`

**Bottom Line**: Double jump IS achievable. Wall running and grappling hooks would require more creative workarounds.

---

## SDK Analysis

### Movement Functions Inventory

#### Direct Position Manipulation
```typescript
// Teleport - THE primary position manipulation tool
export function Teleport(player: Player, destination: Vector, orientation: number): void;
export function Teleport(vehicle: Vehicle, destination: Vector, orientation: number): void;
// orientation is in RADIANS (0 = east, π/2 = north)

// Object movement (not applicable to players)
export function MoveObject(object: mod.Object, positionDelta: Vector): void;
export function MoveObjectOverTime(object: mod.Object, positionDelta: Vector, time: number, loopCount?: number, reverse?: boolean): void;
```

#### Speed Control
```typescript
export function SetPlayerMovementSpeedMultiplier(player: Player, multiplier: number): void;
// 1.0 = normal, 2.0 = double speed, 0.5 = half speed
```

#### AI Movement (Not for human players)
```typescript
export function AIMoveToBehavior(player: Player, position: Vector): void;
export function AIValidatedMoveToBehavior(player: Player, position: Vector): void;
export function AISetMoveSpeed(player: Player, moveSpeed: MoveSpeed): void;
export function AISetStance(player: Player, stance: Stance): void;

export enum MoveSpeed {
    Walk, InvestigateWalk, InvestigateSlowWalk, InvestigateRun, Patrol, Run, Sprint
}
```

### What's NOT Available

| Desired Function | Status | Workaround |
|-----------------|--------|------------|
| `ApplyForce()` / `ApplyImpulse()` | Does NOT exist | Use Teleport with frame-by-frame position updates |
| `SetVelocity()` | Does NOT exist | Track velocity manually, teleport to simulate |
| `SetGravity()` | Does NOT exist | Implement custom gravity via position tracking |
| `SetJumpHeight()` | Does NOT exist | Disable native jump, implement via teleport |
| `OnPlayerJump` event | Does NOT exist | Poll `IsJumping` state in ongoing loop |
| `OnPlayerLand` event | Does NOT exist | Detect `IsInAir` → `IsOnGround` transition |

---

## Soldier State Detection

### SoldierStateBool - Complete List
```typescript
export enum SoldierStateBool {
    IsAISoldier,          // AI vs human
    IsAlive,              // Alive state
    IsBeingRevived,       // Being revived
    IsCrouching,          // Crouch stance
    IsDead,               // Dead state
    IsFiring,             // Firing weapon
    IsInAir,              // ★ AIRBORNE (key for jump detection)
    IsInteracting,        // Using interact point
    IsInVehicle,          // In vehicle
    IsInWater,            // In water
    IsJumping,            // ★ JUMP INITIATED (brief window)
    IsManDown,            // Downed state
    IsOnGround,           // ★ FEET ON GROUND (key for landing)
    IsParachuting,        // Parachuting
    IsProne,              // Prone stance
    IsReloading,          // Reloading
    IsReviving,           // Reviving someone
    IsSprinting,          // Sprinting
    IsStanding,           // Standing
    IsVaulting,           // Vaulting
    IsZooming,            // Aiming/zoomed
}
```

### SoldierStateVector - Position & Velocity
```typescript
export enum SoldierStateVector {
    EyePosition,          // Camera/head position
    GetFacingDirection,   // Direction facing (normalized)
    GetLinearVelocity,    // ★ CURRENT VELOCITY (X, Y, Z)
    GetPosition,          // ★ WORLD POSITION
}

// Usage
const pos = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
const vel = mod.GetSoldierState(player, mod.SoldierStateVector.GetLinearVelocity);
const yVelocity = mod.YComponentOf(vel); // Vertical velocity
```

### SoldierStateNumber - Speed & Health
```typescript
export enum SoldierStateNumber {
    CurrentHealth,
    CurrentWeaponAmmo,
    CurrentWeaponMagazineAmmo,
    MaxHealth,
    NormalizedHealth,     // 0-1 range
    Speed,                // ★ MOVEMENT SPEED MAGNITUDE
}
```

---

## Input Restriction System

### RestrictedInputs - Complete List
```typescript
export enum RestrictedInputs {
    CameraPitch,          // Up/down look
    CameraYaw,            // Left/right look
    Crouch,               // Crouch
    CycleFire,            // Fire mode
    CyclePrimary,         // Weapon switch
    FireWeapon,           // Shooting
    Interact,             // Interaction
    Jump,                 // ★ JUMP INPUT
    MoveForwardBack,      // Forward/back
    MoveLeftRight,        // Strafe
    Prone,                // Prone
    Reload,               // Reload
    SelectCharacterGadget,
    SelectMelee,
    SelectOpenGadget,
    SelectPrimary,
    SelectSecondary,
    SelectThrowable,
    Sprint,               // Sprint
    Zoom,                 // Aim/scope
}
```

### Control Functions
```typescript
// Lock/unlock ALL inputs
export function EnableAllInputRestrictions(player: Player, restrictInput: boolean): void;

// Lock/unlock SPECIFIC input
export function EnableInputRestriction(player: Player, inputRestriction: RestrictedInputs, restrictInput: boolean): void;

// Example: Block jump
mod.EnableInputRestriction(player, mod.RestrictedInputs.Jump, true);  // Lock
mod.EnableInputRestriction(player, mod.RestrictedInputs.Jump, false); // Unlock
```

---

## Patterns from Example Mods

### AcePursuit - Catch-up Mechanic (Sprint Restriction)
```typescript
// Disable sprint for leading players (top 30%) to balance race
const disableCount = Math.ceil(playersInRace.length * 0.3);
for (let i = 0; i < playersInRace.length; i++) {
    const shouldDisable = i < disableCount;
    mod.EnableInputRestriction(players[i].player, mod.RestrictedInputs.Sprint, shouldDisable);
}
```
**Source**: `mods/AcePursuit/AcePursuit.ts:630-651`

### AcePursuit - Teleport for Camera/Spawn
```typescript
cameraTeleport() {
    const spawnPositions = generateSpawnLine(startPos, endPod, MapPlayers, "right");
    const spawnposition = spawnPositions[this.selectVehNb].position;
    const lookrotation = this.lookAtYaw(spawnposition, VehiclePositions[this.selectVehNb]);
    mod.Teleport(this.#playerProfile.player,
        mod.CreateVector(spawnposition.x, spawnposition.y, spawnposition.z),
        lookrotation);
}
```
**Source**: `mods/AcePursuit/AcePursuit.ts:3310`

### Skirmish - Ring of Fire Position Check
```typescript
const playerPosition = mod.GetSoldierState(element, mod.SoldierStateVector.GetPosition);
const distanceFromRing = mod.DistanceBetween(playerPosition, ringCenterPosition);
if (distanceFromRing > currentRingRadius) {
    mod.DealDamage(player, 1);
}
```
**Source**: `mods/Skirmish/Skirmish.ts` (Ring of Fire system)

---

## Gadget Analysis

**No native jetpack or grappling hook gadgets exist.** The closest movement-affecting gadgets are:

| Gadget | Effect | Applicable? |
|--------|--------|-------------|
| `Class_Adrenaline_Injector` | Speed boost | Could enhance horizontal distance |
| `Misc_Assault_Ladder` | Climbing | Not jump-related |
| `CallIn_Mobile_Redeploy` | Spawn beacon | Not movement |

---

## Approach Analysis

### Approach 1: Teleport-Based Double Jump ★ RECOMMENDED

**Concept**: Detect second jump input while airborne, teleport player upward to simulate boost.

**Implementation Strategy**:
1. Track player state with polling loop (every 16ms = ~60fps)
2. Detect `IsJumping` state while `IsInAir` = true
3. Teleport player upward by a fixed amount
4. Optionally disable jump input after second jump until landing

**Pros**:
- Uses only documented SDK functions
- Can be tuned (height, timing)
- Works for any player

**Cons**:
- Teleport is instant (no arc physics)
- May feel slightly jarring
- Requires frame-by-frame polling

**Complexity**: Medium

---

### Approach 2: Smooth Arc Simulation

**Concept**: Instead of single teleport, simulate physics with multiple small teleports.

**Implementation Strategy**:
1. On second jump trigger, calculate parabolic arc
2. Apply small teleports every frame along the arc
3. Track vertical velocity manually, apply "gravity" each frame

**Pros**:
- Smoother feeling than single teleport
- More natural arc

**Cons**:
- More complex implementation
- Higher performance cost
- May conflict with native movement system

**Complexity**: High

---

### Approach 3: Input Lock + Boost

**Concept**: Lock jump after first use, provide "boost" via speed multiplier + teleport.

**Implementation Strategy**:
1. First jump = normal behavior
2. Lock jump input (`EnableInputRestriction`)
3. Wait for peak height (Y velocity approaches 0)
4. Apply upward teleport + speed boost
5. Unlock jump on landing

**Pros**:
- Clearer state machine
- Prevents jump spam

**Cons**:
- Requires precise timing detection
- Speed boost may feel inconsistent

**Complexity**: Medium

---

### Approach 4: Dash/Dodge (Horizontal Movement)

**Concept**: Instead of vertical double jump, implement horizontal dash.

**Implementation Strategy**:
1. Detect sprint input while airborne
2. Teleport player forward in facing direction
3. Apply brief speed multiplier

**Pros**:
- Horizontal teleport is less jarring than vertical
- Easier to feel "right"
- Could combine with vertical for 3D movement

**Cons**:
- Different from traditional double jump

**Complexity**: Low-Medium

---

### Approach 5: Wall Run Detection

**Concept**: Detect player near wall while airborne, modify movement.

**Implementation Strategy**:
1. Cast rays from player position to detect nearby walls (via AreaTriggers)
2. When wall detected + IsInAir + horizontal velocity toward wall:
3. Apply horizontal teleports along wall
4. Slowly decrease Y position (simulate running along wall)

**Pros**:
- Unique mechanic
- Uses existing AreaTrigger system

**Cons**:
- Requires wall geometry detection
- Complex state machine
- May need spatial setup for wall triggers

**Complexity**: Very High

---

## Recommended Implementation Order

For the **first prototype**, focus on:

### Phase 1: Basic Double Jump (Simplest)
```typescript
// Pseudo-code structure
class DoubleJumpSystem {
    private playerStates = new Map<number, {
        wasInAir: boolean;
        jumpsUsed: number;
        maxJumps: number;
    }>();

    async trackPlayer(player: mod.Player) {
        const playerId = mod.GetObjId(player);
        let state = this.playerStates.get(playerId) || { wasInAir: false, jumpsUsed: 0, maxJumps: 2 };

        while (mod.IsPlayerValid(player)) {
            const isInAir = mod.GetSoldierState(player, mod.SoldierStateBool.IsInAir);
            const isJumping = mod.GetSoldierState(player, mod.SoldierStateBool.IsJumping);

            // Landing detection - reset jumps
            if (state.wasInAir && !isInAir) {
                state.jumpsUsed = 0;
            }

            // Jump detection while airborne
            if (isJumping && isInAir && state.jumpsUsed < state.maxJumps) {
                // Apply boost
                const pos = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
                const facing = mod.GetSoldierState(player, mod.SoldierStateVector.GetFacingDirection);
                const boostHeight = 3.0; // Tune this value

                mod.Teleport(player,
                    mod.CreateVector(
                        mod.XComponentOf(pos),
                        mod.YComponentOf(pos) + boostHeight,
                        mod.ZComponentOf(pos)
                    ),
                    Math.atan2(mod.XComponentOf(facing), mod.ZComponentOf(facing))
                );

                state.jumpsUsed++;
            }

            state.wasInAir = isInAir;
            this.playerStates.set(playerId, state);
            await mod.Wait(0.016); // ~60 FPS check
        }
    }
}
```

### Phase 2: Refinements
- Tune boost height value
- Add visual/audio feedback (message, SFX)
- Handle edge cases (death, respawn, vehicle entry)

### Phase 3: Alternative Mechanics
- Horizontal dash
- Combined vertical + horizontal
- Wall run (if desired)

---

## Testing Strategy

### Isolated Test Environment
Use `example spacials/construct.json` elevated platform:
- Above normal gameplay
- Clear of obstacles
- Easy to reset (respawn)

### Test Cases
1. **Basic function**: Does double jump activate?
2. **Reset on land**: Do jumps reset after touching ground?
3. **Edge cases**: What happens on death? Vehicle entry? Water?
4. **Multiplayer**: Does it work for multiple players?
5. **Performance**: Does 60fps polling cause issues?

### Measurement
- Record player Y position over time
- Compare native jump height vs double jump
- Test feel/responsiveness

---

## Open Questions

1. **`IsJumping` Duration**: How long does `IsJumping` return true? Is it just the frame of input, or sustained during ascent?
   - Need to test empirically

2. **Teleport + Momentum**: Does teleporting preserve existing velocity, or reset it?
   - Need to test empirically

3. **Minimum Wait()**: What's the smallest reliable `Wait()` interval? Can we go below 16ms?
   - Need to test empirically

4. **State Detection Timing**: Is there a delay between input and `IsJumping` becoming true?
   - Need to test empirically

---

## Conclusions

1. **Double jump IS implementable** using SDK primitives
2. **Core approach**: State polling + Teleport
3. **Key functions**:
   - `GetSoldierState(player, SoldierStateBool.IsInAir/IsJumping/IsOnGround)`
   - `GetSoldierState(player, SoldierStateVector.GetPosition/GetLinearVelocity)`
   - `Teleport(player, position, orientation)`
   - `EnableInputRestriction(player, RestrictedInputs.Jump, bool)`
4. **Limitations**: No native physics manipulation, so movement feels "teleport-y"
5. **Refinement needed**: The "feel" will require tuning boost height, timing, and potentially simulated arcs

---

## Next Steps (For Implementation Session)

1. Create prototype mod in `experimental/prototypes/double-jump-v1.ts`
2. Implement basic state tracking loop
3. Test `IsJumping` detection timing
4. Test teleport behavior (momentum preservation)
5. Tune boost height and feel
6. Document findings for pattern library

---

## File References

| File | Purpose | Key Lines |
|------|---------|-----------|
| `code/mod/index.d.ts` | SDK type definitions | 21484-21520 (enums), 22760-22826 (functions) |
| `mods/AcePursuit/AcePursuit.ts` | Input restriction patterns | 630-651, 3300-3310 |
| `mods/Skirmish/Skirmish.ts` | Position tracking | 1770-1800, 3180-3188 |
| `example spacials/construct.json` | Test platform | (entire file) |
