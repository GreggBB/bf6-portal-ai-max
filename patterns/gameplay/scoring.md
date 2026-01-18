# Pattern: Scoring Systems

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/CustomConquest (Portal Blocks), mods/WarFactory/WarFactory.ts, code/mod/index.d.ts

---

## Overview

The Portal SDK provides scoring at two levels:
1. **Game Mode Score** - Built-in team/player scoring visible on default scoreboard
2. **Custom Scoreboard** - Full control over columns, values, and display

---

## Game Mode Score

### Setting/Getting Scores

```typescript
// Set team score
mod.SetGameModeScore(mod.GetTeam(1), 500);
mod.SetGameModeScore(mod.GetTeam(2), 450);

// Set player score
mod.SetGameModeScore(player, 100);

// Get scores
const teamScore: number = mod.GetGameModeScore(mod.GetTeam(1));
const playerScore: number = mod.GetGameModeScore(player);
```

### Target Score (Victory Condition)

```typescript
// Set the score needed to win
mod.SetGameModeTargetScore(1000);

// Game will end when a team reaches this score
```

### Time Limit

```typescript
// Set match time limit in seconds
mod.SetGameModeTimeLimit(1800); // 30 minutes

// Get remaining time
const remaining: number = mod.GetMatchTimeRemaining();

// Get elapsed time
const elapsed: number = mod.GetMatchTimeElapsed();

// Pause/resume game timer
mod.PauseGameModeTime(true);  // Pause
mod.PauseGameModeTime(false); // Resume
```

---

## Custom Scoreboard

### Scoreboard Types

```typescript
// Switch to custom scoreboard for full control
mod.SetScoreboardType(mod.ScoreboardType.Custom);

// Available types:
export enum ScoreboardType {
    Custom,    // Full custom control
    // Other types may exist - check index.d.ts
}
```

### Setting Up Custom Scoreboard

```typescript
// Set header names (top of scoreboard)
mod.SetScoreboardHeader(mod.Message('team1_name'), mod.Message('team2_name'));
// Or single header:
mod.SetScoreboardHeader(mod.Message('scoreboard_title'));

// Set column names (up to 5 columns)
mod.SetScoreboardColumnNames(
    mod.Message('kills'),
    mod.Message('deaths'),
    mod.Message('score'),
    mod.Message('assists'),
    mod.Message('revives')
);

// Set column widths (relative proportions)
mod.SetScoreboardColumnWidths(1, 1, 1.5, 1, 1);

// Set sorting column (1-indexed, ascending by default)
mod.SetScoreboardSorting(3);         // Sort by column 3
mod.SetScoreboardSorting(3, true);   // Sort descending
```

### Updating Player Values

```typescript
// Update a player's scoreboard values
mod.SetScoreboardPlayerValues(
    player,
    10,    // Column 1: Kills
    5,     // Column 2: Deaths
    1500,  // Column 3: Score
    3,     // Column 4: Assists
    2      // Column 5: Revives
);

// Can update fewer columns
mod.SetScoreboardPlayerValues(player, kills, deaths, score);
mod.SetScoreboardPlayerValues(player, kills, deaths);
mod.SetScoreboardPlayerValues(player, kills);
```

### Working Example: BombSquad Scoreboard

From `mods/BombSquad/BombSquad.ts`:

```typescript
// Track player stats in a class
class JsPlayer {
    player: mod.Player;
    kills: number = 0;
    deaths: number = 0;
    cash: number = 0;
    totalCashEarned: number = 0;

    updateScoreboard(): void {
        mod.SetScoreboardPlayerValues(
            this.player,
            this.kills,
            this.deaths,
            this.totalCashEarned,
            this.totalCashEarned - this.cash + 800, // Spent
            0 // Reserved
        );
    }
}
```

---

## Ticket Bleed System (Conquest)

The CustomConquest mod implements classic Battlefield ticket bleed:

### Core Concept

- Each team has a ticket count (usually starting at 500-1000)
- Teams lose tickets when:
  1. Players die (optional)
  2. Enemy holds more capture points (ticket bleed)
  3. Enemy holds ALL capture points (total control bonus)

### Implementation Pattern

```typescript
// Global state
let team1Tickets: number = 500;
let team2Tickets: number = 500;
const bleedRate: number = 1;           // Tickets lost per tick
const totalControlBonus: number = 2;   // Extra bleed when enemy holds all points
const bleedInterval: number = 5;       // Seconds between bleeds

// Configuration flags
const enableDeathTicketLoss: boolean = true;
const enableTotalControlBonus: boolean = true;
const bleedBothTeams: boolean = false; // true = both bleed, false = only losing team

// Count flags per team
function CountFlagsForTeam(team: mod.Team): number {
    const allPoints = mod.AllCapturePoints();
    let count = 0;
    const teamId = mod.GetObjId(team);

    for (let i = 0; i < mod.CountOf(allPoints); i++) {
        const point = mod.ValueInArray(allPoints, i) as mod.CapturePoint;
        const owner = mod.GetCurrentOwnerTeam(point);
        if (mod.GetObjId(owner) === teamId) {
            count++;
        }
    }
    return count;
}

// Ticket bleed loop
async function TicketBleedLoop(): Promise<void> {
    while (true) {
        await mod.Wait(bleedInterval);

        const team1Flags = CountFlagsForTeam(mod.GetTeam(1));
        const team2Flags = CountFlagsForTeam(mod.GetTeam(2));
        const totalFlags = mod.CountOf(mod.AllCapturePoints());

        if (team1Flags > team2Flags) {
            // Team 2 bleeds
            let bleed = bleedRate;
            if (enableTotalControlBonus && team1Flags === totalFlags) {
                bleed += totalControlBonus;
            }
            team2Tickets -= bleed;

            if (bleedBothTeams) {
                team1Tickets -= bleedRate;
            }
        } else if (team2Flags > team1Flags) {
            // Team 1 bleeds
            let bleed = bleedRate;
            if (enableTotalControlBonus && team2Flags === totalFlags) {
                bleed += totalControlBonus;
            }
            team1Tickets -= bleed;

            if (bleedBothTeams) {
                team2Tickets -= bleedRate;
            }
        }
        // Equal flags = no bleed

        // Update game mode score to show tickets
        mod.SetGameModeScore(mod.GetTeam(1), team1Tickets);
        mod.SetGameModeScore(mod.GetTeam(2), team2Tickets);

        // Check for victory
        if (team1Tickets <= 0 || team2Tickets <= 0) {
            EndGame();
            break;
        }
    }
}
```

### Death Ticket Loss

```typescript
export function OnPlayerDied(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void {
    if (!enableDeathTicketLoss) return;

    const playerTeam = mod.GetTeam(eventPlayer);
    const teamId = mod.GetObjId(playerTeam);

    if (teamId === 1) {
        team1Tickets -= 1;
        mod.SetGameModeScore(mod.GetTeam(1), team1Tickets);
    } else if (teamId === 2) {
        team2Tickets -= 1;
        mod.SetGameModeScore(mod.GetTeam(2), team2Tickets);
    }
}
```

---

## End of Round Handling

### Detecting Victory

```typescript
function CheckVictoryCondition(): boolean {
    // Score-based victory
    const team1Score = mod.GetGameModeScore(mod.GetTeam(1));
    const team2Score = mod.GetGameModeScore(mod.GetTeam(2));

    if (team1Score <= 0) {
        AnnounceVictory(mod.GetTeam(2));
        return true;
    }
    if (team2Score <= 0) {
        AnnounceVictory(mod.GetTeam(1));
        return true;
    }

    return false;
}

function AnnounceVictory(winningTeam: mod.Team): void {
    const losingTeam = mod.GetTeam(mod.GetObjId(winningTeam) === 1 ? 2 : 1);

    // Play victory/defeat VO
    mod.PlayVO(
        mod.RuntimeSpawn_Common.VO,
        mod.VoiceOverEvents2D.GlobalEOMVictory,
        mod.VoiceOverFlags.Alpha,
        winningTeam
    );
    mod.PlayVO(
        mod.RuntimeSpawn_Common.VO,
        mod.VoiceOverEvents2D.GlobalEOMDefeat,
        mod.VoiceOverFlags.Alpha,
        losingTeam
    );

    // Play victory/defeat music
    mod.PlayMusic(mod.MusicEvents.Core_EOR_Victory, winningTeam);
    mod.PlayMusic(mod.MusicEvents.Core_EOR_Defeat, losingTeam);
}
```

### Game Mode Ending Event

```typescript
export function OnGameModeEnding(): void {
    // Clean up UI, stop loops, etc.
    console.log("Game ending");
}
```

---

## Sorted Arrays by Score

The SDK provides a utility for sorting players by score:

```typescript
// Sort all players by their game mode score (ascending)
const sortedPlayers = mod.SortedArray(
    mod.AllPlayers(),
    mod.GetGameModeScore(mod.CurrentArrayElement() as mod.Player)
);

// For descending order, you'll need to reverse or negate values
```

---

## Function Reference

### Game Mode Score

| Function | Signature | Description |
|----------|-----------|-------------|
| `SetGameModeScore` | `(target: Team\|Player, score: number): void` | Set score |
| `GetGameModeScore` | `(target: Team\|Player): number` | Get score |
| `SetGameModeTargetScore` | `(score: number): void` | Set victory threshold |
| `SetGameModeTimeLimit` | `(seconds: number): void` | Set match duration |
| `GetMatchTimeRemaining` | `(): number` | Get remaining seconds |
| `GetMatchTimeElapsed` | `(): number` | Get elapsed seconds |
| `PauseGameModeTime` | `(pause: boolean): void` | Pause/resume timer |

### Custom Scoreboard

| Function | Signature | Description |
|----------|-----------|-------------|
| `SetScoreboardType` | `(type: ScoreboardType): void` | Switch scoreboard mode |
| `SetScoreboardHeader` | `(name: Message): void` | Set header text |
| `SetScoreboardHeader` | `(team1: Message, team2: Message): void` | Set team headers |
| `SetScoreboardColumnNames` | `(...names: Message[]): void` | Set column headers (1-5) |
| `SetScoreboardColumnWidths` | `(...widths: number[]): void` | Set column widths (1-5) |
| `SetScoreboardPlayerValues` | `(player: Player, ...values: number[]): void` | Set player row values (1-5) |
| `SetScoreboardSorting` | `(column: number, descending?: boolean): void` | Set sort column |

---

## Constraints

1. **Custom Scoreboard Limits**: Maximum 5 columns for player values
2. **Message Keys**: All scoreboard text uses `mod.Message()` requiring `.strings.json` entries
3. **Score Updates**: Call `SetGameModeScore` frequently for responsive UI
4. **Ticket Overflow**: No built-in clamping; handle negative/max values manually
5. **Performance**: Very frequent score updates may impact performance

---

## Related Patterns

- [Capture Points](capture-points.md) - Awarding score on capture
- [Economy](economy.md) - Separate cash tracking from game score
- [Audio](../audio/audio.md) - Victory/defeat announcements
- [UI: Widgets](../ui/widgets.md) - Custom score displays
