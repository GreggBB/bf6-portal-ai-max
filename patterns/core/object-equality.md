# Pattern: Object Equality

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/WarFactory/WarFactory.ts (HoH_Helpers class)

---

## What This Pattern Does

Provides the correct way to compare Portal SDK objects (players, teams, capture points, etc.). Native JavaScript equality (`===`) does not work for these objects.

---

## The Problem

Portal SDK objects like `mod.Team`, `mod.Player`, `mod.CapturePoint`, etc. are not simple JavaScript objects. Direct comparison fails:

```typescript
// THIS DOES NOT WORK
const team1 = mod.GetTeam(1);
const playerTeam = mod.GetTeam(eventPlayer);

if (team1 === playerTeam) {  // ALWAYS FALSE - even for same team!
    // Never executes
}
```

---

## The Solution

Use `mod.GetObjId()` to get a stable numeric identifier for any object, then compare the IDs.

```typescript
// Helper function
function IsEqual(left: any, right: any): boolean {
    return mod.GetObjId(left) === mod.GetObjId(right);
}

// Usage
const team1 = mod.GetTeam(1);
const playerTeam = mod.GetTeam(eventPlayer);

if (IsEqual(team1, playerTeam)) {  // WORKS!
    // Executes when player is on team 1
}
```

---

## Complete Helper Class

From WarFactory's `HoH_Helpers`:

```typescript
class Helpers {
    /**
     * Compare any two Portal SDK objects for equality.
     * Works for: mod.Team, mod.Player, mod.CapturePoint, mod.Vehicle, etc.
     */
    static IsEqual(left: any, right: any): boolean {
        return mod.GetObjId(left) === mod.GetObjId(right);
    }

    /**
     * Check if player is on a specific team.
     */
    static IsPlayerOnTeam(player: mod.Player, team: mod.Team): boolean {
        return this.IsEqual(mod.GetTeam(player), team);
    }

    /**
     * Check if a capture point is owned by a team.
     */
    static IsPointOwnedBy(point: mod.CapturePoint, team: mod.Team): boolean {
        return this.IsEqual(mod.GetCurrentOwnerTeam(point), team);
    }

    /**
     * Find index in array by object ID.
     */
    static FindIndexByObjId<T>(array: T[], target: T): number {
        const targetId = mod.GetObjId(target);
        return array.findIndex(item => mod.GetObjId(item) === targetId);
    }

    /**
     * Check if array contains object (by ID).
     */
    static ArrayContains<T>(array: T[], target: T): boolean {
        return this.FindIndexByObjId(array, target) !== -1;
    }

    /**
     * Remove object from array (by ID).
     */
    static RemoveFromArray<T>(array: T[], target: T): T[] {
        const targetId = mod.GetObjId(target);
        return array.filter(item => mod.GetObjId(item) !== targetId);
    }
}
```

---

## Common Use Cases

### 1. Team Comparison

```typescript
const TeamOne = mod.GetTeam(1);
const TeamTwo = mod.GetTeam(2);

export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    const playerTeam = mod.GetTeam(eventPlayer);

    if (Helpers.IsEqual(playerTeam, TeamOne)) {
        // Player is on Team 1
        mod.Teleport(eventPlayer, team1SpawnPos, 0);
    } else if (Helpers.IsEqual(playerTeam, TeamTwo)) {
        // Player is on Team 2
        mod.Teleport(eventPlayer, team2SpawnPos, 0);
    }
}
```

### 2. Capture Point Ownership

```typescript
export function OnCapturePointCaptured(eventCapturePoint: mod.CapturePoint): void {
    const ownerTeam = mod.GetCurrentOwnerTeam(eventCapturePoint);

    if (Helpers.IsEqual(ownerTeam, TeamOne)) {
        teamOnePoints++;
    } else if (Helpers.IsEqual(ownerTeam, TeamTwo)) {
        teamTwoPoints++;
    }
}
```

### 3. Player Tracking Arrays

```typescript
const deployedPlayers: mod.Player[] = [];

export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    if (!Helpers.ArrayContains(deployedPlayers, eventPlayer)) {
        deployedPlayers.push(eventPlayer);
    }
}

export function OnPlayerDied(eventPlayer: mod.Player, ...args): void {
    deployedPlayers = Helpers.RemoveFromArray(deployedPlayers, eventPlayer);
}
```

### 4. Kill Attribution

```typescript
export function OnPlayerDied(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    // Check it wasn't suicide
    if (!Helpers.IsEqual(eventPlayer, eventOtherPlayer)) {
        // Award kill to other player
        const killerProfile = PlayerProfile.Get(eventOtherPlayer);
        if (killerProfile) {
            killerProfile.kills++;
        }
    }
}
```

### 5. Player Lookup by ID

```typescript
function FindPlayerById(playerId: number): mod.Player | undefined {
    return PlayerProfile.playerInstances.find(
        player => mod.GetObjId(player) === playerId
    );
}

// Used in OnPlayerLeaveGame where you only get the ID
export function OnPlayerLeaveGame(eventNumber: number): void {
    const leavingPlayer = FindPlayerById(eventNumber);
    if (leavingPlayer) {
        // Cleanup
    }
}
```

---

## Function Reference

| Function | Signature | Purpose |
|----------|-----------|---------|
| `mod.GetObjId` | `(object: any): number` | Get unique numeric ID for any Portal object |
| `mod.GetTeam` | `(playerOrIndex: mod.Player \| number): mod.Team` | Get team object |
| `mod.GetCurrentOwnerTeam` | `(capturePoint: mod.CapturePoint): mod.Team` | Get team owning a point |
| `mod.Equals` | `(a: any, b: any): boolean` | SDK equality (for enums) |

---

## When to Use What

| Comparison Type | Method |
|-----------------|--------|
| Teams, Players, CapturePoints, Vehicles | `mod.GetObjId(a) === mod.GetObjId(b)` |
| Enums (UIButtonEvent, DeathType, etc.) | `mod.Equals(a, b)` |
| Numbers, Strings | Normal `===` |
| UI Widgets | `mod.GetUIWidgetName(a) === mod.GetUIWidgetName(b)` |

---

## Constraints

1. **Always use GetObjId** for SDK object comparison - never use `===`
2. **GetObjId returns -1** for invalid objects - check before using as dictionary key
3. **Object IDs are session-stable** - same object keeps same ID during a game session
4. **Use mod.Equals for enums** - `mod.Equals(event, mod.UIButtonEvent.ButtonDown)`

---

## Complete Example

```typescript
import * as mod from "@warp/sdk/mod";

// Helper
function IsEqual(a: any, b: any): boolean {
    return mod.GetObjId(a) === mod.GetObjId(b);
}

// Teams
const TeamOne = mod.GetTeam(1);
const TeamTwo = mod.GetTeam(2);

// Player tracking with proper equality
const teamOnePlayers: mod.Player[] = [];
const teamTwoPlayers: mod.Player[] = [];

export function OnPlayerJoinGame(eventPlayer: mod.Player): void {
    const playerTeam = mod.GetTeam(eventPlayer);

    if (IsEqual(playerTeam, TeamOne)) {
        teamOnePlayers.push(eventPlayer);
    } else if (IsEqual(playerTeam, TeamTwo)) {
        teamTwoPlayers.push(eventPlayer);
    }
}

export function OnPlayerLeaveGame(eventNumber: number): void {
    // Remove from both arrays by ID
    teamOnePlayers = teamOnePlayers.filter(p => mod.GetObjId(p) !== eventNumber);
    teamTwoPlayers = teamTwoPlayers.filter(p => mod.GetObjId(p) !== eventNumber);
}

export function OnPlayerDied(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    // Not suicide
    if (!IsEqual(eventPlayer, eventOtherPlayer)) {
        const killerTeam = mod.GetTeam(eventOtherPlayer);

        // Use mod.Equals for enum comparison
        if (mod.Equals(eventDeathType, mod.DeathTypes.KilledByPlayer)) {
            console.log("Player killed by enemy");
        }
    }
}
```
