# Pattern: Multi-Team Setup

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: mods/Skirmish/Skirmish.ts:19, 159-200, 1483-1531, 2019-2030

---

## Overview

While most Battlefield modes use 2 teams, Portal supports up to 4 teams for Battle Royale, free-for-all variants, and custom modes. This pattern covers team initialization, player assignment with auto-balancing, and team number comparison using GetObjId.

---

## Core Concepts

### Team Indexing

Portal teams are accessed by index (1-4):

```typescript
mod.GetTeam(1)  // Team 1
mod.GetTeam(2)  // Team 2
mod.GetTeam(3)  // Team 3
mod.GetTeam(4)  // Team 4
```

### Team Comparison

**Critical**: Team objects cannot be compared with `===`. Always use `GetObjId`:

```typescript
// WRONG - Will not work
if (playerTeam === mod.GetTeam(1))

// RIGHT - Use GetObjId for comparison
if (mod.GetObjId(playerTeam) === mod.GetObjId(mod.GetTeam(1)))
```

---

## Working Code

### Team Data Structure

```typescript
// Source: mods/Skirmish/Skirmish.ts:1500-1531
class GD {
    static teamDataArray: TeamData[] = [];
}

class TeamData {
    score: number = 0;
    members: mod.Player[] = [];
    team: mod.Team;

    constructor(team: mod.Team) {
        this.team = team;
    }

    static Initialize(teams: mod.Team[]) {
        teams.forEach(team => {
            const teamData = new TeamData(team);
            GD.teamDataArray.push(teamData);
        });
    }

    AddTeamMember(member: mod.Player) {
        this.members.push(member);
    }

    static RefreshAllTeamMembers() {
        GD.teamDataArray.forEach(teamData => {
            teamData.members = teamData.members.filter(member =>
                PlayerProfile.playerInstances.includes(member)
            );
        });
    }
}
```

### Team Configuration

```typescript
// Source: mods/Skirmish/Skirmish.ts:1483-1489
class GC {
    static teamAmount = 4;
    static teamMemberCount: number[] = [0, 0, 0, 0];  // Track count per team
    static teamColors: mod.Vector[] = [
        mod.CreateVector(1, 0.1, 0),    // Team 1: Red
        mod.CreateVector(0, 1, 1),       // Team 2: Cyan
        mod.CreateVector(0.5, 0, 1),     // Team 3: Purple
        mod.CreateVector(0, 0.8, 0),     // Team 4: Green
        mod.CreateVector(0, 0, 0)        // Unused
    ];

    // Spawn point assignments per team (randomized at game start)
    static teamSpawnAssignments: number[] = [0, 0, 0, 0, 0]; // Team 0 unused
    static availableSpawnPoints: mod.Vector[] = [
        mod.CreateVector(-100, 190, -500),  // Spawn area 1
        mod.CreateVector(-400, 190, -500),  // Spawn area 2
        mod.CreateVector(-100, 190, -800),  // Spawn area 3
        mod.CreateVector(-400, 190, -800),  // Spawn area 4
    ];
}
```

### Initialization (OnGameModeStarted)

```typescript
// Source: mods/Skirmish/Skirmish.ts:19
export async function OnGameModeStarted() {
    // Initialize 4 teams
    TeamData.Initialize([
        mod.GetTeam(1),
        mod.GetTeam(2),
        mod.GetTeam(3),
        mod.GetTeam(4)
    ]);

    // Randomize spawn point assignments
    GS.RandomizeTeamSpawnAssignments();
}
```

### Player Team Assignment with Auto-Balancing

```typescript
// Source: mods/Skirmish/Skirmish.ts:159-185
async function TeamHandler(player: mod.Player) {
    let teamId = 1;

    // Find the minimum team count
    const lowestCount = Math.min(
        GC.teamMemberCount[0],
        GC.teamMemberCount[1],
        GC.teamMemberCount[2],
        GC.teamMemberCount[3]
    );

    // Find all teams with the lowest count
    const teamIndices = [0, 1, 2, 3];
    const teamsWithLowestCount = teamIndices.filter(i =>
        GC.teamMemberCount[i] === lowestCount
    );

    // Randomly select from teams with lowest count (for fairness)
    const randomIndex = Math.floor(Math.random() * teamsWithLowestCount.length);
    const selectedTeamIndex = teamsWithLowestCount[randomIndex];
    teamId = selectedTeamIndex + 1; // Convert to 1-based team number

    try {
        // Only change team if different from current
        if (mod.GetObjId(mod.GetTeam(teamId)) !== mod.GetObjId(mod.GetTeam(player))) {
            mod.SetTeam(player, mod.GetTeam(teamId));
            GC.teamMemberCount[selectedTeamIndex]++;
            console.log("Team member count: " + GC.teamMemberCount[selectedTeamIndex]);
        }
    } catch (error) {
        console.log("Error assigning team: " + error);
    }

    RefreshTeamMemberCount();
}
```

### Refresh Team Member Count

```typescript
// Source: mods/Skirmish/Skirmish.ts:187-200
function RefreshTeamMemberCount() {
    GC.teamMemberCount = [0, 0, 0, 0];
    const players = mod.AllPlayers();
    const n = mod.CountOf(players);

    for (let i = 0; i < n; i++) {
        const loopPlayer = mod.ValueInArray(players, i);
        if (mod.IsPlayerValid(loopPlayer)) {
            const teamId = H.GetTeamNumber(loopPlayer); // Returns 1-4
            GC.teamMemberCount[teamId - 1]++; // Convert to 0-3 index
        }
    }

    console.log("Team counts - T1: " + GC.teamMemberCount[0] +
                ", T2: " + GC.teamMemberCount[1] +
                ", T3: " + GC.teamMemberCount[2] +
                ", T4: " + GC.teamMemberCount[3]);
}
```

### GetTeamNumber Helper

```typescript
// Source: mods/Skirmish/Skirmish.ts:2019-2030
// Helper to get team number (1-4) from player or team object

class H {
    static GetTeamNumber(player?: mod.Player, team?: mod.Team): number {
        let teamId: mod.Team | undefined;

        if (player) teamId = mod.GetTeam(player);
        if (team) teamId = team;

        let teamInt = -1;

        if (teamId) {
            for (let i = 1; i <= GC.teamAmount; i++) {
                if (mod.GetObjId(teamId) === mod.GetObjId(mod.GetTeam(i))) {
                    teamInt = i;
                    break;
                }
            }
        }

        return teamInt;
    }
}

// Usage examples:
const playerTeamNum = H.GetTeamNumber(player);           // From player
const teamNum = H.GetTeamNumber(undefined, someTeam);    // From team object
```

### Team-Based Spawn Position

```typescript
// Source: mods/Skirmish/Skirmish.ts:1546-1596
class GS {
    // Randomize which team gets which spawn point
    static RandomizeTeamSpawnAssignments(): void {
        // Create array of available spawn point indices [0, 1, 2, 3]
        const availableIndices = Array.from(
            { length: GC.availableSpawnPoints.length },
            (_, i) => i
        );

        // Fisher-Yates shuffle
        for (let i = availableIndices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableIndices[i], availableIndices[j]] =
                [availableIndices[j], availableIndices[i]];
        }

        // Assign shuffled indices to teams 1-4
        for (let teamNumber = 1; teamNumber <= 4; teamNumber++) {
            GC.teamSpawnAssignments[teamNumber] = availableIndices[teamNumber - 1];
        }

        console.log("Team spawn assignments randomized:");
        for (let teamNumber = 1; teamNumber <= 4; teamNumber++) {
            const spawnIndex = GC.teamSpawnAssignments[teamNumber];
            const spawnPoint = GC.availableSpawnPoints[spawnIndex];
            console.log("Team " + teamNumber + " -> Spawn Point " + spawnIndex);
        }
    }

    // Get spawn position for a team with random offset
    static GetTeamSpawnPosition(teamNumber: number): mod.Vector {
        if (teamNumber < 1 || teamNumber > 4) {
            console.log("Invalid team number: " + teamNumber + ", defaulting to 1");
            teamNumber = 1;
        }

        const spawnPointIndex = GC.teamSpawnAssignments[teamNumber];
        const baseSpawnPoint = GC.availableSpawnPoints[spawnPointIndex];

        // Add random offset within radius
        const spawnRadius = 10;
        const angle = Math.random() * 2 * Math.PI;
        const distance = Math.random() * spawnRadius;

        const xOffset = Math.cos(angle) * distance;
        const zOffset = Math.sin(angle) * distance;

        return mod.CreateVector(
            mod.XComponentOf(baseSpawnPoint) + xOffset,
            mod.YComponentOf(baseSpawnPoint) + 50, // Height for parachute drop
            mod.ZComponentOf(baseSpawnPoint) + zOffset
        );
    }
}
```

### Team-Based Victory Check

```typescript
// Source: mods/Skirmish/Skirmish.ts:244-307 (adapted)
async function CheckForLastTeamStanding(): Promise<void> {
    const aliveTeams: number[] = [];

    // Check each team (1-4)
    for (let teamId = 1; teamId <= 4; teamId++) {
        let hasAlivePlayer = false;

        // Check if any player on this team is alive
        PlayerProfile.playersInRound.forEach(player => {
            try {
                if (!mod.IsPlayerValid(player)) return;

                if (H.GetTeamNumber(player) === teamId &&
                    mod.GetSoldierState(player, mod.SoldierStateBool.IsAlive)) {
                    hasAlivePlayer = true;
                }
            } catch (error) {
                console.log(`Error checking player: ${error}`);
            }
        });

        if (hasAlivePlayer) {
            aliveTeams.push(teamId);
        }
    }

    // Victory condition: only one team remains
    if (aliveTeams.length === 1) {
        const winningTeamId = aliveTeams[0];
        console.log(`Team ${winningTeamId} wins!`);

        // Update score
        GD.teamDataArray[winningTeamId - 1].score++;

        // Award rewards to winning team
        PlayerProfile.playerInstances.forEach(player => {
            if (H.GetTeamNumber(player) === winningTeamId) {
                // Award win bonus
            }
        });
    }
}
```

### Team-Specific World Icons

```typescript
// Source: mods/Skirmish/Skirmish.ts:108-111
// Set world icons visible only to specific teams

mod.SetWorldIconOwner(mod.GetWorldIcon(0), mod.GetTeam(1));  // Team 1 only
mod.SetWorldIconOwner(mod.GetWorldIcon(1), mod.GetTeam(2));  // Team 2 only
mod.SetWorldIconOwner(mod.GetWorldIcon(2), mod.GetTeam(3));  // Team 3 only
mod.SetWorldIconOwner(mod.GetWorldIcon(3), mod.GetTeam(4));  // Team 4 only
```

---

## Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| `GetTeam` | `(playerOrIndex: Player \| number): Team` | Get team by index or from player |
| `SetTeam` | `(player: Player, team: Team): void` | Assign player to team |
| `GetObjId` | `(object: any): number` | Get unique ID for comparison |
| `AllPlayers` | `(): Player[]` | Get all connected players |
| `CountOf` | `(array: any[]): number` | Get array length |
| `ValueInArray` | `(array: any[], index: number): any` | Get array element |
| `IsPlayerValid` | `(player: Player): boolean` | Check if player reference valid |
| `SetWorldIconOwner` | `(icon: WorldIcon, team: Team): void` | Set icon visibility to team |

---

## Team Management Patterns

### Pattern 1: Equal Distribution (Round-Robin)

```typescript
// Simple alternating assignment
let nextTeam = 1;

function AssignTeamRoundRobin(player: mod.Player): void {
    mod.SetTeam(player, mod.GetTeam(nextTeam));
    nextTeam = (nextTeam % 4) + 1;  // Cycle 1 -> 2 -> 3 -> 4 -> 1
}
```

### Pattern 2: Random with Balance Check

```typescript
// Random but ensures no team gets too far ahead
const MAX_IMBALANCE = 2;

function AssignTeamBalanced(player: mod.Player): void {
    RefreshTeamMemberCount();

    const minCount = Math.min(...GC.teamMemberCount);
    const validTeams = GC.teamMemberCount
        .map((count, i) => ({ team: i + 1, count }))
        .filter(t => t.count <= minCount + MAX_IMBALANCE);

    const selected = validTeams[Math.floor(Math.random() * validTeams.length)];
    mod.SetTeam(player, mod.GetTeam(selected.team));
}
```

### Pattern 3: Squad-Based (Keep Friends Together)

```typescript
// Assign player to same team as first friend
function AssignTeamWithSquad(player: mod.Player, squadMates: mod.Player[]): void {
    if (squadMates.length > 0 && mod.IsPlayerValid(squadMates[0])) {
        const squadTeam = mod.GetTeam(squadMates[0]);
        mod.SetTeam(player, squadTeam);
    } else {
        // No squad, use balanced assignment
        TeamHandler(player);
    }
}
```

---

## Constraints & Gotchas

1. **Team Comparison**: Never use `===` for team comparison:
   ```typescript
   // WRONG
   if (team1 === team2)

   // RIGHT
   if (mod.GetObjId(team1) === mod.GetObjId(team2))
   ```

2. **Index Conversion**: Teams are 1-indexed, arrays are 0-indexed:
   ```typescript
   const teamNumber = 3;           // Team 3
   const arrayIndex = teamNumber - 1;  // Index 2
   GC.teamMemberCount[arrayIndex]++;
   ```

3. **Player Validity**: Always check before team operations:
   ```typescript
   if (mod.IsPlayerValid(player)) {
       mod.SetTeam(player, mod.GetTeam(teamId));
   }
   ```

4. **Godot Setup**: Multi-team modes may require configuring spawn points and objectives for each team in the Godot editor.

5. **Team Color UI**: Update UI elements when showing team colors:
   ```typescript
   const teamNum = H.GetTeamNumber(player);
   const teamColor = GC.teamColors[teamNum - 1];
   mod.SetUIWidgetBgColor(widget, teamColor);
   ```

---

## Integration with Other Patterns

- **Spawning** (`patterns/player/spawning.md`): Team-specific spawn points and HQs
- **Scoring** (`patterns/gameplay/scoring.md`): Per-team score tracking
- **World Icons** (`patterns/spatial/world-icons.md`): Team-visible markers
- **Ring of Fire** (`patterns/gameplay/ring-of-fire.md`): Check surviving teams
- **UI Widgets** (`patterns/ui/widgets.md`): Team indicators and scoreboards
