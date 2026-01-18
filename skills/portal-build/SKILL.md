# /portal:build

> **Version**: 1.0.0
> **Invocation**: `/portal:build`
> **Agent**: `portal-builder`

---

## Description

Build complete Portal mod code from verified patterns. Assembles working TypeScript code with proper GC/GD structure, verified `mod.*` functions, and source citations.

---

## Usage

```
/portal:build [mod name]
```

Then provide:
1. **Requirements** - What the mod should do
2. **Pattern paths** - Which patterns to use (from Researcher)
3. **Custom logic** - Any special requirements (optional)

---

## Input Format

```
/portal:build RacingMod

Requirements:
- Checkpoint-based racing
- 3 laps to win
- Time display for each player
- Vehicle-only (no on-foot)

Patterns:
- gameplay/checkpoints.md
- gameplay/vehicles.md
- ui/notifications.md

Custom:
- Boost pads at specific locations
```

---

## Output

Returns complete, ready-to-use code:

````markdown
# Built: [Mod Name]

## [ModName].ts
```typescript
[Complete code with citations]
```

## [ModName].strings.json
```json
[Strings file]
```

## Godot Requirements
| Object | Type | ObjId | Purpose |
|--------|------|-------|---------|
| ...    | ...  | ...   | ...     |

## Verification Summary
- Functions verified: [count]
- Patterns used: [list]
- Custom implementations: [count]
````

---

## Agent Spawn Configuration

```yaml
agent: portal-builder
definition: agents/portal-builder.md
subagent_type: portal-builder

input:
  - Mod name
  - Requirements list
  - Pattern paths to use
  - Custom logic (optional)

output:
  - Complete .ts file
  - Complete .strings.json
  - Godot requirements table
  - Verification summary

context_impact: moderate-high
  - Returns 500-2000 lines typically
  - All code verified before output
```

---

## Spawn Prompt Template

When invoked, spawn the agent with this prompt structure:

```
You are the Portal Builder Agent. Your instructions are in:
Battlefield Portal SDK/agents/portal-builder.md

Read your instructions, then build the following mod:

---
MOD NAME: [name]

REQUIREMENTS:
[user requirements]

PATTERNS TO USE:
[pattern paths]

CUSTOM LOGIC:
[custom requirements or "None"]
---

Build the complete mod following your instructions. Verify EVERY mod.* function before use.
```

---

## Examples

### Example 1: Simple Mod

**Input**:
```
/portal:build WelcomeMod

Requirements:
- Welcome message when players join
- Team assignment notification
- Kill notifications

Patterns:
- ui/notifications.md
- core/game-lifecycle.md
```

**Output**:
````markdown
# Built: WelcomeMod

## WelcomeMod.ts

```typescript
/**
 * WelcomeMod
 * Displays welcome messages and notifications
 *
 * Built using Portal SDK patterns:
 * - ui/notifications.md
 * - core/game-lifecycle.md
 */

// ============================================================================
// GAME CONSTANTS (GC)
// ============================================================================

const GC = {
    initialized: false,
};

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

// Source: core/game-lifecycle.md
export function OnGameModeStarted(): void {
    GC.initialized = true;
}

// Source: core/game-lifecycle.md
export function OnPlayerJoinGame(eventPlayer: mod.Player): void {
    // Source: ui/notifications.md
    mod.DisplayNotificationMessage(
        mod.Message("welcome_message"),
        eventPlayer
    );
}

export function OnPlayerEarnedKill(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathTypes,
    eventWeaponUnlock: mod.Weapons
): void {
    // Source: ui/notifications.md
    mod.DisplayNotificationMessage(
        mod.Message("kill_notification", mod.GetPlayerName(eventPlayer))
    );
}
```

## WelcomeMod.strings.json

```json
{
  "strings": [
    {
      "key": "welcome_message",
      "text": "Welcome to the game!"
    },
    {
      "key": "kill_notification",
      "text": "{0} earned a kill!"
    }
  ]
}
```

## Godot Requirements

| Object | Type | ObjId | Purpose |
|--------|------|-------|---------|
| (none) | - | - | No spatial objects required |

## Verification Summary

- **Functions verified**: 4
- **Patterns used**: ui/notifications.md, core/game-lifecycle.md
- **Custom implementations**: 0

## Functions Used

| Function | Verified | Source |
|----------|----------|--------|
| mod.DisplayNotificationMessage | Yes | ui/notifications.md |
| mod.Message | Yes | ui/notifications.md |
| mod.GetPlayerName | Yes | SDK |
````

---

## When to Use

- **After Research** - Once patterns are identified
- **New mod creation** - Build from scratch
- **Feature additions** - Extend existing mods
- **Pattern assembly** - Combine multiple patterns

---

## Prerequisites

Before using `/portal:build`:

1. **Know which patterns to use** - Run research first if needed
2. **Have clear requirements** - The more specific, the better
3. **Understand Godot setup** - Builder outputs requirements but doesn't create .tscn

---

## Integration Notes

- Builder **verifies all functions** against SDK before using them
- Builder **does NOT** run validation - use `/portal:validate` after
- Main context controls the workflow:
  1. Research patterns (optional)
  2. `/portal:build` with requirements
  3. `/portal:validate` the output
  4. Fix issues if needed

---

## Quality Guarantees

The Builder agent ensures:

- All `mod.*` functions verified against SDK
- Event hook signatures match exactly
- GC/GD structure follows patterns
- Source citations on all borrowed code
- Strings file matches Message() calls
- Godot requirements documented

---

## Limitations

- **Cannot validate output** - Use `/portal:validate` separately
- **Requires pattern paths** - Won't search for patterns
- **No runtime testing** - Code is structurally correct but untested
- **Godot setup manual** - Outputs requirements, doesn't create scenes
