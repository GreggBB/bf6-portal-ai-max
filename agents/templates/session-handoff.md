# Session Handoff: [Mod Name]

> **Created**: [Date]
> **Session**: [Brief description of what was accomplished]
> **Status**: [In Progress / Blocked / Ready for Build / Ready for Validation]

---

## Mod Concept

[2-3 sentences describing what the mod does, target experience, and core gameplay loop]

**Genre/Type**: [Racing / Battle Royale / Rush / Custom / etc.]

**Target Player Count**: [min-max players]

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| [Topic] | [What was decided] | [Why this choice] |
| Example: Spawn system | HQ spawners | Rush-style sector progression |
| Example: Team count | 2 teams | Standard attack/defend |
| Example: Win condition | Ticket depletion | Familiar BF gameplay |

---

## Patterns Selected

| Pattern | Path | Status | Notes |
|---------|------|--------|-------|
| [Pattern Name] | `patterns/category/file.md` | [Researched/Implemented/Tested] | [Key functions used] |
| Example: Checkpoints | `patterns/gameplay/checkpoints.md` | Implemented | Lap tracking, distance detection |
| Example: Vehicles | `patterns/gameplay/vehicles.md` | Researched | Need ForcePlayerToSeat |

---

## Current Code State

### Files Created

| File | Location | Status | Lines |
|------|----------|--------|-------|
| [ModName].ts | `mods/[ModName]/` | [Draft/Complete/Validated] | [~count] |
| [ModName].strings.json | `mods/[ModName]/` | [Draft/Complete] | [~count] |

### Last Validation

**Status**: [PASSED / FAILED / Not Yet Run]

**Errors Outstanding** (if FAILED):
```
- Line [N]: [error description]
- Line [N]: [error description]
```

### Code Summary

[Brief description of what's implemented vs. what's planned]

- [x] GC/GD state structure
- [x] OnGameModeStarted initialization
- [x] OnPlayerJoinGame profile creation
- [ ] Main game loop
- [ ] Win condition check
- [ ] [Other pending items]

---

## Godot Scene Requirements

| Object | Type | ObjId | Status |
|--------|------|-------|--------|
| [ObjectName] | [Type] | [ID] | [Needed/Placed/Linked] |
| Example: VehicleSpawner_1 | VehicleSpawner | VS_01 | Needed |
| Example: Checkpoint_Start | PolygonVolume | CP_00 | Placed |

---

## Next Steps

Priority order for the next session:

1. **[Immediate Action]** - [Brief description]
   - Detail: [What specifically needs to happen]

2. **[Second Priority]** - [Brief description]
   - Detail: [Dependencies, approach]

3. **[Third Priority]** - [Brief description]

---

## Critical Context

**Must-preserve knowledge that doesn't fit elsewhere:**

### Technical Notes
- [Important implementation detail]
- [Workaround or special consideration]
- Example: "Using GetObjId for team comparison because direct equality fails"

### User Preferences
- [Stated preferences from conversation]
- Example: "User wants minimal UI, no custom HUD elements"
- Example: "Performance is priority over visual polish"

### Blocked Items
- [Feature that can't proceed and why]
- Example: "AI spawning blocked - need WarFactory pattern analysis first"

### Open Questions
- [Unresolved decisions for next session]
- Example: "Should respawn be instant or delayed?"

---

## Pattern Snippets to Preserve

**Key code that was extracted and should be reused:**

### [Snippet Name]
```typescript
// Source: patterns/[path]
[10-30 lines of critical code]
```

### [Another Snippet]
```typescript
// Source: patterns/[path]
[Code that took effort to find/adapt]
```

---

## Session Recovery Instructions

To continue this mod in a new session:

1. **Load these files first**:
   ```
   Battlefield Portal SDK/CLAUDE.md
   Battlefield Portal SDK/agents/CLAUDE.md
   [This handoff document]
   ```

2. **Do NOT load** (let agents handle):
   - `code/mod/index.d.ts`
   - Full pattern files
   - Example mod sources

3. **First action**: [What to do immediately]
   - Example: "Run validation on current code"
   - Example: "Spawn Research Agent for [specific feature]"

4. **Context budget estimate**: [X%] used at session end

---

## Conversation Highlights

**Key exchanges worth preserving:**

> **User said**: "[Important quote]"
> **Context**: [Why this matters]

> **Discovered**: "[Technical finding]"
> **Implication**: [How this affects the build]

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | [Date] | Initial handoff |
| [1.1] | [Date] | [What changed] |
