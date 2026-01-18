# Context Management Process

> **When**: Throughout all Portal SDK conversations
> **Purpose**: Keep Claude effective by staying under 40% context
> **Output**: Consistent quality without degradation

---

## The 40% Rule

Claude's capability degrades past 40% context window usage. The Portal SDK has ~125K lines of reference material that cannot all fit in one session.

**Key insight**: Context usage isn't just about lines read - it's cumulative across the conversation.

---

## Context Budget Guidelines

| Phase | Target | Maximum | Action if Exceeded |
|-------|--------|---------|-------------------|
| Session start | 5% | 10% | Normal |
| After research | 15% | 20% | Normal |
| After build | 25% | 30% | Monitor closely |
| After validation | 30% | 35% | Consider checkpoint |
| Buffer for fixes | - | 40% | Create handoff |

---

## What to Load

### Always Load (Low Cost)
- `CLAUDE.md` (~170 lines)
- `patterns/_index.md` (~200 lines)

### Load as Needed (Medium Cost)
- Specific pattern files (50-200 lines each)
- This file (`processes/context-management.md`)

### Never Load Directly (High Cost)
- `code/mod/index.d.ts` (24,540 lines) - Let validator search it
- Full example mods (1,000-81,000 lines) - Use patterns instead
- All patterns at once - Load only what's needed

---

## Using Skills to Save Context

The skills are designed to minimize context usage:

| Skill | How It Saves Context |
|-------|---------------------|
| `/portal:research` | Searches patterns, returns only relevant snippets |
| `/portal:build` | Reads patterns internally, returns only built code |
| `/portal:validate` | Searches SDK, returns only error list |

**Principle**: Skills hold domain knowledge and return ONLY results.

---

## Checkpoint Pattern

When context is getting high but work isn't done:

### Create a Checkpoint

Save current state to a file:

```markdown
## [ModName] Checkpoint - [Date/Time]

### Current State
- Phase: [Discovery/Planning/Building/Validating]
- Context estimate: [N]%

### Completed
- [x] Discovery
- [x] Pattern selection
- [ ] Build core structure (in progress)

### Current Code State
[Include current code if partially built]

### Decisions Made
1. Using GC/GD pattern for state
2. Round-based with buy phase
3. [etc.]

### Next Steps
1. Complete core structure
2. Add economy features
3. Validate

### Open Questions
- [Any unresolved items]
```

### Resume from Checkpoint

When starting new session:
1. Read the checkpoint file
2. Read `CLAUDE.md` and `patterns/_index.md`
3. Continue from "Next Steps"

---

## Handoff Pattern

When context exceeds 40% and must start new session:

### Before Ending Session

1. Create checkpoint (see above)
2. Inform user: "Context is full. I've saved a checkpoint at [location]."
3. Provide clear instructions for continuing

### Handoff Document Location

```
mods/[ModName]/
└── .planning/
    ├── requirements.md
    ├── plan.md
    └── checkpoint-[timestamp].md  # Handoff goes here
```

### Handoff Document Template

See `templates/mod-planning/checkpoint.md` for full template.

Essential contents:
- Mod name and concept
- All decisions with rationale
- Current code state
- Validation status
- Outstanding errors
- Next steps

---

## Multi-Session Strategy for Large Mods

For complex mods that won't fit in one session:

### Session 1: Discovery + Planning
- Complete discovery
- Create plan document
- Select patterns
- **Output**: `requirements.md`, `plan.md`

### Session 2: Build Core
- Read plan
- Build core structure
- Validate
- **Output**: Core code, checkpoint

### Session 3: Build Features
- Read checkpoint
- Add feature set
- Validate
- **Output**: Updated code, new checkpoint

### Session N: Polish + Delivery
- Read final checkpoint
- Add polish
- Final validation
- **Output**: Complete mod

---

## Warning Signs of Degradation

Watch for these as context grows:

| Warning Sign | Action |
|--------------|--------|
| Forgetting earlier decisions | Re-read checkpoint |
| Inventing functions | Pause, validate |
| Repeating questions | Context may be too high |
| Inconsistent code style | Time for handoff |
| Losing track of features | Create checkpoint |

---

## Context Recovery

If quality is degrading:

### Immediate Actions
1. Stop current work
2. Create checkpoint with current state
3. Validate any code produced

### Recovery Options
1. **Clear conversation history** if possible
2. **Create handoff** for new session
3. **Simplify scope** if mod is too complex

---

## Context-Efficient Practices

### Do
- Use skills instead of loading files directly
- Load patterns only when needed
- Create checkpoints proactively
- Ask targeted questions

### Don't
- Load the full SDK index
- Read example mods line-by-line
- Keep all conversation history
- Ask open-ended exploration questions

---

## Estimating Context Usage

Rough estimates:

| Content | Approximate Context |
|---------|---------------------|
| CLAUDE.md | 3-5% |
| patterns/_index.md | 2% |
| Single pattern file | 1-3% |
| /portal:research result | 3-5% |
| /portal:build result | 5-15% |
| /portal:validate result | 1-3% |
| Conversation history | Cumulative |

---

## Context-Saving Conversation Patterns

### Instead of:
"Read all the gameplay patterns and tell me what they do"

### Say:
"Which gameplay patterns are relevant for a racing mod?"

### Instead of:
"Show me the full equipment system code"

### Say:
"What functions do I need for adding weapons to players?"

---

## Emergency Context Full

If context hits 40%+ and something critical needs to happen:

1. **Validate immediately** - Don't lose unvalidated code
2. **Save everything** - Create detailed checkpoint
3. **Deliver what's done** - User has something to work with
4. **Clear instructions** - How to continue in new session

---

## Next Steps

- Normal workflow → Continue with relevant process
- Context high → Create checkpoint
- Context full → Create handoff, inform user
