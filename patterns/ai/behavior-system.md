# Pattern: AI Behavior System

> **SDK Version**: 1.1.3.0 (Battlefield 6)
> **Source**: mods/WarFactory/WarFactory.ts:314-515, mods/Exfil/Exfil.ts:1886-2150

---

## Overview

The AI Behavior System provides 18 functions to spawn, control, and script AI soldiers. AI bots can be used for PvE modes, horde defense, or to populate the battlefield with friendly/enemy NPCs.

**Key Concepts:**
- **AI Spawner**: Godot object that defines spawn location and team. Use `mod.GetSpawner(id)` to reference.
- **Behavior Functions**: Control what AI does (defend, move, patrol, attack)
- **Combat Functions**: Control shooting, targeting, focus points
- **Movement Functions**: Control speed and stance
- **Event Hooks**: React to AI actions (move succeeded/failed, parachute)

---

## Spawning AI

### Basic Spawning

```typescript
// Source: mods/Exfil/Exfil.ts:2075-2079

// Get spawner placed in Godot (by ID number)
const spawner = mod.GetSpawner(1);

// Spawn with default settings
mod.SpawnAIFromAISpawner(spawner);

// Spawn with soldier class
mod.SpawnAIFromAISpawner(spawner, mod.SoldierClass.Assault);

// Spawn on specific team
mod.SpawnAIFromAISpawner(spawner, mod.GetTeam(5));

// Spawn with class and team
mod.SpawnAIFromAISpawner(
    spawner,
    mod.SoldierClass.Assault,
    mod.GetTeam(5)
);

// Spawn with custom name
mod.SpawnAIFromAISpawner(
    spawner,
    mod.SoldierClass.Assault,
    mod.Message('ai_grunt_name'),
    mod.GetTeam(5)
);
```

### Spawner Configuration

```typescript
// Control whether AI unspawns when killed
mod.AISetUnspawnOnDead(spawner, true);  // Remove from game when dead
mod.AISetUnspawnOnDead(spawner, false); // Stay in game (default)
```

### Soldier Classes

```typescript
mod.SoldierClass.Assault   // Assault class
mod.SoldierClass.Engineer  // Engineer class
mod.SoldierClass.Recon     // Recon class
mod.SoldierClass.Support   // Support class
```

---

## Behavior Functions

Behaviors define what AI does over time. Only one behavior can be active at a time.

### AIBattlefieldBehavior (Free Roam + Combat)

AI acts autonomously - moves around, engages enemies.

```typescript
// Source: mods/WarFactory/WarFactory.ts:474

// Let AI roam and fight freely
mod.AIBattlefieldBehavior(aiPlayer);
```

**Use when**: AI reaches destination and should hold the area.

### AIDefendPositionBehavior (Hold Position)

AI defends a position within a radius, engaging enemies that approach.

```typescript
// Source: mods/Exfil/Exfil.ts:1958-1963

const position = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
const minRadius = 0;
const maxRadius = 50;

mod.AIDefendPositionBehavior(player, position, minRadius, maxRadius);
```

**Parameters:**
- `position`: Center point to defend
- `minRadius`: Inner radius AI won't leave
- `maxRadius`: Outer radius AI can patrol

### AIMoveToBehavior (Move to Point)

AI moves to a specific position using pathfinding.

```typescript
// Source: mods/WarFactory/WarFactory.ts:469

const targetPosition = mod.CreateVector(100, 0, 200);
mod.AIMoveToBehavior(aiPlayer, targetPosition);
```

**Note**: Use with `OnAIMoveToSucceeded` / `OnAIMoveToFailed` events.

### AILOSMoveToBehavior (Line-of-Sight Move)

AI moves to position but only if clear line of sight exists.

```typescript
const targetPosition = mod.CreateVector(100, 0, 200);
mod.AILOSMoveToBehavior(aiPlayer, targetPosition);
```

### AIValidatedMoveToBehavior (Validated Move)

AI moves to position with additional validation checks.

```typescript
const targetPosition = mod.CreateVector(100, 0, 200);
mod.AIValidatedMoveToBehavior(aiPlayer, targetPosition);
```

### AIIdleBehavior (Stand Still)

AI stands in place, doing nothing.

```typescript
mod.AIIdleBehavior(aiPlayer);
```

### AIWaypointIdleBehavior (Patrol Route)

AI patrols along a waypoint path placed in Godot.

```typescript
// Get waypoint path from Godot (by ID number)
const waypointPath = mod.GetWaypointPath(1);
mod.AIWaypointIdleBehavior(aiPlayer, waypointPath);
```

**Note**: Requires `AI_WaypointPath` object in Godot spatial.

### AIParachuteBehavior (Parachute Drop)

AI deploys parachute and lands. Useful for spawning AI in mid-air.

```typescript
// Source: mods/Exfil/Exfil.ts:1956

mod.AIParachuteBehavior(player);
await mod.Wait(5);  // Wait for landing
mod.AIDefendPositionBehavior(player, position, 0, 50);
```

---

## Combat Control

### Shooting Control

```typescript
// Source: mods/Exfil/Exfil.ts:1925, 1954

// Disable shooting (default: enabled)
mod.AIEnableShooting(player, false);

// Enable shooting
mod.AIEnableShooting(player, true);

// Enable with no parameter (same as true)
mod.AIEnableShooting(player);
```

### Targeting Control

```typescript
// Source: mods/Exfil/Exfil.ts:1955, 2005-2007

// Disable target acquisition
mod.AIEnableTargeting(player, false);

// Enable target acquisition
mod.AIEnableTargeting(player, true);

// Enable with no parameter (same as true)
mod.AIEnableTargeting(player);
```

### Set Specific Target

```typescript
// Force AI to target a specific player
mod.AISetTarget(aiPlayer, targetPlayer);

// Clear target
mod.AISetTarget(aiPlayer);
```

### Focus Point

```typescript
// Make AI focus on a specific point
const focusPoint = mod.CreateVector(100, 0, 200);
const isTarget = true;  // Treat as hostile target
mod.AISetFocusPoint(aiPlayer, focusPoint, isTarget);
```

### Force Fire

```typescript
// Force AI to fire for specified duration
mod.AIForceFire(aiPlayer, 3.0);  // Fire for 3 seconds
```

---

## Gadget Usage

```typescript
// AI uses gadget at position
mod.AIStartUsingGadget(aiPlayer, mod.OpenGadgets.UnguidedRocketLauncher, targetPos);

// AI uses gadget at player
mod.AIStartUsingGadget(aiPlayer, mod.OpenGadgets.UnguidedRocketLauncher, targetPlayer);

// Stop using gadget
mod.AIStopUsingGadget(aiPlayer);

// Configure gadget settings
mod.AIGadgetSettings(
    aiPlayer,
    preferGadget: boolean,
    allowGadgetAtSoldier: boolean,
    allowGadgetAtVehicle: boolean
);
```

**Available OpenGadgets:**
```typescript
mod.OpenGadgets.UnguidedRocketLauncher
```

---

## Movement Settings

### Move Speed

```typescript
// Source: mods/WarFactory/WarFactory.ts:459, mods/Exfil/Exfil.ts:1927

mod.AISetMoveSpeed(aiPlayer, mod.MoveSpeed.Sprint);
```

**MoveSpeed Values:**
```typescript
mod.MoveSpeed.Sprint           // Fastest
mod.MoveSpeed.Run              // Fast
mod.MoveSpeed.InvestigateRun   // Medium-fast
mod.MoveSpeed.Walk             // Normal
mod.MoveSpeed.InvestigateWalk  // Medium-slow
mod.MoveSpeed.InvestigateSlowWalk  // Slow
mod.MoveSpeed.Patrol           // Slowest
```

### Stance

```typescript
// Source: mods/Exfil/Exfil.ts:1928

mod.AISetStance(aiPlayer, mod.Stance.Stand);
```

**Stance Values:**
```typescript
mod.Stance.Stand   // Standing
mod.Stance.Crouch  // Crouching
mod.Stance.Prone   // Prone
```

---

## Event Hooks

Export these functions to respond to AI events.

### Movement Events

```typescript
// AI reached destination
export function OnAIMoveToSucceeded(eventPlayer: mod.Player): void {
    console.log('AI reached target');
    mod.AIBattlefieldBehavior(eventPlayer);
}

// AI stopped trying (blocked, timeout)
export function OnAIMoveToFailed(eventPlayer: mod.Player): void {
    console.log('AI move failed');
    mod.AIIdleBehavior(eventPlayer);
}

// AI currently moving
export function OnAIMoveToRunning(eventPlayer: mod.Player): void {
    // Called while AI is in transit
}
```

### Parachute Events

```typescript
// AI landed from parachute
export function OnAIParachuteSucceeded(eventPlayer: mod.Player): void {
    console.log('AI landed');
    mod.AIDefendPositionBehavior(eventPlayer, position, 0, 50);
}

// AI currently parachuting
export function OnAIParachuteRunning(eventPlayer: mod.Player): void {
    // Called while descending
}
```

### Waypoint Events

```typescript
// AI completed waypoint patrol
export function OnAIWaypointIdleSucceeded(eventPlayer: mod.Player): void {
    // Patrol complete
}

// AI stopped following waypoints
export function OnAIWaypointIdleFailed(eventPlayer: mod.Player): void {
    // Could not continue patrol
}

// AI currently following waypoints
export function OnAIWaypointIdleRunning(eventPlayer: mod.Player): void {
    // Called while patrolling
}
```

---

## Complete Examples

### Example 1: RTS-Style AI Grunt (WarFactory Pattern)

AI spawns at base, moves to attack point, then defends.

```typescript
// Source: mods/WarFactory/WarFactory.ts:314-515

interface AIProfile {
    player: mod.Player;
    team: mod.Team;
    targetPosition?: mod.Vector;
}

const aiProfiles: AIProfile[] = [];

// When AI spawns, assign to nearest base and send to attack
export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    // Check if AI player (team 5+)
    const teamId = mod.GetObjId(mod.GetTeam(eventPlayer));
    if (teamId >= mod.GetObjId(mod.GetTeam(5))) {
        handleAISpawn(eventPlayer);
    }
}

function handleAISpawn(player: mod.Player): void {
    const profile: AIProfile = {
        player: player,
        team: mod.GetTeam(player)
    };
    aiProfiles.push(profile);

    // Send AI to attack position
    const attackPosition = mod.CreateVector(500, 0, 500);
    directAIToAttack(profile, attackPosition);
}

async function directAIToAttack(profile: AIProfile, target: mod.Vector): Promise<void> {
    profile.targetPosition = target;
    mod.AISetMoveSpeed(profile.player, mod.MoveSpeed.InvestigateRun);

    while (mod.GetSoldierState(profile.player, mod.SoldierStateBool.IsAlive)) {
        const currentPos = mod.GetSoldierState(profile.player, mod.SoldierStateVector.GetPosition);

        mod.AIMoveToBehavior(profile.player, target);

        // Check if close enough
        if (mod.DistanceBetween(currentPos, target) < 20) {
            mod.AIBattlefieldBehavior(profile.player);
            return;
        }

        await mod.Wait(10);
    }
}

export function OnPlayerDied(eventPlayer: mod.Player): void {
    // Remove from tracking
    const index = aiProfiles.findIndex(p =>
        mod.GetObjId(p.player) === mod.GetObjId(eventPlayer)
    );
    if (index !== -1) {
        aiProfiles.splice(index, 1);
    }
}
```

### Example 2: Horde Defense AI (Exfil Pattern)

AI with custom behavior - melee zombies that only shoot when players are close.

```typescript
// Source: mods/Exfil/Exfil.ts:1886-2015

interface EnemyBehavior {
    onSpawn: (player: mod.Player) => Promise<void>;
    onDeath: (player: mod.Player) => Promise<void>;
}

class AIEnemy {
    player?: mod.Player;
    spawnPointID: number;

    constructor(public behavior: EnemyBehavior, spawnPointID: number = 1) {
        this.spawnPointID = spawnPointID;
    }

    async initialize(player: mod.Player): Promise<void> {
        this.player = player;

        // Configure AI settings
        mod.AIEnableShooting(player, false);
        mod.SetPlayerMaxHealth(player, 100);
        mod.AISetMoveSpeed(player, mod.MoveSpeed.Sprint);
        mod.AISetStance(player, mod.Stance.Stand);

        await this.behavior.onSpawn(player);
    }
}

const meleeZombieBehavior: EnemyBehavior = {
    onSpawn: async (player: mod.Player) => {
        // Strip weapons, give melee only
        mod.RemoveEquipment(player, mod.InventorySlots.PrimaryWeapon);
        mod.RemoveEquipment(player, mod.InventorySlots.SecondaryWeapon);

        // Start parachute drop
        mod.AIParachuteBehavior(player);
        await mod.Wait(5);

        // Defend spawn position
        const position = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
        mod.AIDefendPositionBehavior(player, position, 0, 100);

        // Enable targeting only when players nearby
        zombieTargetingLoop(player);
    },
    onDeath: async (player: mod.Player) => {
        console.log('Zombie died, respawning...');
        // Respawn logic here
    }
};

async function zombieTargetingLoop(player: mod.Player): Promise<void> {
    const ENGAGE_RANGE = 30;

    while (mod.IsPlayerValid(player) &&
           mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) {
        const aiPos = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
        let playerNearby = false;

        // Check all human players
        const allPlayers = mod.AllPlayers();
        const count = mod.CountOf(allPlayers);

        for (let i = 0; i < count; i++) {
            const humanPlayer = mod.ValueInArray(allPlayers, i);
            if (mod.GetObjId(mod.GetTeam(humanPlayer)) !== mod.GetObjId(mod.GetTeam(5))) {
                const humanPos = mod.GetSoldierState(humanPlayer, mod.SoldierStateVector.GetPosition);
                if (mod.DistanceBetween(aiPos, humanPos) < ENGAGE_RANGE) {
                    playerNearby = true;
                    break;
                }
            }
        }

        if (playerNearby) {
            mod.AIEnableTargeting(player, true);
            await mod.Wait(3);
            mod.AIEnableTargeting(player, false);
        } else {
            await mod.Wait(1);
        }
    }
}

// Spawn system
const spawnedAI = new Map<number, AIEnemy>();

async function spawnZombie(spawnPointID: number): Promise<void> {
    const spawner = mod.GetSpawner(spawnPointID);
    if (!spawner) return;

    const enemy = new AIEnemy(meleeZombieBehavior, spawnPointID);

    mod.SpawnAIFromAISpawner(
        spawner,
        mod.SoldierClass.Assault,
        mod.GetTeam(5)
    );

    // Store pending enemy (assign on deploy)
    spawnedAI.set(spawnPointID, enemy);
}

export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    // Check if this is an AI (team 5)
    if (mod.GetObjId(mod.GetTeam(eventPlayer)) === mod.GetObjId(mod.GetTeam(5))) {
        // Find matching spawn point by proximity
        // ... assign behavior from spawnedAI map
    }
}
```

### Example 3: Patrol AI with Waypoints

```typescript
// AI patrols a route placed in Godot

async function spawnPatrolAI(): Promise<void> {
    const spawner = mod.GetSpawner(1);
    const waypointPath = mod.GetWaypointPath(1);

    mod.SpawnAIFromAISpawner(
        spawner,
        mod.SoldierClass.Recon,
        mod.GetTeam(2)
    );

    // Configure on deploy
}

export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    if (isPatrolAI(eventPlayer)) {
        const waypointPath = mod.GetWaypointPath(1);
        mod.AISetMoveSpeed(eventPlayer, mod.MoveSpeed.Patrol);
        mod.AIEnableShooting(eventPlayer, true);
        mod.AIWaypointIdleBehavior(eventPlayer, waypointPath);
    }
}

export function OnAIWaypointIdleSucceeded(eventPlayer: mod.Player): void {
    // Patrol complete - restart or change behavior
    const waypointPath = mod.GetWaypointPath(1);
    mod.AIWaypointIdleBehavior(eventPlayer, waypointPath);  // Loop
}

export function OnAIWaypointIdleFailed(eventPlayer: mod.Player): void {
    // Could not complete patrol - fall back to defend
    const position = mod.GetSoldierState(eventPlayer, mod.SoldierStateVector.GetPosition);
    mod.AIDefendPositionBehavior(eventPlayer, position, 0, 30);
}

function isPatrolAI(player: mod.Player): boolean {
    // Your logic to identify patrol AI
    return mod.GetObjId(mod.GetTeam(player)) === mod.GetObjId(mod.GetTeam(2));
}
```

---

## Function Reference

### Spawning Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `GetSpawner` | `(number): Spawner` | Get AI spawner by ID |
| `GetWaypointPath` | `(number): WaypointPath` | Get waypoint path by ID |
| `SpawnAIFromAISpawner` | `(spawner, class?, name?, team?)` | Spawn AI soldier |
| `AISetUnspawnOnDead` | `(spawner, enable: boolean)` | Auto-remove dead AI |

### Behavior Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `AIBattlefieldBehavior` | `(player)` | Free roam and engage |
| `AIDefendPositionBehavior` | `(player, pos, minR, maxR)` | Defend area |
| `AIMoveToBehavior` | `(player, position)` | Move to point |
| `AILOSMoveToBehavior` | `(player, position)` | Move with LOS check |
| `AIValidatedMoveToBehavior` | `(player, position)` | Validated move |
| `AIIdleBehavior` | `(player)` | Stand still |
| `AIWaypointIdleBehavior` | `(player, waypointPath)` | Patrol route |
| `AIParachuteBehavior` | `(player)` | Parachute drop |

### Combat Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `AIEnableShooting` | `(player, enable?)` | Toggle shooting |
| `AIEnableTargeting` | `(player, enable?)` | Toggle targeting |
| `AISetTarget` | `(aiPlayer, targetPlayer?)` | Set/clear target |
| `AISetFocusPoint` | `(player, point, isTarget)` | Focus on point |
| `AIForceFire` | `(player, duration)` | Force firing |
| `AIStartUsingGadget` | `(player, gadget, target)` | Use gadget |
| `AIStopUsingGadget` | `(player)` | Stop gadget |
| `AIGadgetSettings` | `(player, prefer, soldier, vehicle)` | Configure gadget |

### Movement Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `AISetMoveSpeed` | `(player, MoveSpeed)` | Set movement speed |
| `AISetStance` | `(player, Stance)` | Set stance |

### Event Hooks

| Event | Parameter | Trigger |
|-------|-----------|---------|
| `OnAIMoveToSucceeded` | `eventPlayer` | AI reached destination |
| `OnAIMoveToFailed` | `eventPlayer` | AI stopped trying |
| `OnAIMoveToRunning` | `eventPlayer` | AI moving |
| `OnAIParachuteSucceeded` | `eventPlayer` | AI landed |
| `OnAIParachuteRunning` | `eventPlayer` | AI descending |
| `OnAIWaypointIdleSucceeded` | `eventPlayer` | Patrol complete |
| `OnAIWaypointIdleFailed` | `eventPlayer` | Patrol stopped |
| `OnAIWaypointIdleRunning` | `eventPlayer` | Patrolling |

---

## Godot Setup Requirements

1. **AI_Spawner**: Place spawner objects where AI should spawn
   - Set spawner ID (used with `mod.GetSpawner(id)`)
   - Configure default team

2. **AI_WaypointPath**: Place waypoint paths for patrol routes
   - Set path ID (used with `mod.GetWaypointPath(id)`)
   - Define waypoint sequence

**RuntimeSpawn enum values:**
```typescript
mod.RuntimeSpawn_Common.AI_Spawner
mod.RuntimeSpawn_Common.AI_WaypointPath
```

---

## Constraints & Gotchas

1. **Team Assignment**: AI typically uses Team 5+ to separate from human teams
2. **Behavior Override**: Setting a new behavior cancels the previous one
3. **Valid Check**: Always check `mod.IsPlayerValid(player)` before AI operations
4. **Movement Loop**: Use `mod.Wait()` in movement loops to avoid blocking
5. **Object Equality**: Use `mod.GetObjId()` to compare AI players, not `===`
6. **Death Handling**: Track AI in an array and remove on death to avoid memory leaks
7. **Spawn Timing**: AI spawn is async - use `OnPlayerDeployed` to configure behavior

---

## Related Patterns

- [Event Hooks](../core/event-hooks.md) - OnPlayerDeployed for AI initialization
- [State Management](../core/state-management.md) - Tracking AI with PlayerProfile
- [Object Equality](../core/object-equality.md) - Comparing AI players correctly
