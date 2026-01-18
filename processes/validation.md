# Validation Process

> **When**: After any code generation or when reviewing user code
> **Purpose**: Ensure all `mod.*` calls are valid SDK functions
> **Output**: Validated code ready for use

---

## Why Validation Matters

Claude tends to "invent" functions based on general programming knowledge. The Portal SDK has a specific API - using non-existent functions causes compilation failures when uploaded to the Portal website.

**Validation prevents**:
- Invalid function calls
- Wrong parameter counts
- Incorrect event hook signatures
- Non-existent enum values

---

## How to Validate

### Using the Skill

```
/portal:validate

[paste TypeScript code here]
```

### What It Returns

**If PASSED**:
```
## Validation Report

Status: PASSED

All mod.* calls verified against SDK.
- Functions checked: [N]
- Events checked: [N]
- Enums checked: [N]
```

**If FAILED**:
```
## Validation Report

Status: FAILED

Errors found: [N]

### Errors

1. **Line [N]**: `mod.InvalidFunction()` - Function does not exist in SDK
   - Suggestion: Did you mean `mod.ValidFunction()`?

2. **Line [N]**: `mod.SomeFunction(a, b, c)` - Wrong parameter count (expected 2, got 3)

3. **Line [N]**: `export function OnPlayerDied(player)` - Wrong event signature
   - Expected: `OnPlayerDied(eventPlayer, eventOtherPlayer, eventDeathType, eventWeaponUnlock)`
```

---

## Error Categories

### Critical (Must Fix)

| Error | Description | Impact |
|-------|-------------|--------|
| Invalid function | Function doesn't exist | Compilation failure |
| Wrong parameter count | Too many/few arguments | Compilation failure |
| Wrong event signature | Event hook won't fire | Silent failure |

### High Priority

| Error | Description | Impact |
|-------|-------------|--------|
| Type mismatch | Wrong argument type | May compile but crash |
| Invalid enum | Non-existent enum value | Compilation failure |

### Medium Priority

| Error | Description | Impact |
|-------|-------------|--------|
| Deprecated function | Old API still works | May break in future |
| Missing overload | Using wrong overload | Unexpected behavior |

---

## Fix Strategies by Error Type

### Invalid Function

**Problem**: `mod.SetPlayerSpeed(player, 2.0)` - doesn't exist

**Fix Process**:
1. Search patterns for similar functionality
2. Search SDK types for related functions
3. Find correct function or alternative approach

**Example Fix**:
```typescript
// Wrong
mod.SetPlayerSpeed(player, 2.0);

// Right - no direct speed function, use movement restriction
mod.EnableInputRestriction(player, mod.RestrictedInputs.Sprint, true);
```

### Wrong Parameter Count

**Problem**: `mod.Teleport(player, position)` - missing third parameter

**Fix Process**:
1. Check SDK types for correct signature
2. Add missing parameters

**Example Fix**:
```typescript
// Wrong
mod.Teleport(player, position);

// Right
mod.Teleport(player, position, 0); // 0 = facing angle
```

### Wrong Event Signature

**Problem**: `export function OnPlayerDied(player) { }` - incomplete

**Fix Process**:
1. Look up exact signature in `patterns/core/event-hooks.md`
2. Copy the complete signature

**Example Fix**:
```typescript
// Wrong
export function OnPlayerDied(player: mod.Player): void { }

// Right
export function OnPlayerDied(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void { }
```

### Invalid Enum

**Problem**: `mod.VehicleType.Tank` - enum doesn't exist

**Fix Process**:
1. Search SDK for correct enum
2. Use correct enum path

**Example Fix**:
```typescript
// Wrong
mod.VehicleType.Tank

// Right
mod.VehicleList.MAV
```

---

## Re-Validation Loop

After fixing errors:

1. Fix identified errors in code
2. Run `/portal:validate` again
3. Repeat until PASSED

**Tip**: Fix all errors before re-validating (don't fix one at a time).

---

## Common Validation Issues

### Object Equality

```typescript
// FAILS at runtime (not caught by validator)
if (team1 === team2) { }

// CORRECT
if (mod.GetObjId(team1) === mod.GetObjId(team2)) { }
```

**Note**: The validator checks function calls, not runtime logic. Always use `mod.GetObjId()` for comparisons.

### Player Validity

```typescript
// May crash if player left
const pos = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);

// Safer
if (mod.IsPlayerValid(player)) {
    const pos = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
}
```

### Async/Await

```typescript
// WRONG - Wait outside async function
function doSomething() {
    mod.Wait(1); // Won't work
}

// RIGHT
async function doSomething() {
    await mod.Wait(1);
}
```

---

## When to Validate

| Scenario | Validate? |
|----------|-----------|
| After `/portal:build` | Always |
| After manual code changes | Yes |
| User provides code | Yes |
| After fixing validation errors | Yes |
| Reviewing old code | Recommended |

---

## Validation Limitations

The validator catches:
- Invalid function names
- Wrong parameter counts
- Bad event signatures
- Invalid enums

The validator does NOT catch:
- Runtime logic errors
- Object equality issues (`===` vs `GetObjId`)
- Async/await mistakes in sync functions
- Semantic errors (wrong function for the job)

**For runtime issues**: See `processes/troubleshooting.md`

---

## Validation Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Skip validation | Always validate |
| Deliver without validating | Validate before delivery |
| Fix one error at a time | Fix all, then re-validate |
| Ignore "minor" errors | Fix all errors |
| Assume generated code is correct | Validate even built code |

---

## Next Steps

After validation passes:

1. **No runtime issues** → Deliver to user
2. **Runtime problems** → See `processes/troubleshooting.md`
3. **Need more features** → Continue with `processes/building.md`
