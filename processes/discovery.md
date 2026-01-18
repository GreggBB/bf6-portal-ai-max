# Discovery Process

> **When**: User says "build me a mod" or describes a new mod concept
> **Purpose**: Gather requirements before planning or building
> **Output**: Clear requirements for planning phase

---

## Quick Check

Before starting discovery, check if the user already has:
- A clear mod concept (game mode, rules, win condition)
- Feature list
- Any constraints (no vehicles, specific map, etc.)

If requirements are already clear, proceed to `processes/planning.md`.

---

## Essential Questions

Ask these before any mod work:

### 1. Game Mode Foundation

| Question | Why It Matters |
|----------|----------------|
| What type of game mode? | Determines core patterns (TDM, Conquest, Rush, BR, Racing, Custom) |
| How do players/teams win? | Defines scoring/victory logic |
| How many teams? (1, 2, 4) | Affects team setup, spawning, UI |
| Round-based or continuous? | Determines state management complexity |

### 2. Core Mechanics

| Question | Why It Matters |
|----------|----------------|
| What happens when a player spawns? | Equipment, location, restrictions |
| What happens on death? | Respawn, spectate, elimination |
| Are there objectives? | Capture points, MCOMs, custom goals |
| Any special movement/abilities? | May require experimental features |

### 3. Flow & Timing

| Question | Why It Matters |
|----------|----------------|
| Pre-round/warmup phase? | Buy phase, loadout selection |
| Time limits? | Round timers, overtime |
| How does the game end? | Victory screen, team switching |

---

## Optional Deep Dives

Ask these if the mod concept involves specific systems:

### Economy
- Starting currency?
- How earned? (kills, objectives, time)
- What can be purchased?
- Buy stations or menu?

### Vehicles
- Which vehicles?
- Spawner locations or player-called?
- Vehicle limits?
- Entry restrictions?

### AI
- AI enemies or teammates?
- AI behaviors? (patrol, defend, assault)
- Difficulty scaling?

### UI
- Custom HUD elements?
- Scoreboards?
- On-screen timers/counters?

### Audio
- Custom music?
- Sound effects for events?
- Voice-over announcements?

### Spatial/Map
- Specific map requirements?
- Custom boundaries?
- Elevated/isolated play area?

---

## Output Format

After discovery, summarize as:

```markdown
## [ModName] Requirements

### Concept
[1-2 sentences describing the mod]

### Game Mode
- Type: [TDM/Conquest/Rush/BR/Racing/Custom]
- Teams: [1/2/4]
- Win Condition: [description]
- Round-based: [Yes/No]

### Core Mechanics
- Spawning: [description]
- Death: [description]
- Objectives: [list or "none"]

### Features
- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3

### Constraints
- [Any limitations or "none"]

### Open Questions
- [Anything still unclear]
```

---

## Next Steps

After discovery:

1. **Simple mod** (< 5 features, standard patterns) → Go to `/portal:build`
2. **Complex mod** (many features, custom logic) → Go to `processes/planning.md`
3. **Unknown if possible** → Go to `/portal:research` or `processes/experimental.md`

---

## Discovery Anti-Patterns

| Don't | Do Instead |
|-------|------------|
| Assume standard rules | Ask about win condition |
| Start coding immediately | Complete discovery first |
| Load patterns during discovery | Just gather requirements |
| Overwhelm with all questions | Ask essential first, deep-dive as needed |
| Guess what user wants | Ask clarifying questions |

---

## Example Discovery Session

**User**: "I want a racing mod"

**Essential Questions**:
- How do players race? (Vehicles? On foot?)
- How are laps/checkpoints tracked?
- How many racers?
- What happens when someone finishes?
- Any powerups or combat?

**Output**:
```markdown
## RaceMod Requirements

### Concept
Vehicle racing with lap tracking and position display.

### Game Mode
- Type: Racing (Custom)
- Teams: 1 (FFA)
- Win Condition: First to 3 laps
- Round-based: No

### Core Mechanics
- Spawning: All players in vehicles at start line
- Death: Respawn at last checkpoint
- Objectives: Checkpoint gates

### Features
- [ ] Checkpoint detection
- [ ] Lap counting
- [ ] Position tracking
- [ ] Timer display

### Constraints
- Map: Battery (has roads)
- Vehicles: Quad bikes only
```
