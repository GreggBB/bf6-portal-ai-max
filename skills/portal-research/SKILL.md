# /portal:research

> **Version**: 1.0.0
> **Invocation**: `/portal:research`
> **Agent**: `portal-researcher`

---

## Description

Research the Portal SDK pattern library to find relevant patterns for a mod concept. Returns a focused summary with code snippets and implementation recommendations - NOT full pattern files.

---

## Usage

```
/portal:research

[Describe your mod concept]
```

Or with features/constraints:

```
/portal:research

Concept: A racing game with lap tracking and position display

Features:
- Checkpoint detection
- Lap counting
- Vehicle spawning
- Position leaderboard

Constraints:
- No weapons
- Single vehicle type only
```

---

## What Gets Returned

1. **Pattern recommendations** (1-5 patterns max)
2. **Key code snippets** (20-50 lines each)
3. **Function tables** - Relevant `mod.*` calls
4. **Implementation order** - Dependency-aware sequencing
5. **Gap analysis** - Features with no pattern coverage

**What does NOT get returned**:
- Full pattern file contents
- SDK type definitions
- More than 5 patterns

---

## Output

Returns a research summary:

```markdown
# Pattern Research: [Concept Name]

## Summary
[Brief overview of recommended approach]

## Recommended Patterns

### 1. [Pattern Name]
**Path**: `patterns/[category]/[file].md`
**Relevance**: [Why this pattern applies]

**Key Functions**:
| Function | Purpose |
|----------|---------|
| mod.FunctionName() | [description] |

**Code Snippet**:
```typescript
// Source: patterns/[category]/[file].md
[20-50 lines]
```

**Constraints**:
- [Gotchas]

---

## Implementation Order
1. [Pattern] - [reason]
2. ...

## Gaps
- [Features needing custom implementation]

## Builder Input
Pass these paths to /portal:build:
- patterns/...
- patterns/...
```

---

## Agent Spawn Configuration

```yaml
agent: portal-researcher
definition: agents/portal-researcher.md
subagent_type: portal-researcher

input:
  - Mod concept description
  - Optional: specific features
  - Optional: constraints

output:
  - Pattern summary with snippets
  - NO full pattern files
  - NO SDK definitions

context_impact: low-moderate
  - Returns ~200-500 lines
  - Only snippets, not full files
```

---

## Spawn Prompt Template

When invoked, spawn the agent with this prompt structure:

```
You are the Portal Researcher Agent. Your instructions are in:
Battlefield Portal SDK/agents/portal-researcher.md

Read your instructions, then research patterns for the following concept:

---
[USER PROVIDED CONCEPT]

Features (if specified):
[FEATURES LIST]

Constraints (if specified):
[CONSTRAINTS LIST]
---

Return ONLY the research summary as specified in your instructions.
Do NOT include full pattern files or SDK definitions.
Maximum 5 patterns, 20-50 line snippets each.
```

---

## Examples

### Example 1: Racing Mod

**Input**:
```
/portal:research

Concept: Lap-based racing where players drive through checkpoints
Features: lap counting, position tracking, finish detection
Constraints: no weapons
```

**Output**:
```markdown
# Pattern Research: Racing Mod

## Summary
A racing mod built on checkpoint detection, vehicle spawning, and input restrictions.

## Recommended Patterns

### 1. Checkpoints (`gameplay/checkpoints.md`)
**Relevance**: Core lap tracking logic with distance-based detection
...

### 2. Vehicles (`gameplay/vehicles.md`)
**Relevance**: Vehicle spawning and player seating
...

### 3. Input Control (`player/input-control.md`)
**Relevance**: Disable weapons during race
...

## Implementation Order
1. Game Lifecycle - Initialize checkpoint positions
2. Vehicles - Spawn vehicles on player deploy
3. Input Control - Disable weapons
4. Checkpoints - Core race loop

## Gaps
- Position tracking requires custom sorting logic

## Builder Input
- patterns/core/game-lifecycle.md
- patterns/gameplay/checkpoints.md
- patterns/gameplay/vehicles.md
- patterns/player/input-control.md
```

### Example 2: Economy Deathmatch

**Input**:
```
/portal:research

Concept: Team deathmatch with cash rewards and weapon purchases

Features:
- Kill rewards
- Buy menu between rounds
- Weapon upgrades

Constraints:
- No vehicles
- 5v5 only
```

**Output**:
```markdown
# Pattern Research: Economy Deathmatch

## Summary
A round-based TDM with cash tracking from economy pattern and round transitions for buy phases.

## Recommended Patterns

### 1. Economy (`gameplay/economy.md`)
...

### 2. Rounds (`gameplay/rounds.md`)
...

### 3. Equipment (`player/equipment.md`)
...

### 4. Scoring (`gameplay/scoring.md`)
...

## Implementation Order
1. State Management - Cash tracking per player
2. Scoring - Kill detection and rewards
3. Rounds - Buy phase transitions
4. Equipment - Weapon purchase logic

## Gaps
- Buy menu UI requires custom widgets implementation

## Builder Input
- patterns/core/state-management.md
- patterns/gameplay/economy.md
- patterns/gameplay/rounds.md
- patterns/gameplay/scoring.md
- patterns/player/equipment.md
```

---

## When to Use

- **Before building** - Understand which patterns fit your concept
- **Exploring options** - See what's possible with existing patterns
- **Planning complex mods** - Identify gaps before implementation
- **Learning patterns** - Get focused snippets without reading full files

---

## Workflow Integration

Typical workflow:

1. **Research** - `/portal:research` with concept
2. **Review** - Discuss patterns with user
3. **Build** - `/portal:build` with selected patterns
4. **Validate** - `/portal:validate` the output

Research helps you select the right patterns before committing to a build.

---

## Integration Notes

- Research is **optional** - You can go directly to `/portal:build` if patterns are known
- Main context decides which patterns to pass to Builder
- Research doesn't load patterns into main context - only returns summary
- Use research when concept is unclear or spans multiple features
