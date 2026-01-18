# Planning Process

> **When**: After discovery, before building complex mods
> **Purpose**: Map requirements to patterns and create a build plan
> **Output**: Approved plan ready for building phase

---

## When to Plan

**Use planning for**:
- Mods with 5+ features
- Custom game modes (not standard TDM/Conquest)
- Features requiring multiple patterns to combine
- When unsure which patterns apply

**Skip planning for**:
- Simple mods (< 5 features)
- Standard game modes with minor tweaks
- When all patterns are obvious

---

## Planning Steps

### Step 1: Research Patterns

Use `/portal:research` with the mod concept:

```
/portal:research

Concept: [from discovery]
Features: [feature list]
Constraints: [any limitations]
```

The researcher returns:
- Recommended patterns (1-5)
- Key code snippets
- Implementation order
- Feature gaps

### Step 2: Evaluate Pattern Coverage

Create a coverage matrix:

| Feature | Pattern(s) | Coverage | Notes |
|---------|------------|----------|-------|
| Spawning | player/spawning.md | Full | - |
| Economy | gameplay/economy.md | Full | - |
| Custom ability | None | Gap | Needs experimental |

### Step 3: Estimate Complexity

| Complexity | Lines | Patterns | Notes |
|------------|-------|----------|-------|
| Simple | < 500 | 1-3 | Single build call |
| Medium | 500-1500 | 3-6 | May need chunked build |
| Complex | > 1500 | 6+ | Definitely chunked |

### Step 4: Plan Build Order

Determine what to build first:

1. **Core structure** - GC/GD classes, initialization
2. **Event hooks** - Which events needed
3. **Primary mechanics** - Main gameplay loop
4. **Secondary features** - Economy, UI, audio
5. **Polish** - Edge cases, cleanup

### Step 5: Identify Dependencies

```
Feature A ─────────────────► Feature B
(must build first)           (depends on A)

Example:
Player spawning ──► Equipment loadout ──► Economy (buying equipment)
```

---

## Plan Document Format

Create this before building:

```markdown
## [ModName] Build Plan

### Summary
[1-2 sentences]

### Complexity
[Simple/Medium/Complex] - Estimated ~[N] lines

### Patterns to Use
1. `patterns/core/event-hooks.md` - [what for]
2. `patterns/core/state-management.md` - [what for]
3. [etc.]

### Build Order
1. **Phase 1: Core Structure**
   - GC class with settings
   - GD class with state
   - Basic event hooks

2. **Phase 2: [Feature Group]**
   - Feature A
   - Feature B

3. **Phase 3: [Feature Group]**
   - Feature C
   - Feature D

### Feature Gaps
- [Feature X] - Not covered by patterns, needs: [approach]

### Strings Required
- `HUD_SCORE` - Score display
- `MSG_WIN` - Victory message
- [etc.]

### Godot Requirements
- [N] spawn points
- [N] capture points
- [etc.]

### Open Questions
- [Any decisions needed before building]
```

---

## User Approval Checkpoint

Before proceeding to build:

1. Share the plan with user
2. Confirm feature priorities
3. Resolve open questions
4. Get explicit approval

**Never start building without plan approval for complex mods.**

---

## Planning Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Skip planning for complex mods | Take time to plan |
| Load all pattern files | Use /portal:research |
| Start building before approval | Get user sign-off |
| Ignore feature gaps | Document and discuss |
| Plan in too much detail | Keep high-level until building |

---

## Example Plan

```markdown
## BombDefusal Build Plan

### Summary
CS-style bomb defusal with buy phase, economy, and round system.

### Complexity
Medium - Estimated ~800 lines

### Patterns to Use
1. `patterns/core/event-hooks.md` - OnPlayerDied, OnRoundEnd
2. `patterns/core/state-management.md` - GC/GD/GS structure
3. `patterns/gameplay/rounds.md` - Buy phase, round transitions
4. `patterns/gameplay/economy.md` - Cash rewards, purchases
5. `patterns/gameplay/mcoms.md` - Bomb plant/defuse
6. `patterns/player/equipment.md` - Loadouts
7. `patterns/ui/widgets.md` - Timer, money display

### Build Order
1. **Phase 1: Core Structure**
   - GC with round/economy settings
   - GD with player cash, round state
   - Basic event hooks

2. **Phase 2: Round System**
   - Pre-round buy phase
   - Round timer
   - Win condition checks

3. **Phase 3: Economy**
   - Starting money
   - Kill rewards
   - Round win/loss bonuses

4. **Phase 4: Bomb Mechanics**
   - MCOM as bomb site
   - Plant/defuse events

5. **Phase 5: UI & Polish**
   - Timer display
   - Money display
   - Round win messages

### Feature Gaps
- None - all features covered by patterns

### Strings Required
- `HUD_MONEY` - "$%1"
- `HUD_TIMER` - "%1:%2%3"
- `MSG_BOMB_PLANTED` - "Bomb planted!"
- `MSG_ROUND_WIN_ATK` - "Attackers win"
- `MSG_ROUND_WIN_DEF` - "Defenders win"

### Godot Requirements
- 2 MCOM objects (bomb sites)
- HQ spawners for each team
- Combat area covering play zone
```

---

## Next Steps

After plan approval:

1. **Simple/Medium mod** → `/portal:build` with full requirements
2. **Complex mod** → Chunked builds per phase
3. **Has gaps** → `processes/experimental.md` first

See `processes/building.md` for build phase details.
