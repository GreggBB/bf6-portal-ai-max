# Pattern: Capture Points

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/WarFactory/WarFactory.ts, mods/CustomConquest (Portal Blocks), code/mod/index.d.ts

---

## Overview

Capture points are spatial objectives that teams can capture by standing inside their boundaries. The SDK provides events for capture state changes and functions to configure capture behavior.

---

## Setup Requirements

1. **Godot Scene**: Place a `CapturePoint` node with:
   - An ObjId (unique identifier, e.g., 200-226 for flags A-Z)
   - A `CapturePointArea` (polygon volume defining the capture boundary)

2. **ObjId Convention** (from CustomConquest):
   - 200-226: Capture points (A=200, B=201, etc.)
   - Other ranges reserved for area triggers and spawners

---

## Core Functions

### Getting Capture Points

```typescript
// Get all capture points in the game
const allPoints: mod.Array = mod.AllCapturePoints();

// Get a specific capture point by ObjId
const pointA: mod.CapturePoint = mod.GetCapturePoint(200);

// Get capture point from event
export function OnCapturePointCaptured(eventCapturePoint: mod.CapturePoint) {
    const objId = mod.GetObjId(eventCapturePoint);
    console.log("Captured point with ObjId: " + objId);
}
```

### Capture State Queries

```typescript
// Get capture progress (0.0 to 1.0)
const progress: number = mod.GetCaptureProgress(capturePoint);

// Get current owner team
const owner: mod.Team = mod.GetCurrentOwnerTeam(capturePoint);

// Get team currently capturing (may differ from owner during neutralization)
const capturingTeam: mod.Team = mod.GetOwnerProgressTeam(capturePoint);

// Get previous owner (useful in OnCapturePointCaptured)
const previousOwner: mod.Team = mod.GetPreviousOwnerTeam(capturePoint);

// Get all players currently in the capture zone
const players: mod.Array = mod.GetPlayersOnPoint(capturePoint);
```

### Configuration

```typescript
// Set capture/neutralization times (in seconds)
mod.SetCapturePointCapturingTime(capturePoint, 30);      // Time to capture
mod.SetCapturePointNeutralizationTime(capturePoint, 15); // Time to neutralize

// Set capture speed multiplier (affects how many players speed up capture)
mod.SetMaxCaptureMultiplier(capturePoint, 4); // Max 4x speed with 4+ players

// Force ownership change
mod.SetCapturePointOwner(capturePoint, mod.GetTeam(1));

// Enable/disable deploying on capture point
mod.EnableCapturePointDeploying(capturePoint, true);

// Enable/disable the capture point entirely
mod.EnableGameModeObjective(capturePoint, false);
```

---

## Event Hooks

### Capture State Events

```typescript
// Triggered when a team completes capturing a point
export function OnCapturePointCaptured(eventCapturePoint: mod.CapturePoint): void {
    const newOwner = mod.GetCurrentOwnerTeam(eventCapturePoint);
    const prevOwner = mod.GetPreviousOwnerTeam(eventCapturePoint);
    console.log("Point captured by team: " + mod.GetObjId(newOwner));
}

// Triggered when a team STARTS capturing (entering the zone while contested)
export function OnCapturePointCapturing(eventCapturePoint: mod.CapturePoint): void {
    mod.DisplayNotificationMessage(mod.Message('objective_under_attack'));
}

// Triggered when a team loses control of a point
export function OnCapturePointLost(eventCapturePoint: mod.CapturePoint): void {
    const lostByTeam = mod.GetPreviousOwnerTeam(eventCapturePoint);
    console.log("Point lost");
}
```

### Player Enter/Exit Events

```typescript
// Player enters capture zone
export function OnPlayerEnterCapturePoint(
    eventPlayer: mod.Player,
    eventCapturePoint: mod.CapturePoint
): void {
    // Show capture UI to player
    ShowCaptureUI(eventPlayer, eventCapturePoint);
}

// Player exits capture zone
export function OnPlayerExitCapturePoint(
    eventPlayer: mod.Player,
    eventCapturePoint: mod.CapturePoint
): void {
    // Hide capture UI
    HideCaptureUI(eventPlayer);
}
```

### Ongoing Capture Point Rule

```typescript
// Process capture point logic every frame (useful for UI updates)
export function OngoingCapturePoint(eventCapturePoint: mod.CapturePoint): void {
    const progress = mod.GetCaptureProgress(eventCapturePoint);
    UpdateProgressBar(eventCapturePoint, progress);
}
```

---

## Working Example: Capture with Scoring

From `mods/WarFactory/WarFactory.ts:196-247`:

```typescript
export async function OnCapturePointCaptured(eventCapturePoint: mod.CapturePoint) {
    console.log("OnCapturePointCaptured");

    const currentOwnerTeamId = mod.GetCurrentOwnerTeam(eventCapturePoint);
    const capturePointId = mod.GetObjId(eventCapturePoint);

    // Award points to capturing team
    const baseTotalWorth = 100; // Points for capturing
    GameHandler.AddScore(currentOwnerTeamId, baseTotalWorth);

    // Find players in the capture zone and reward them
    const playersOnPoint = mod.GetPlayersOnPoint(eventCapturePoint);
    const playerCount = mod.CountOf(playersOnPoint);

    if (playerCount > 0) {
        const payout = Math.round(baseTotalWorth / playerCount);

        for (let i = 0; i < playerCount; i++) {
            const player = mod.ValueInArray(playersOnPoint, i) as mod.Player;

            // Only reward players on the capturing team
            if (mod.GetObjId(mod.GetTeam(player)) === mod.GetObjId(currentOwnerTeamId)) {
                const playerProfile = PlayerProfile.get(player);
                playerProfile?.AddCash(payout);
            }
        }
    }
}

export async function OnCapturePointLost(eventCapturePoint: mod.CapturePoint) {
    console.log("OnCapturePointLost");

    // Penalty for losing a capture point
    const previousOwner = mod.GetPreviousOwnerTeam(eventCapturePoint);
    GameHandler.AddScore(previousOwner, -50); // Deduct points
}
```

---

## CustomConquest Logic Reference

The CustomConquest Portal Blocks mod implements these mechanics:

### Ticket Bleed System
- Teams with fewer capture points lose tickets over time
- "Total Control" bonus: Extra ticket drain when one team holds all points
- Configurable bleed rate per flag

### Capture UI System
- Progress bar showing capture percentage
- Color-coded by team ownership
- Letter designation (A, B, C...) based on ObjId offset from 200

### Voice-Over Integration
- `ObjectiveCapturing` when capture starts
- `ObjectiveCaptured` / `ObjectiveCapturedEnemy` on completion
- `ObjectiveNeutralised` when point becomes neutral
- `ObjectiveLost` when your team loses a point

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `AllCapturePoints` | `(): Array` | Returns all capture points |
| `GetCapturePoint` | `(id: number): CapturePoint` | Get point by ObjId |
| `GetCaptureProgress` | `(cp: CapturePoint): number` | 0.0-1.0 capture progress |
| `GetCurrentOwnerTeam` | `(cp: CapturePoint): Team` | Current owner |
| `GetOwnerProgressTeam` | `(cp: CapturePoint): Team` | Team currently capturing |
| `GetPreviousOwnerTeam` | `(cp: CapturePoint): Team` | Previous owner |
| `GetPlayersOnPoint` | `(cp: CapturePoint): Array` | Players in zone |
| `SetCapturePointCapturingTime` | `(cp: CapturePoint, time: number): void` | Set capture duration |
| `SetCapturePointNeutralizationTime` | `(cp: CapturePoint, time: number): void` | Set neutralize duration |
| `SetMaxCaptureMultiplier` | `(cp: CapturePoint, mult: number): void` | Max player speed bonus |
| `SetCapturePointOwner` | `(cp: CapturePoint, team: Team): void` | Force ownership |
| `EnableCapturePointDeploying` | `(cp: CapturePoint, enable: boolean): void` | Toggle spawn-on-point |
| `EnableGameModeObjective` | `(obj: CapturePoint, enable: boolean): void` | Enable/disable point |

---

## Constraints

1. **Godot Setup Required**: Capture points must be placed in the Godot spatial editor with proper ObjIds
2. **Height Bug**: Capture UI may draw incorrectly when players are above/below the polygon volume height
3. **GetPlayersOnPoint Reliability**: WarFactory notes this can fail sometimes; distance-based fallback recommended
4. **Event Timing**: OnCapturePointCapturing may fire when flags change state unexpectedly

---

## Related Patterns

- [Audio](audio.md) - Playing VO announcements on capture events
- [Economy](economy.md) - Rewarding players for captures
- [UI: Widgets](../ui/widgets.md) - Building capture progress UI
