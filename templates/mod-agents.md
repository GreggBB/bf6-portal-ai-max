# [ModName] - Agent Instructions

> **For**: Codex, Gemini, and other AI coding agents
> **SDK Version**: 1.1.3.0

---

## Critical Rules

These rules MUST be followed for all Portal mod code:

### 1. All mod.* Functions Must Exist in SDK
Never invent functions. Every `mod.*` call must exist in the SDK types at:
- `code/mod/index.d.ts` (24,540 lines)
- `bf6-portal-mod-types` npm package

### 2. Object Comparison Uses GetObjId
SDK objects (teams, players, vehicles) cannot use `===` for comparison.

```typescript
// WRONG - will always fail
if (team1 === team2) { }

// RIGHT
if (mod.GetObjId(team1) === mod.GetObjId(team2)) { }
```

### 3. Event Parameters Start With "event"
All event hook parameters must be named with `event` prefix:

```typescript
// WRONG
export function OnPlayerDied(player, killer, deathType, weapon): void { }

// RIGHT
export function OnPlayerDied(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void { }
```

### 4. Check Player Validity
Players can become invalid (left game, died). Always check:

```typescript
if (mod.IsPlayerValid(player)) {
    // Safe to use player
}
```

### 5. No BF2042 Web Code
Battlefield 2042 was internally "Battlefield 6" - mixing code causes errors.
Only use code from this local SDK, never web-sourced examples.

---

## Mod Concept

[1-2 sentences describing this mod]

---

## Patterns to Reference

These pattern files contain verified working code:

| Pattern | Path | Use For |
|---------|------|---------|
| Event Hooks | `patterns/core/event-hooks.md` | All 50+ events |
| State Management | `patterns/core/state-management.md` | GC/GD structure |
| [add as needed] | | |

---

## Validation

Before delivering code:

1. Verify every `mod.*` call exists in SDK
2. Check event hook signatures match exactly
3. Ensure object comparisons use `GetObjId()`
4. Document all `.strings.json` keys
5. List Godot setup requirements

---

## Files to Produce

| File | Purpose |
|------|---------|
| `[ModName].ts` | Main mod code |
| `[ModName].strings.json` | String translations |

---

## String File Format

```json
{
  "HUD_SCORE": "Score: %1",
  "MSG_WIN": "Victory!",
  "MSG_ROUND_START": "Round %1 starting..."
}
```

Use `mod.Message("KEY", arg1, arg2)` to reference strings with substitutions.

---

## Common Functions

```typescript
// Vectors
mod.CreateVector(x, y, z): mod.Vector
mod.DistanceBetween(a, b): number

// Teams
mod.GetTeam(playerOrIndex): mod.Team
mod.GetObjId(object): number  // For comparisons

// Players
mod.Teleport(player, position, facingAngle): void
mod.IsPlayerValid(player): boolean

// Timing
await mod.Wait(seconds): Promise<void>  // Only in async functions

// Messages
mod.Message(key, ...args): mod.Message
mod.DisplayNotificationMessage(message, target?): void
```

---

## Debugging

Portal logs output to:
```
C:\Users\{username}\AppData\Local\Temp\Battlefield 6\PortalLog.txt
```

Use `console.log()` in mod code.
