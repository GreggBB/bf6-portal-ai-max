# Pattern: Custom Notifications

> SDK Version: 1.1.3.0 (Battlefield 6)
> Source: code/mod/index.d.ts:226-232, 22937-22970

---

## Overview

Custom notifications provide persistent text slots on the player's HUD, separate from the standard notification system. Unlike `DisplayNotificationMessage` which shows brief popups, custom notifications stay on screen until cleared or their duration expires.

There are 5 slots available: a header and 4 message lines.

---

## Available Slots

```typescript
// Source: code/mod/index.d.ts:226-232
export enum CustomNotificationSlots {
    HeaderText,     // Slot 0 - Header/title area
    MessageText1,   // Slot 1 - First message line
    MessageText2,   // Slot 2 - Second message line
    MessageText3,   // Slot 3 - Third message line
    MessageText4,   // Slot 4 - Fourth message line
}
```

---

## Functions

| Function | Signature | Description |
|----------|-----------|-------------|
| `DisplayCustomNotificationMessage` | `(msg: Message, slot: CustomNotificationSlots, duration: number): void` | Display to all players |
| `DisplayCustomNotificationMessage` | `(msg: Message, slot: CustomNotificationSlots, duration: number, target: Player): void` | Display to specific player |
| `DisplayCustomNotificationMessage` | `(msg: Message, slot: CustomNotificationSlots, duration: number, target: Team): void` | Display to specific team |
| `ClearCustomNotificationMessage` | `(slot: CustomNotificationSlots): void` | Clear slot for all players |
| `ClearCustomNotificationMessage` | `(slot: CustomNotificationSlots, target: Player): void` | Clear slot for specific player |
| `ClearCustomNotificationMessage` | `(slot: CustomNotificationSlots, target: Team): void` | Clear slot for specific team |
| `ClearAllCustomNotificationMessages` | `(target: Player): void` | Clear all slots for a player |

---

## Working Code

### Display Custom Notification to All Players

```typescript
// Show a header message for 10 seconds
mod.DisplayCustomNotificationMessage(
    mod.Message("roundStarting"),
    mod.CustomNotificationSlots.HeaderText,
    10
);

// Show additional info in message slots
mod.DisplayCustomNotificationMessage(
    mod.Message("objective1"),
    mod.CustomNotificationSlots.MessageText1,
    10
);

mod.DisplayCustomNotificationMessage(
    mod.Message("objective2"),
    mod.CustomNotificationSlots.MessageText2,
    10
);
```

### Display to Specific Player

```typescript
export function OnPlayerDeployed(eventPlayer: mod.Player): void {
    // Show player-specific notification
    mod.DisplayCustomNotificationMessage(
        mod.Message("welcomePlayer"),
        mod.CustomNotificationSlots.HeaderText,
        5,
        eventPlayer
    );
}
```

### Display to Team

```typescript
function NotifyTeamObjective(team: mod.Team, objectiveKey: string) {
    mod.DisplayCustomNotificationMessage(
        mod.Message(objectiveKey),
        mod.CustomNotificationSlots.HeaderText,
        8,
        team
    );
}

// Usage
NotifyTeamObjective(mod.GetTeam(1), "attackObjective");
NotifyTeamObjective(mod.GetTeam(2), "defendObjective");
```

### Clear Notifications

```typescript
// Clear a specific slot for all players
mod.ClearCustomNotificationMessage(mod.CustomNotificationSlots.HeaderText);

// Clear a specific slot for one player
mod.ClearCustomNotificationMessage(mod.CustomNotificationSlots.MessageText1, eventPlayer);

// Clear all slots for a player
mod.ClearAllCustomNotificationMessages(eventPlayer);
```

### Multi-Line Notification Pattern

```typescript
function ShowObjectiveBriefing(player: mod.Player, duration: number) {
    // Clear any existing notifications first
    mod.ClearAllCustomNotificationMessages(player);

    // Display header and multiple message lines
    mod.DisplayCustomNotificationMessage(
        mod.Message("missionBriefing"),
        mod.CustomNotificationSlots.HeaderText,
        duration,
        player
    );

    mod.DisplayCustomNotificationMessage(
        mod.Message("briefingLine1"),
        mod.CustomNotificationSlots.MessageText1,
        duration,
        player
    );

    mod.DisplayCustomNotificationMessage(
        mod.Message("briefingLine2"),
        mod.CustomNotificationSlots.MessageText2,
        duration,
        player
    );

    mod.DisplayCustomNotificationMessage(
        mod.Message("briefingLine3"),
        mod.CustomNotificationSlots.MessageText3,
        duration,
        player
    );
}
```

---

## Strings.json Setup

Custom notification messages require entries in your `.strings.json` file:

```json
{
    "roundStarting": "Round Starting",
    "objective1": "Capture Point A",
    "objective2": "Defend the base",
    "welcomePlayer": "Welcome to the match!",
    "missionBriefing": "MISSION BRIEFING",
    "briefingLine1": "Primary: Capture all objectives",
    "briefingLine2": "Secondary: Eliminate enemy forces",
    "briefingLine3": "Time limit: 10 minutes"
}
```

---

## Constraints & Gotchas

1. **5 Slots Maximum**: You have exactly 5 notification slots. Plan your HUD layout accordingly.

2. **Duration is in Seconds**: The duration parameter is in seconds, not milliseconds.

3. **Overwriting**: Displaying a new message to a slot overwrites any existing message in that slot.

4. **No ClearAll for Global**: `ClearAllCustomNotificationMessages` requires a specific player target. To clear all for everyone:
   ```typescript
   const players = mod.AllPlayers();
   for (let i = 0; i < mod.CountOf(players); i++) {
       const player = mod.ValueInArray(players, i);
       mod.ClearAllCustomNotificationMessages(player);
   }
   ```

5. **Different from DisplayNotificationMessage**:
   - `DisplayNotificationMessage` = brief popup notifications
   - `DisplayCustomNotificationMessage` = persistent HUD text slots

6. **Message Objects Required**: Always use `mod.Message("key")` with string keys from your `.strings.json`.

---

## Use Cases

- **Mission briefings** - Show multi-line instructions at round start
- **Persistent objectives** - Display current objective that stays on screen
- **Team-specific information** - Different messages for attackers vs defenders
- **Player tutorials** - Context-sensitive help for individual players
- **Score/status displays** - Show running totals or status updates

---

## Integration with Other Patterns

- [widgets.md](widgets.md) - For more complex custom HUD elements
- [../gameplay/rounds.md](../gameplay/rounds.md) - Display phase information
- [../gameplay/scoring.md](../gameplay/scoring.md) - Show score updates
