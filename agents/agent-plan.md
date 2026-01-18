# Portal SDK Agent Architecture - Implementation Plan

**Created**: 2026-01-18
**Status**: APPROVED
**Phase**: Planning complete
**Note**: Pattern library is actively being developed in parallel session - agents read `_index.md` at runtime

---

## Overview

Three specialized agents to keep main Claude context under 40% while building Portal mods:

| Agent | Purpose | Returns to Main Context |
|-------|---------|------------------------|
| Portal Validator | Check `mod.*` calls against SDK | Error list only |
| Portal Researcher | Find patterns for mod concept | Summary + snippets |
| Portal Builder | Assemble code from patterns | Complete `.ts` file |

---

## Files to Create

### Agent Definitions
1. `agents/portal-validator.md` - Validator agent prompt
2. `agents/portal-researcher.md` - Researcher agent prompt
3. `agents/portal-builder.md` - Builder agent prompt

### Workflow Documentation
4. `agents/WORKFLOW.md` - Session workflow process
5. `agents/templates/session-handoff.md` - Handoff template

### Skills (in SDK folder for portability)
6. `Battlefield Portal SDK/skills/portal-validate/SKILL.md` - Validation skill
7. `Battlefield Portal SDK/skills/portal-build/SKILL.md` - Build skill

> **Decision**: Skills live in `Battlefield Portal SDK/skills/` to keep them portable with the SDK project.

### Update Existing Files
8. `agents/CLAUDE.md` - Update status, add agent usage instructions

---

## Agent 1: Portal Validator

### Input
- TypeScript code to validate
- Optional filename for error reporting

### Process (Full Type Validation)
1. Extract all `mod.*` function calls with arguments using regex
2. For each function, grep SDK: `grep "export function FunctionName" code/mod/index.d.ts`
3. Parse ALL overloads for the function from SDK
4. **Match parameter count AND types** against overload signatures
5. Validate event hook signatures exactly (parameter names must match)
6. Check enum values exist (e.g., `mod.SoldierStateBool.IsAlive`)

### Output
```
VALIDATION PASSED/FAILED
- Functions checked: [count]
- Invalid functions: [list with line numbers and type mismatch details]
- Invalid event hooks: [list with signature issues]
- Invalid enums: [list]
- Type mismatches: [list of calls with wrong parameter types]
```

### Key Implementation Details
- SDK path: `code/mod/index.d.ts`
- Function pattern: `^    export function ([A-Za-z]+)\(`
- Event hooks start with `On` and use `event*` parameters
- Many functions have 2-4 overloads with different param counts
- **Type validation**: Parse SDK signatures, match against call-site types
- Common type patterns: `Player`, `Team`, `Vector`, `number`, `boolean`, `Message`

---

## Agent 2: Portal Researcher

### Input
- Mod concept description
- Optional: specific features to research
- Optional: constraints (no vehicles, etc.)

### Process
1. Read `patterns/_index.md`
2. Match concept to 1-5 relevant patterns
3. Load only selected pattern files
4. Extract key snippets (20-50 lines each)
5. Note implementation order and gaps

### Output
```markdown
# Pattern Research: [Concept]

## Recommended Patterns
1. [Pattern Name] (path)
   - Why: [reason]
   - Key Functions: [list]
   - Snippet: [code]
   - Constraints: [list]

## Implementation Order
1. [First] - because [reason]

## Gaps
- [Features with no pattern]
```

### Pattern Categories
Patterns are actively being developed in a parallel session. The researcher agent should read `patterns/_index.md` at runtime to discover current patterns rather than relying on a hardcoded list.

---

## Agent 3: Portal Builder

### Input
- Mod name
- Detailed requirements
- List of pattern paths to use
- Optional custom logic

### Process
1. Load specified pattern files
2. Verify EVERY `mod.*` function via grep before use
3. Assemble code with GC/GD structure
4. Add source citations
5. Generate .strings.json

### Output
```markdown
# Built: [Mod Name]

## ModName.ts
[complete code with citations]

## ModName.strings.json
[strings file]

## Godot Requirements
- [spatial objects needed]

## Verification
- Functions verified: [count]
- Patterns used: [list]
```

### Critical Patterns to Embed
1. **Object Equality**: `mod.GetObjId(a) === mod.GetObjId(b)`
2. **Player Validity**: `if (!mod.IsPlayerValid(player)) continue;`
3. **Async Hooks**: `OnGameModeStarted` can be async

---

## Session Workflow

### Phase 1: Session Start
Load only:
- `CLAUDE.md` (~650 lines)
- `agents/CLAUDE.md` (~100 lines)
- `patterns/_index.md` (~200 lines)

**DO NOT LOAD**: index.d.ts, full patterns, example mods

### Phase 2: Design
1. User describes mod concept
2. Spawn Research Agent
3. Receive pattern summary (~500 lines)
4. Discuss with user

### Phase 3: Build
1. Confirm pattern list
2. Spawn Build Agent with patterns
3. Receive complete code (~500-2000 lines)

### Phase 4: Validate (Separate Step)
1. Main context spawns Validation Agent (NOT called by Builder)
2. If PASSED: deliver
3. If FAILED: fix in main context OR re-build

> **Decision**: Validation is always a separate step controlled by main context for better visibility and debugging.

### Phase 5: Context Overflow
If approaching 40%:
1. Create handoff document
2. Save current state
3. User starts new session with handoff

---

## Handoff Template Structure

```markdown
# Session Handoff: [Mod Name]

## Mod Concept
[description]

## Decisions Made
1. [decision]: [rationale]

## Patterns Selected
| Pattern | Path | Status |

## Current Code State
- Files created
- Last validation status
- Errors outstanding

## Next Steps
1. [action]

## Critical Context
[must-preserve knowledge]
```

---

## Implementation Order

### Wave 1: Core Agent Files
1. `agents/portal-validator.md` - Most concrete, test first
2. `agents/WORKFLOW.md` - How to use the system

### Wave 2: Supporting Agents
3. `agents/portal-researcher.md`
4. `agents/portal-builder.md`
5. `agents/templates/session-handoff.md`

### Wave 3: Skills Integration
6. Create `/portal:validate` skill
7. Create `/portal:build` skill
8. Update `agents/CLAUDE.md` with status

### Wave 4: Testing
9. Test validator with known-good code
10. Test validator with known-bad code
11. Test full workflow on simple mod

---

## Verification Plan

### Validator Testing
1. Create test file with valid `mod.*` calls → expect PASSED
2. Create test file with invented functions → expect FAILED with specific errors
3. Test event hook signature validation

### Workflow Testing
1. Run through complete workflow on "simple racing mod"
2. Monitor context usage at each phase
3. Verify context stays under 40%

---

## Success Criteria

1. Validator correctly identifies invalid `mod.*` calls with type validation
2. Researcher returns focused pattern summary (not full files)
3. Builder produces complete, validated code
4. Full workflow keeps context under 40%
5. Handoff document enables session recovery

---

## Implementation Kickoff Prompt

Use this prompt to start the implementation session:

```
Read the following files:
1. Battlefield Portal SDK/agents/agent-plan.md (the approved plan)
2. Battlefield Portal SDK/agents/CLAUDE.md
3. Battlefield Portal SDK/CLAUDE.md

We're implementing the Portal SDK context-saving agent architecture. The plan is approved.

Start with Wave 1:
1. Create `agents/portal-validator.md` - the validator agent prompt with full type validation
2. Create `agents/WORKFLOW.md` - session workflow documentation

The validator should:
- Extract mod.* function calls from TypeScript code
- Grep code/mod/index.d.ts for function signatures
- Parse overloads and validate parameter types
- Check event hook signatures exactly
- Return ONLY an error list (no SDK content)

Reference the plan file for exact specifications.
```
