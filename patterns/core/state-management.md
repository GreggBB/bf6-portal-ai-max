# Pattern: State Management

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/WarFactory/WarFactory.ts, mods/Skirmish/Skirmish.ts

---

## What This Pattern Does

Provides a consistent architecture for managing game state across complex mods. Uses three key techniques:
1. **Static class separation** - Config vs Data vs Logic
2. **Player profile registry** - Per-player state with stable keys
3. **Multi-state player tracking** - Different arrays for different player states

---

## 1. Static Class Architecture (GC/GD/GS Pattern)

Separate configuration, mutable state, and orchestration logic.

```typescript
// GC = Game Constants (immutable configuration)
class GC {
    static readonly startingCash: number = 500;
    static readonly maxScore: number = 15000;
    static readonly roundDuration: number = 300;
    static readonly requiredPlayers: number = 2;
    static readonly teamCount: number = 4;
}

// GD = Game Data (mutable runtime state)
class GD {
    static currentRound: number = 0;
    static roundActive: boolean = false;
    static teamScores: number[] = [0, 0, 0, 0];
    static gameStarted: boolean = false;
}

// GS = Game State (orchestration logic)
class GS {
    static async StartRound(): Promise<void> {
        GD.currentRound++;
        GD.roundActive = true;
        // ... round start logic
    }

    static async EndRound(): Promise<void> {
        GD.roundActive = false;
        // ... cleanup logic
    }

    static AddScore(teamIndex: number, points: number): void {
        GD.teamScores[teamIndex] += points;
        if (GD.teamScores[teamIndex] >= GC.maxScore) {
            GS.Victory(teamIndex);
        }
    }

    static Victory(teamIndex: number): void {
        mod.EndGameMode(mod.GetTeam(teamIndex + 1));
    }
}
```

**Source**: Skirmish.ts uses this exact pattern.

---

## 2. Player Profile Registry

Track per-player data using `mod.GetObjId()` as a stable identifier.

```typescript
class PlayerProfile {
    // Instance properties (per-player state)
    player: mod.Player;
    playerID: number;
    cash: number = 500;
    kills: number = 0;
    deaths: number = 0;

    // Static registry using object ID as key
    static #allProfiles: { [key: number]: PlayerProfile } = {};
    static playerInstances: mod.Player[] = [];

    private constructor(player: mod.Player) {
        this.player = player;
        this.playerID = mod.GetObjId(player);
    }

    // Factory method - auto-creates if needed
    static Get(player: mod.Player): PlayerProfile | undefined {
        const id = mod.GetObjId(player);
        if (id < 0) return undefined;

        if (!this.#allProfiles[id]) {
            this.#allProfiles[id] = new PlayerProfile(player);
            this.playerInstances.push(player);
        }
        return this.#allProfiles[id];
    }

    // Cleanup on player leave
    static Remove(player: mod.Player): void {
        const id = mod.GetObjId(player);
        delete this.#allProfiles[id];
        this.playerInstances = this.playerInstances.filter(
            p => mod.GetObjId(p) !== id
        );
    }

    // Get all profiles
    static GetAll(): PlayerProfile[] {
        return Object.values(this.#allProfiles);
    }
}
```

**Usage in event hooks**:
```typescript
export function OnPlayerJoinGame(eventPlayer: mod.Player): void {
    const profile = PlayerProfile.Get(eventPlayer);
    if (profile) {
        profile.cash = GC.startingCash;
    }
}

export function OnPlayerLeaveGame(eventNumber: number): void {
    // Find and remove by ID
    const player = PlayerProfile.playerInstances.find(
        p => mod.GetObjId(p) === eventNumber
    );
    if (player) {
        PlayerProfile.Remove(player);
    }
}
```

**Source**: Both WarFactory and Skirmish use this pattern.

---

## 3. Multi-State Player Tracking

Track players in different game states using separate arrays.

```typescript
class PlayerProfile {
    // ... instance properties ...

    // Multiple tracking arrays
    static playerInstances: mod.Player[] = [];     // All players in game
    static deployedPlayers: mod.Player[] = [];      // Currently spawned
    static playersInRound: mod.Player[] = [];       // Active in combat
    static spectatingPlayers: mod.Player[] = [];    // Dead/spectating

    static AddToDeployed(player: mod.Player): void {
        if (!this.deployedPlayers.includes(player)) {
            this.deployedPlayers.push(player);
        }
    }

    static RemoveFromDeployed(player: mod.Player): void {
        const id = mod.GetObjId(player);
        this.deployedPlayers = this.deployedPlayers.filter(
            p => mod.GetObjId(p) !== id
        );
    }

    // Safe filtering (handles disconnected players)
    static CleanInvalidPlayers(): void {
        this.playerInstances = this.playerInstances.filter(player => {
            try {
                return player && mod.IsPlayerValid(player);
            } catch {
                return false;
            }
        });
        // Repeat for other arrays
    }
}
```

**Source**: Skirmish tracks `playerInstances`, `deployedPlayers`, `playersInRound`, `dyingPlayers`.

---

## 4. Team Data Tracking

For team-based games, track team state separately.

```typescript
class TeamData {
    team: mod.Team;
    teamIndex: number;
    score: number = 0;
    roundsWon: number = 0;
    totalCash: number = 0;

    constructor(teamIndex: number) {
        this.teamIndex = teamIndex;
        this.team = mod.GetTeam(teamIndex);
    }
}

// In GD class
class GD {
    static teamData: TeamData[] = [];

    static InitializeTeams(): void {
        for (let i = 1; i <= GC.teamCount; i++) {
            this.teamData.push(new TeamData(i));
        }
    }

    static GetTeamData(team: mod.Team): TeamData | undefined {
        return this.teamData.find(td =>
            mod.GetObjId(td.team) === mod.GetObjId(team)
        );
    }
}
```

**Source**: Both mods track team state this way.

---

## 5. Async Game Loops

Use infinite async loops for continuous state updates.

```typescript
// Fast tick (every frame)
async function TickUpdate(): Promise<void> {
    while (true) {
        // UI updates, position checks, etc.
        PlayerProfile.CleanInvalidPlayers();
        await mod.Wait(0);
    }
}

// Slow tick (periodic)
async function SlowTickUpdate(): Promise<void> {
    while (true) {
        // Income distribution, score updates
        if (GD.roundActive) {
            GD.teamData.forEach(td => {
                td.totalCash += calculateIncome(td);
            });
        }
        await mod.Wait(10);  // Every 10 seconds
    }
}

// Start loops in OnGameModeStarted
export async function OnGameModeStarted(): Promise<void> {
    GD.InitializeTeams();
    TickUpdate();       // Don't await - runs in background
    SlowTickUpdate();   // Don't await - runs in background
}
```

**Source**: WarFactory `ProgressionLoop()`, Skirmish `TickUpdate()`/`SlowTickUpdate()`.

---

## Function Reference

| Function | Signature | Purpose |
|----------|-----------|---------|
| `mod.GetObjId` | `(object: any): number` | Get stable ID for any object |
| `mod.IsPlayerValid` | `(player: mod.Player): boolean` | Check if player is still valid |
| `mod.GetTeam` | `(index: number): mod.Team` | Get team by index (1-4) |
| `mod.EndGameMode` | `(winningTeam: mod.Team): void` | End game with winner |
| `mod.Wait` | `(seconds: number): Promise<void>` | Async delay |

---

## Constraints

1. **Object IDs are stable** - Use `mod.GetObjId()` as dictionary keys, not player objects
2. **Players become invalid** - Always wrap player access in try-catch or check `mod.IsPlayerValid()`
3. **Teams cannot use ===** - Compare teams using `mod.GetObjId(team1) === mod.GetObjId(team2)`
4. **Async loops don't block** - Start loops without `await` to run in background

---

## Complete Minimal Example

```typescript
import * as mod from "@warp/sdk/mod";

// Configuration
class GC {
    static readonly startingCash: number = 500;
}

// Runtime state
class GD {
    static gameStarted: boolean = false;
}

// Player tracking
class PlayerProfile {
    player: mod.Player;
    cash: number = GC.startingCash;

    static #profiles: { [key: number]: PlayerProfile } = {};

    private constructor(player: mod.Player) {
        this.player = player;
    }

    static Get(player: mod.Player): PlayerProfile | undefined {
        const id = mod.GetObjId(player);
        if (id < 0) return undefined;
        if (!this.#profiles[id]) {
            this.#profiles[id] = new PlayerProfile(player);
        }
        return this.#profiles[id];
    }
}

// Event hooks
export async function OnGameModeStarted(): Promise<void> {
    GD.gameStarted = true;
}

export function OnPlayerJoinGame(eventPlayer: mod.Player): void {
    const profile = PlayerProfile.Get(eventPlayer);
    // Profile auto-created with starting cash
}

export function OnPlayerDied(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    const victim = PlayerProfile.Get(eventPlayer);
    const killer = PlayerProfile.Get(eventOtherPlayer);

    if (killer && victim && mod.GetObjId(eventPlayer) !== mod.GetObjId(eventOtherPlayer)) {
        killer.cash += 100;  // Kill reward
    }
}
```
