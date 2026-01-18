# Pattern: Round System

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/BombSquad/BombSquad.ts:1-150, 451-796
> Source: mods/Skirmish/Skirmish.ts:1663-1860

---

## Overview

Round-based game modes require managing game phases (buy phase, combat, end), timers, team switches, and victory conditions. This pattern covers the state management and timing functions used in BombSquad and Skirmish.

---

## Core Concepts

### Round State Variables

```typescript
// Source: mods/BombSquad/BombSquad.ts:14-31
let roundNum: number = 0;
let roundTime: number = 300;          // Max time for round in seconds
let buyPhaseTimeRemaining: number = 60;
let roundStarted: boolean = false;
let roundEnded: boolean = false;
let buyPhase: boolean = false;

const buyPhaseLength: number = 35;
const roundEndBuffer: number = 10;
const maxRounds: number = 14;
const maxRoundTime: number = 300;
```

### Team Score Tracking

```typescript
// Source: mods/BombSquad/BombSquad.ts:26-29
let team1Score: number = 0;
let team2Score: number = 0;
let attackingTeam: mod.Team = mod.GetTeam(1);
let defendingTeam: mod.Team = mod.GetTeam(2);
```

---

## Working Code

### Round Setup (Buy Phase Start)

```typescript
// Source: mods/BombSquad/BombSquad.ts:451-577
async function SetupRound() {
    roundNum++;
    console.log("Set up Round ", roundNum);
    roundEnded = false;
    buyPhase = true;

    // Handle team switching at halftime
    let teamsSwitched: boolean = roundNum == maxRounds / 2 + 1;
    if (teamsSwitched) {
        SwitchTeams();
    }

    // Reset player positions - teleport to HQ
    JsPlayer.playerInstances.forEach(player => {
        let teamID = mod.GetObjId(mod.GetTeam(player));
        let attackingTeamID = mod.GetObjId(attackingTeam);

        if (teamID == attackingTeamID) {
            let hqPos: mod.Vector = mod.GetObjectPosition(attackersHQ);
            mod.Teleport(player, hqPos, 0);
        } else {
            let hqPos: mod.Vector = mod.GetObjectPosition(defendersHQ);
            mod.Teleport(player, hqPos, 0);
        }
    });

    // Buy phase countdown loop
    buyPhaseTimeRemaining = buyPhaseLength;
    while (buyPhaseTimeRemaining > 0) {
        await mod.Wait(1);
    }

    // Transition to combat
    roundTime = maxRoundTime;
    buyPhase = false;
    roundStarted = true;
}
```

### Round Timer (Throttled Update Loop)

```typescript
// Source: mods/BombSquad/BombSquad.ts:244-260
async function ThrottledUpdate() {
    while (true) {
        if (!gameOver) {
            if (roundStarted && !roundEnded) {
                roundTime--;

                // Update timer UI
                UpdateTimerUI();

                // Check for timeout
                if (roundTime <= 0) {
                    EndRound(defendingTeam); // Defenders win on timeout
                }
            }

            if (buyPhase) {
                buyPhaseTimeRemaining--;
            }
        }
        await mod.Wait(1);
    }
}
```

### End Round

```typescript
// Source: mods/BombSquad/BombSquad.ts:727-796
async function EndRound(winners: mod.Team): Promise<void> {
    let winningTeamID: number = mod.GetObjId(winners);
    roundEnded = true;

    // Update scores
    if (winningTeamID == mod.GetObjId(attackingTeam)) {
        if (teamSwitchOccurred) {
            team2Score++;
        } else {
            team1Score++;
        }
    } else {
        if (teamSwitchOccurred) {
            team1Score++;
        } else {
            team2Score++;
        }
    }

    // Award money based on win/loss
    JsPlayer.playerInstances.forEach(player => {
        let jsPlayer = JsPlayer.get(player);
        if (jsPlayer) {
            if (mod.GetObjId(mod.GetTeam(player)) == winningTeamID) {
                jsPlayer.cash += roundWinReward;  // 2400
            } else {
                jsPlayer.cash += roundLoseReward; // 1200
            }
        }
    });

    await mod.Wait(roundEndBuffer);
    roundStarted = false;

    // Check for game over
    if (CheckVictoryState()) {
        return;
    }

    // Start next round
    SetupRound();
}
```

### Team Switching (Halftime)

```typescript
// Source: mods/BombSquad/BombSquad.ts:798-819
function SwitchTeams(): void {
    console.log("SWITCH TEAMS");

    if (mod.GetObjId(attackingTeam) == mod.GetObjId(mod.GetTeam(1))) {
        defendingTeam = mod.GetTeam(1);
        attackingTeam = mod.GetTeam(2);
        teamSwitchOccurred = true;
    } else {
        defendingTeam = mod.GetTeam(2);
        attackingTeam = mod.GetTeam(1);
        teamSwitchOccurred = false;
    }

    // Undeploy all players for role switch
    mod.UndeployAllPlayers();
}
```

### Victory Check

```typescript
// Source: mods/BombSquad/BombSquad.ts:847-860
function CheckVictoryState(): boolean {
    let scoreToWin = maxRounds / 2 + 1;

    if (team1Score >= scoreToWin) {
        mod.EndGameMode(defendingTeam);
        return true;
    } else if (team2Score >= scoreToWin) {
        mod.EndGameMode(attackingTeam);
        return true;
    }
    return false;
}
```

### Pre-Round / Round Transition (Skirmish Pattern)

```typescript
// Source: mods/Skirmish/Skirmish.ts:1663-1814
class GS {
    static async StartPreRound() {
        GD.isInPreRound = true;
        mod.EnableAllPlayerDeploy(true);

        // Make players invincible during pre-round
        PlayerProfile.deployedPlayers.forEach(player => {
            if (!mod.GetSoldierState(player, mod.SoldierStateBool.IsAISoldier)) {
                mod.SetPlayerMaxHealth(player, 900.0);
            }
        });

        GD.currentRound += 1;
        console.log("Starting round: ", GD.currentRound);

        // Run countdown
        await GS.RunCountdownLoop();
    }

    static async StartRound() {
        GD.isInPreRound = false;
        GD.roundActive = true;

        // Reset health when round starts
        PlayerProfile.playerInstances.forEach(player => {
            mod.SetPlayerMaxHealth(player, 100.0);
        });

        // Disable deployment during active round
        mod.DisablePlayerJoin();
        mod.EnableAllPlayerDeploy(false);
        mod.SetSpawnMode(mod.SpawnModes.Spectating);
    }

    static async EndRound() {
        GD.roundActive = false;

        await mod.Wait(2.0);

        // Reset player health before undeploying
        PlayerProfile.playersInRound.forEach(player => {
            mod.SetPlayerMaxHealth(player, 100.0);
        });
    }
}
```

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `GetTeam` | `(playerOrIndex: Player \| number): Team` | Get team by index (1, 2, etc.) |
| `GetObjId` | `(object: any): number` | Get unique object ID for comparison |
| `Teleport` | `(player: Player, position: Vector, facingAngle: number): void` | Move player to position |
| `Wait` | `(seconds: number): Promise<void>` | Async delay (use in async functions) |
| `EndGameMode` | `(winningTeam: Team): void` | End the match with a winner |
| `UndeployAllPlayers` | `(): void` | Force all players back to deploy screen |
| `EnableAllPlayerDeploy` | `(enable: boolean): void` | Allow/prevent all players from deploying |
| `SetSpawnMode` | `(mode: SpawnModes): void` | Set spawn behavior |
| `DisablePlayerJoin` | `(): void` | Prevent new players from joining |
| `SetPlayerMaxHealth` | `(player: Player, health: number): void` | Set player's max health |
| `GetObjectPosition` | `(object: Object): Vector` | Get position of spatial object |

### SpawnModes Enum

```typescript
export enum SpawnModes {
    AutoSpawn,   // Players spawn automatically
    Deploy,      // Players choose when to deploy
    Spectating,  // Dead players spectate (no respawn)
}
```

---

## State Machine Pattern

Round-based modes follow this state flow:

```
OnGameModeStarted
      │
      ▼
┌─────────────┐
│ PRE-ROUND   │  ← buyPhase = true
│ (Buy Phase) │    Players can purchase, invincible
└─────────────┘
      │ buyPhaseTimeRemaining = 0
      ▼
┌─────────────┐
│   ROUND     │  ← roundStarted = true, buyPhase = false
│  (Combat)   │    Timer counts down, players fight
└─────────────┘
      │ Timer expires OR victory condition met
      ▼
┌─────────────┐
│ END ROUND   │  ← roundEnded = true
│  (Buffer)   │    Display results, award rewards
└─────────────┘
      │
      ├──────────────┐
      ▼              ▼
CheckVictoryState  SetupRound (next round)
      │
      ▼
EndGameMode (if won)
```

---

## Constraints & Gotchas

1. **Team Comparison**: Always use `mod.GetObjId()` when comparing teams:
   ```typescript
   // WRONG
   if (playerTeam === attackingTeam)

   // RIGHT
   if (mod.GetObjId(playerTeam) === mod.GetObjId(attackingTeam))
   ```

2. **Async Timing**: `mod.Wait()` only works in `async` functions. The main game loop must be async:
   ```typescript
   export async function OnGameModeStarted() {
       await mod.Wait(1); // OK
   }
   ```

3. **Player Validity**: Players can leave mid-round. Always check validity:
   ```typescript
   if (mod.IsPlayerValid(player) && mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) {
       // Safe to operate on player
   }
   ```

4. **Undeploy Before Team Switch**: When switching teams, undeploy all players first to avoid position issues.

5. **Round Buffer**: Always add a buffer between round end and next round start for UI display.

---

## Integration with Other Patterns

- **Economy** (`patterns/gameplay/economy.md`): Award cash on round win/loss, kills
- **Equipment** (`patterns/player/equipment.md`): Reset/refill loadouts between rounds
- **Spawning** (`patterns/player/spawning.md`): Control deployment during phases
- **UI Widgets** (`patterns/ui/widgets.md`): Display timers, round info, scores
