# /portal:validate

> **Version**: 1.0.0
> **Invocation**: `/portal:validate`
> **Agent**: `portal-validator`

---

## Description

Validate TypeScript Portal mod code against the SDK. Checks all `mod.*` function calls, event hook signatures, and enum values for correctness.

---

## Usage

```
/portal:validate
```

Then provide the code to validate (paste directly or reference a file).

Or with inline code:

```
/portal:validate

```typescript
export function OnPlayerJoinGame(eventPlayer: mod.Player): void {
    mod.DisplayNotificationMessage(mod.Message("welcome"));
}
```
```

---

## What Gets Checked

1. **Function existence** - All `mod.*` calls exist in the SDK
2. **Parameter counts** - Calls match available overloads
3. **Parameter types** - Arguments match expected types
4. **Event hook signatures** - Exact match (names, types, order)
5. **Enum values** - Referenced enum values exist

---

## Output

Returns a validation report:

```
VALIDATION [PASSED/FAILED]

Summary:
- Functions checked: [count]
- Event hooks checked: [count]
- Enums checked: [count]

[If FAILED:]
Invalid Functions:
- Line [N]: mod.FakeFunc() - Function does not exist in SDK

Invalid Event Hooks:
- Line [N]: OnPlayerDied(player, killer) - Missing parameters

Invalid Enums:
- Line [N]: mod.FakeEnum.Value - Enum does not exist
```

---

## Agent Spawn Configuration

```yaml
agent: portal-validator
definition: agents/portal-validator.md
subagent_type: portal-validator

input:
  - User-provided TypeScript code
  - Optional filename for error reporting

output:
  - Validation report only
  - NO SDK content returned
  - NO fix suggestions

context_impact: minimal
  - Returns ~20-50 lines max
  - No SDK definitions in response
```

---

## Spawn Prompt Template

When invoked, spawn the agent with this prompt structure:

```
You are the Portal Validator Agent. Your instructions are in:
Battlefield Portal SDK/agents/portal-validator.md

Read your instructions, then validate the following code:

---
[USER PROVIDED CODE]
---

Optional filename: [filename if provided]

Return ONLY the validation report as specified in your instructions.
```

---

## Examples

### Example 1: Valid Code

**Input**:
```
/portal:validate

export function OnPlayerJoinGame(eventPlayer: mod.Player): void {
    mod.DisplayNotificationMessage(mod.Message("welcome"));
}
```

**Output**:
```
VALIDATION PASSED

Summary:
- Functions checked: 2
- Event hooks checked: 1
- Enums checked: 0

All mod.* calls verified against SDK.
```

### Example 2: Invalid Code

**Input**:
```
/portal:validate

export function OnPlayerJoin(player: mod.Player): void {
    mod.FakeFunction(player);
    mod.SetTeam(player, 1);
}
```

**Output**:
```
VALIDATION FAILED

Summary:
- Functions checked: 2
- Event hooks checked: 1
- Enums checked: 0

Invalid Functions:
- Line 2: mod.FakeFunction() - Function does not exist in SDK
- Line 3: mod.SetTeam(player, 1) - Type mismatch: parameter 2 expects Team, got number

Invalid Event Hooks:
- Line 1: OnPlayerJoin(player) - Event hook does not exist in SDK (did you mean OnPlayerJoinGame?)
```

---

## When to Use

- **After writing code** - Verify before testing in-game
- **After Builder output** - Double-check generated code
- **During debugging** - Check if function calls are correct
- **Learning** - Discover correct function signatures

---

## Integration Notes

- Validation is always a **separate step** from building
- Main context controls when validation runs
- Errors flow back to main context for fixing or re-building
- Does NOT auto-fix - just reports issues
