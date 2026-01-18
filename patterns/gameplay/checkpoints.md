# Pattern: Checkpoints & Lap Tracking

> **SDK Version**: 1.1.3.0 (Battlefield 6)
> **Source**: mods/AcePursuit/AcePursuit.ts:29-50, 416-482, 681-704, 1040-1057

---

## Overview

This pattern implements checkpoint-based racing with lap tracking. Key features:
- **Distance-based detection** (not colliders/AreaTriggers)
- **Per-player progress tracking** (checkpoint count, next checkpoint, lap)
- **Dynamic difficulty** via checkpoint circle size
- **Race ordering** based on lap, checkpoint, and distance to next checkpoint

---

## Data Structures

### Checkpoint Definition

```typescript
type Vector3 = { x: number; y: number; z: number };

type Checkpoint = {
    id: number;                  // Unique identifier
    position: Vector3;           // Center position for detection
    checkpointStart: Vector3;    // Start of spawn line
    checkpointEnd: Vector3;      // End of spawn line
    flipdir?: boolean;           // Flip spawn direction (optional)
};
```

### Race Track Definition

```typescript
type RaceTrack = {
    trackId: string;                   // Unique track identifier
    name: string;                      // Display name
    laps: number;                      // Required laps to win
    gametype: GameType;                // race, timeSurvival, etc.
    availableVehicles: mod.VehicleList[];
    checkPoints: Checkpoint[];         // Ordered checkpoint array
};
```

### Player Racing State

```typescript
class PlayerProfile {
    player: mod.Player;
    checkpoint: number = 0;           // Total checkpoints passed
    nextCheckpoint: number = 1;       // Index of next checkpoint to hit
    lap: number = 0;                  // Completed laps
    completedTrack: boolean = false;
    playerRaceTime: number | null = null;
    checkPointPosition: mod.Vector;   // Position of next checkpoint
    checkpointCircleSize: number = 25; // Detection radius
}
```

---

## Working Code

### Race State Machine

```typescript
enum TrackState {
    none = 0,       // No race active
    selected = 1,   // Track selected, waiting for players
    starting = 2,   // Countdown in progress
    running = 3,    // Race active
    winnerFound = 4,// Winner crossed finish, others still racing
    over = 5        // Race complete
}
```

### Checkpoint Detection Loop

The core racing loop. Runs continuously checking each player's distance to their next checkpoint:

```typescript
class TrackData {
    trackState: TrackState = TrackState.none;
    checkPoints: Checkpoint[];
    laps: number;
    playersInRace: PlayerProfile[] = [];
    raceTime: number = 0;  // Match time when race started

    async DistanceCheckToCheckpoint() {
        while (this.trackState == TrackState.running ||
               this.trackState == TrackState.winnerFound) {

            for (const playerProfile of this.playersInRace) {
                // Skip if player already finished
                if (playerProfile.completedTrack) continue;

                // Skip if player invalid or dead
                if (!playerProfile.player) continue;
                if (!mod.GetSoldierState(playerProfile.player, mod.SoldierStateBool.IsAlive)) {
                    continue;
                }

                // Get player position
                const playerPosition = mod.GetSoldierState(
                    playerProfile.player,
                    mod.SoldierStateVector.GetPosition
                );
                if (!playerPosition) continue;

                // Get target checkpoint position
                const targetCheckpoint = this.checkPoints[playerProfile.nextCheckpoint];
                const targetPos = mod.CreateVector(
                    targetCheckpoint.position.x,
                    targetCheckpoint.position.y,
                    targetCheckpoint.position.z
                );

                // Check distance
                const distance = mod.DistanceBetween(playerPosition, targetPos);

                if (distance <= playerProfile.checkpointCircleSize) {
                    // Checkpoint reached!
                    this.OnCheckpointReached(playerProfile);
                }
            }

            await mod.Wait(0.1);  // Check 10 times per second
        }
    }

    OnCheckpointReached(playerProfile: PlayerProfile) {
        // Increment checkpoint count
        playerProfile.checkpoint++;

        // Update checkpoint circle size based on race position
        const positionInRace = this.playersInRace.indexOf(playerProfile);
        playerProfile.checkpointCircleSize = getCheckpointSize(
            positionInRace,
            this.playersInRace.length
        );

        // Calculate next checkpoint (wraps around)
        playerProfile.nextCheckpoint = playerProfile.checkpoint % this.checkPoints.length;
        playerProfile.checkPointPosition = mod.CreateVector(
            this.checkPoints[playerProfile.nextCheckpoint].position.x,
            this.checkPoints[playerProfile.nextCheckpoint].position.y,
            this.checkPoints[playerProfile.nextCheckpoint].position.z
        );

        // Calculate laps completed
        const lapsCompleted = Math.floor(playerProfile.checkpoint / this.checkPoints.length);
        if (lapsCompleted !== playerProfile.lap) {
            playerProfile.lap = lapsCompleted;
            console.log("Lap " + playerProfile.lap);
        }

        // Check win condition
        // Must complete all laps AND pass at least checkpoint 1 of the "extra" lap
        if (playerProfile.lap >= this.laps &&
            (playerProfile.checkpoint % this.checkPoints.length) >= 1 &&
            !playerProfile.completedTrack) {
            this.PlayerCompletedTrack(playerProfile);
        }

        // Re-sort race standings
        this.UpdateOrder();
    }
}
```

### Dynamic Checkpoint Size

Leaders get smaller checkpoints (harder), trailing players get larger ones (easier):

```typescript
const CIRCLE_MAX = 70;  // Easiest (last place)
const CIRCLE_MIN = 25;  // Hardest (first place)

function getCheckpointSize(positionIndex: number, totalPlayers: number): number {
    // Invalid position defaults to minimum
    if (positionIndex < 0 || positionIndex >= totalPlayers) {
        return CIRCLE_MIN;
    }

    // Solo player gets minimum size
    if (totalPlayers === 1) {
        return CIRCLE_MIN;
    }

    // Linear interpolation: first place = MIN, last place = MAX
    const normalized = positionIndex / (totalPlayers - 1);
    return CIRCLE_MIN + normalized * (CIRCLE_MAX - CIRCLE_MIN);
}
```

### Race Position Sorting

Sort players by race progress for standings display:

```typescript
function compareRacers(a: PlayerProfile, b: PlayerProfile): number {
    // Completed players first, sorted by time
    if (a.completedTrack && b.completedTrack) {
        return a.playerRaceTime! - b.playerRaceTime!;
    }
    if (a.completedTrack) return -1;
    if (b.completedTrack) return 1;

    // Sort by lap (more laps = better)
    if (a.lap !== b.lap) return b.lap - a.lap;

    // Sort by checkpoints within lap
    if (a.checkpoint !== b.checkpoint) return b.checkpoint - a.checkpoint;

    // Tiebreaker: distance to next checkpoint (closer = better)
    const aDistance = mod.DistanceBetween(
        mod.GetSoldierState(a.player, mod.SoldierStateVector.GetPosition),
        a.checkPointPosition
    );
    const bDistance = mod.DistanceBetween(
        mod.GetSoldierState(b.player, mod.SoldierStateVector.GetPosition),
        b.checkPointPosition
    );

    return aDistance - bDistance;
}

function sortRaceStanding(racers: PlayerProfile[]): PlayerProfile[] {
    return [...racers].sort(compareRacers);
}
```

### Track Completion

```typescript
PlayerCompletedTrack(playerProfile: PlayerProfile) {
    playerProfile.completedTrack = true;
    playerProfile.playerRaceTime = mod.GetMatchTimeElapsed() - this.raceTime;

    if (!this.winner) {
        // First to finish
        this.winner = true;
        this.winnerPlayer = playerProfile;
        this.trackState = TrackState.winnerFound;
        // Start countdown for remaining players
        this.StartEndGameCountdown();
    }
}
```

### Overtake Detection

Detect when a player improves their position:

```typescript
function detectOvertakes(oldOrder: PlayerProfile[], newOrder: PlayerProfile[]): PlayerProfile[] {
    let overtakes: PlayerProfile[] = [];

    for (const player of newOrder) {
        const id = player.playerProfileId;
        const oldPos = oldOrder.findIndex(p => p.playerProfileId === id);
        const newPos = newOrder.findIndex(p => p.playerProfileId === id);

        // Position improved (lower index = better position)
        if (oldPos > newPos && oldPos !== -1) {
            overtakes.push(player);
        }
    }

    return overtakes;
}
```

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `DistanceBetween` | `(vec1: Vector, vec2: Vector): number` | Calculate distance between two positions |
| `GetSoldierState` | `(player: Player, stateVector: SoldierStateVector): Vector` | Get player position |
| `GetMatchTimeElapsed` | `(): number` | Get elapsed game time |
| `Wait` | `(seconds: number): Promise<void>` | Async delay |
| `IsPlayerValid` | `(player: Player): boolean` | Check if player reference is valid |

---

## Track Data Example

```typescript
const tracks: RaceTrack[] = [
    {
        trackId: "track_02",
        name: "Air_Lap",
        laps: 3,
        gametype: GameType.race,
        availableVehicles: [mod.VehicleList.F22, mod.VehicleList.F16, mod.VehicleList.JAS39],
        checkPoints: [
            {
                id: 0,
                position: { x: 100, y: 150, z: 200 },
                checkpointStart: { x: 80, y: 150, z: 200 },
                checkpointEnd: { x: 120, y: 150, z: 200 },
            },
            {
                id: 1,
                position: { x: 200, y: 160, z: 300 },
                checkpointStart: { x: 180, y: 160, z: 300 },
                checkpointEnd: { x: 220, y: 160, z: 300 },
                flipdir: true,  // Spawn facing opposite direction
            },
            // ... more checkpoints
        ],
    },
];
```

---

## Constraints & Gotchas

1. **No Colliders**: This pattern uses distance checks, not AreaTrigger colliders. This gives more control over detection radius but requires a polling loop.

2. **Check Rate**: `await mod.Wait(0.1)` checks 10 times per second. Adjust based on vehicle speed - faster vehicles may need faster checks.

3. **Circle Size Range**: CIRCLE_MIN (25) to CIRCLE_MAX (70) work well for aircraft. Ground vehicles may need different values.

4. **Lap Calculation**: `Math.floor(checkpoint / checkpointCount)` calculates completed laps. The modulo `%` wraps the checkpoint index.

5. **Win Condition**: The `>= 1` check ensures players pass the first checkpoint of the "victory lap" before winning, preventing false finishes.

6. **Player Validity**: Always check `mod.IsPlayerValid()` and `SoldierStateBool.IsAlive` - players can disconnect or die mid-race.

7. **Match Time**: Use `mod.GetMatchTimeElapsed()` at race start as a baseline, then calculate individual times relative to it.
