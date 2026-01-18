# [ModName] - Claude Context

> **Created**: [date]
> **SDK Version**: 1.1.3.0
> **Status**: [Discovery/Planning/Building/Testing/Complete]

---

## Mod Concept

[1-2 sentences describing what this mod does]

---

## Requirements

### Game Mode
- **Type**: [TDM/Conquest/Rush/BR/Racing/Custom]
- **Teams**: [1/2/4]
- **Win Condition**: [description]
- **Round-based**: [Yes/No]

### Core Mechanics
- **Spawning**: [description]
- **Death**: [respawn/spectate/eliminate]
- **Objectives**: [list or "none"]

### Features
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

### Constraints
- [Any limitations or "none"]

---

## Patterns Used

| Pattern | Purpose |
|---------|---------|
| `patterns/core/event-hooks.md` | [what for] |
| `patterns/core/state-management.md` | [what for] |
| [add more as needed] | |

---

## Files

| File | Purpose |
|------|---------|
| `[ModName].ts` | Main mod code |
| `[ModName].strings.json` | String translations |
| `[ModName].spatial.json` | Godot level data (if custom) |

---

## Godot Requirements

- [ ] [N] SpawnPoint objects
- [ ] [N] CapturePoint objects (if applicable)
- [ ] HQ spawners for each team
- [ ] [other objects as needed]

---

## Session Notes

### Decisions Made
1. [Decision and rationale]
2. [Decision and rationale]

### Open Questions
- [Anything still unclear]

---

## For Claude

**Parent context**: Read `Battlefield Portal SDK/CLAUDE.md` for SDK rules.

**Critical reminders**:
- Use `mod.GetObjId()` for all object comparisons
- Validate all code with `/portal:validate`
- Check player validity before operations
- Event parameters must start with `event`

---

## Checkpoint History

| Date | Phase | Notes |
|------|-------|-------|
| [date] | Discovery | Initial requirements gathered |
| [date] | Planning | Patterns selected, plan approved |
| [date] | Building | [status] |
