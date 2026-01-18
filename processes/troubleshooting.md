# Troubleshooting Process

> **When**: Something isn't working as expected
> **Purpose**: Diagnose and fix issues systematically
> **Output**: Working code or clear understanding of limitation

---

## Troubleshooting Decision Tree

```
Issue reported
├── Code won't compile?
│   └── Run /portal:validate → Fix validation errors
│
├── Code compiles but doesn't work?
│   └── Check PortalLog.txt → Identify runtime error
│
├── No errors but wrong behavior?
│   └── Check common issues below
│
└── Feature seems impossible?
    └── Go to processes/experimental.md
```

---

## Step 1: Validate First

Most issues are invalid function calls. Always start here:

```
/portal:validate

[paste the problematic code]
```

If validation fails, fix those errors first. See `processes/validation.md`.

---

## Step 2: Check PortalLog.txt

Portal logs output to:
```
C:\Users\{username}\AppData\Local\Temp\Battlefield 6\PortalLog.txt
```

### Adding Debug Logs

```typescript
console.log("Debug: player spawned", mod.GetObjId(player));
console.log("Debug: position", mod.XComponentOf(pos), mod.YComponentOf(pos), mod.ZComponentOf(pos));
```

### Common Log Patterns

| Log Pattern | Likely Issue |
|-------------|--------------|
| No output at all | Event hook not firing |
| "undefined" or "null" | Invalid object reference |
| Sudden stop in logs | Crash or exception |
| Repeated same line | Infinite loop |

---

## Common Issues & Solutions

### Event Hook Never Fires

**Symptoms**: Code in event handler never executes

**Check**:
1. Is the function exported? (`export function OnPlayerDied`)
2. Is the signature exact? (Check `patterns/core/event-hooks.md`)
3. Is the event name spelled correctly?

**Solution**:
```typescript
// WRONG - not exported
function OnPlayerDied(eventPlayer) { }

// WRONG - wrong signature
export function OnPlayerDied(player) { }

// RIGHT
export function OnPlayerDied(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
): void { }
```

### Team Comparison Always Fails

**Symptoms**: Team checks never match, even for correct team

**Cause**: Using `===` for object comparison

**Solution**:
```typescript
// WRONG
if (mod.GetTeam(player) === mod.GetTeam(1)) { }

// RIGHT
if (mod.GetObjId(mod.GetTeam(player)) === mod.GetObjId(mod.GetTeam(1))) { }
```

**Critical**: This applies to ALL SDK object comparisons (teams, players, objects).

### Player Operations Crash

**Symptoms**: Code works sometimes, crashes randomly

**Cause**: Player became invalid (left game, died, etc.)

**Solution**:
```typescript
// WRONG
const pos = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);

// RIGHT
if (mod.IsPlayerValid(player)) {
    const pos = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
}
```

### Message Not Showing

**Symptoms**: `mod.Message()` call doesn't display anything

**Check**:
1. Is the key in `.strings.json`?
2. Is the display function called?
3. Is the target valid?

**Solution**:
```typescript
// Ensure strings.json has the key
// { "MSG_HELLO": "Hello, %1!" }

// Ensure you call display
const msg = mod.Message("MSG_HELLO", "World");
mod.DisplayNotificationMessage(msg);  // Don't forget this!
```

### Godot Object Not Found

**Symptoms**: `mod.GetCapturePoint(0)` returns undefined

**Check**:
1. Does the object exist in Godot scene?
2. Is the index correct? (Godot objects are 0-indexed or named)
3. Is the object type correct?

**Solution**:
- Open Godot project
- Verify object exists with expected name/index
- Check object is correct type (CapturePoint vs MCOM vs SpawnPoint)

### Vehicle Won't Spawn

**Symptoms**: Vehicle spawner created but no vehicle appears

**Check**:
1. Is `ForceVehicleSpawnerSpawn` called?
2. Is vehicle type set?
3. Is there valid spawn space?

**Solution**:
```typescript
// Complete spawn sequence
const spawner = mod.SpawnObject(
    mod.RuntimeSpawn_Common.VehicleSpawner,
    position,
    rotation
);
mod.SetVehicleSpawnerVehicleType(spawner, mod.VehicleList.Quad);
mod.SetVehicleSpawnerRespawnTime(spawner, 30);
mod.ForceVehicleSpawnerSpawn(spawner);  // Don't forget this!
```

### Async Code Deadlocks

**Symptoms**: Game freezes or code stops executing

**Cause**: Blocking on async in wrong context

**Solution**:
```typescript
// WRONG - Wait outside async function
function doSomething() {
    mod.Wait(1);  // Won't work
    doNextThing();
}

// RIGHT
async function doSomething() {
    await mod.Wait(1);
    doNextThing();
}

// Or use fire-and-forget pattern
function startSomething() {
    doSomethingAsync();  // Don't await
}

async function doSomethingAsync() {
    await mod.Wait(1);
    doNextThing();
}
```

### UI Not Visible

**Symptoms**: UI widget created but not showing

**Check**:
1. Is anchor correct? (screen coordinates, not world)
2. Is size > 0?
3. Is content set?

**Solution**:
```typescript
// Ensure valid position and size
mod.AddUIText(
    "MyLabel",
    mod.CreateVector(50, 50, 0),  // X, Y, Z (Z ignored for UI)
    mod.CreateVector(200, 50, 0), // Width, Height
    mod.UIAnchor.TopLeft,
    mod.Message("HUD_TEXT")
);
```

### Area Trigger Not Firing

**Symptoms**: `OnEnterArea` never triggers

**Check**:
1. Is AreaTrigger linked to PolygonVolume in Godot?
2. Is the volume correctly defined?
3. Is player actually entering the volume?

**Solution**:
- In Godot, ensure AreaTrigger has PolygonVolume as child
- Verify volume boundaries are correct
- Test with console.log at volume center

---

## Debugging Workflow

### 1. Reproduce the Issue
- What exact steps cause the problem?
- Does it happen every time?
- Does it happen for all players?

### 2. Isolate the Cause
- Comment out code sections
- Add console.log statements
- Test smallest possible case

### 3. Identify the Fix
- Check patterns for correct approach
- Validate the fix
- Test thoroughly

### 4. Document if Novel
- If this was a new issue, note it for future reference
- If it revealed SDK limitation, consider adding to patterns

---

## When to Escalate to Experimental

If troubleshooting reveals the feature isn't supported by the SDK:

1. Document what was tried
2. Document what the limitation is
3. Go to `processes/experimental.md`
4. Explore if workaround is possible

---

## Troubleshooting Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Guess at fixes | Validate and debug systematically |
| Add random code changes | Understand the root cause |
| Assume code is correct | Validate even "working" code |
| Skip reading logs | Always check PortalLog.txt |
| Give up immediately | Follow the debugging workflow |

---

## Quick Reference: Diagnostic Commands

```typescript
// Log player info
console.log("Player:", mod.GetObjId(player), mod.IsPlayerValid(player));

// Log position
const pos = mod.GetSoldierState(player, mod.SoldierStateVector.GetPosition);
console.log("Pos:", mod.XComponentOf(pos), mod.YComponentOf(pos), mod.ZComponentOf(pos));

// Log team
console.log("Team ID:", mod.GetObjId(mod.GetTeam(player)));

// Log all players
const players = mod.AllPlayers();
const count = mod.CountOf(players);
console.log("Player count:", count);
for (let i = 0; i < count; i++) {
    const p = mod.ValueInArray(players, i);
    console.log("Player", i, ":", mod.GetObjId(p));
}
```

---

## Next Steps

After troubleshooting:

1. **Issue fixed** → Continue with mod development
2. **SDK limitation** → See `processes/experimental.md`
3. **Still stuck** → Provide logs and code for further analysis
