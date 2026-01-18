# Portal SDK Session Workflow

> **Version**: 2.0.0
> **Purpose**: Keep Claude context under 40% while building Portal mods
> **Last Updated**: 2026-01-18 (Aligned with process restructure)

---

## Related Process Documents

For detailed workflows, see the `processes/` folder:

| Process | When to Use |
|---------|-------------|
| `processes/discovery.md` | Gathering mod requirements |
| `processes/planning.md` | Complex mod planning |
| `processes/building.md` | Code generation workflow |
| `processes/validation.md` | Fixing validation errors |
| `processes/experimental.md` | Undocumented features |
| `processes/context-management.md` | Session handoffs |
| `processes/troubleshooting.md` | Runtime issues |

---

## The Problem

Claude's capability degrades past 40% context window usage. The Portal SDK project has:
- `code/mod/index.d.ts`: 24,540 lines
- Example mods: ~100,000 lines total
- Pattern library: ~5,000 lines

Loading all this into one session causes quality degradation and eventual failure.

---

## The Solution: Specialized Agents

Three agents hold domain knowledge and execute tasks independently:

| Agent | File | Returns |
|-------|------|---------|
| Validator | `portal-validator.md` | Error list only |
| Researcher | `portal-researcher.md` | Pattern summary + snippets |
| Builder | `portal-builder.md` | Complete `.ts` file |

**Key principle**: Agents return ONLY results, not intermediate data or full reference content.

---

## Session Phases

### Phase 1: Session Start

**Load only these files**:
```
Battlefield Portal SDK/CLAUDE.md           (~170 lines)
Battlefield Portal SDK/agents/CLAUDE.md    (~290 lines)
Battlefield Portal SDK/patterns/_index.md  (~200 lines)
```

**DO NOT LOAD**:
- `code/mod/index.d.ts` (24K lines)
- Full pattern files
- Example mod source code
- Utility library source

**Context estimate**: ~5% after initial load

---

### Phase 2: Design

1. User describes mod concept
2. Main context identifies likely patterns from `_index.md`
3. **Spawn Research Agent** with:
   - Mod concept description
   - Specific features to research
   - Any constraints (no vehicles, etc.)

4. Research Agent returns:
   - Recommended patterns (1-5)
   - Key code snippets (20-50 lines each)
   - Implementation order
   - Feature gaps

5. Discuss findings with user
6. Confirm pattern selection

**Context estimate**: ~15% after research

---

### Phase 3: Build

1. Finalize requirements with user
2. **Spawn Build Agent** with:
   - Mod name
   - Detailed requirements
   - List of pattern file paths
   - Custom logic requirements

3. Build Agent returns:
   - Complete `.ts` file with citations
   - Required `.strings.json` entries
   - Godot spatial requirements

4. Review with user

**Context estimate**: ~25% after build

---

### Phase 4: Validate

**Important**: Validation is always a separate step controlled by main context.

1. **Spawn Validation Agent** with:
   - Generated TypeScript code
   - Filename for error reporting

2. Validation Agent returns:
   - PASSED/FAILED status
   - Error list (if failed)

3. If PASSED: Deliver to user
4. If FAILED:
   - Fix errors in main context (for simple fixes)
   - OR re-spawn Build Agent (for complex fixes)

**Context estimate**: ~30% after validation

---

### Phase 5: Context Overflow

If context approaches 40%:

1. Create handoff document using `templates/session-handoff.md`
2. Include:
   - Mod concept and decisions
   - Patterns selected
   - Current code state
   - Outstanding errors
   - Next steps
3. User starts new session with handoff document

---

## Spawning Agents

### Validator Agent

```typescript
// Spawn with Task tool
{
  subagent_type: "portal-validator",
  prompt: `
    Validate this Portal mod code:

    Filename: ${filename}

    \`\`\`typescript
    ${code}
    \`\`\`

    Return ONLY the error list per your agent definition.
  `
}
```

### Research Agent

```typescript
{
  subagent_type: "portal-researcher",
  prompt: `
    Research patterns for this mod concept:

    Concept: ${concept}

    Features needed:
    ${featureList}

    Constraints:
    ${constraints}

    Return pattern summary with snippets.
  `
}
```

### Build Agent

```typescript
{
  subagent_type: "portal-builder",
  prompt: `
    Build this Portal mod:

    Name: ${modName}

    Requirements:
    ${requirements}

    Patterns to use:
    ${patternPaths}

    Custom logic:
    ${customLogic}

    Return complete .ts file and .strings.json.
  `
}
```

---

## Context Budget Guidelines

| Phase | Target | Maximum |
|-------|--------|---------|
| Initial load | 5% | 10% |
| After research | 15% | 20% |
| After build | 25% | 30% |
| After validation | 30% | 35% |
| Buffer for fixes | - | 40% |

If any phase exceeds its maximum, consider:
1. Clearing resolved conversation history
2. Creating handoff document
3. Starting fresh session

---

## What Main Context Should NOT Do

1. **Don't load index.d.ts** - Validator agent searches it
2. **Don't read full pattern files** - Researcher agent extracts snippets
3. **Don't write complete mods directly** - Builder agent handles assembly
4. **Don't guess function signatures** - Always validate

---

## What Main Context SHOULD Do

1. **Read `_index.md`** - Know what patterns exist
2. **Discuss with user** - Refine requirements
3. **Dispatch to agents** - Let them do heavy lifting
4. **Review agent output** - Quality check before delivery
5. **Fix simple errors** - Don't re-spawn for typos
6. **Track context usage** - Trigger handoff before degradation

---

## Error Handling

### Validation Errors

| Error Type | Action |
|------------|--------|
| Invented function | Search SDK, find correct function |
| Wrong parameter count | Check overloads, adjust call |
| Type mismatch | Cast or restructure call |
| Bad event hook signature | Copy exact signature from SDK |
| Invalid enum | Search SDK for correct enum/value |

### Agent Failures

| Failure | Recovery |
|---------|----------|
| Agent times out | Re-spawn with simpler prompt |
| Agent returns garbage | Check prompt clarity, re-spawn |
| Agent uses too much context | Break task into smaller pieces |

---

## Handoff Document Checklist

When creating a handoff:

- [ ] Mod name and concept
- [ ] All design decisions with rationale
- [ ] Selected patterns (paths, not content)
- [ ] Current code version (if any)
- [ ] Last validation status
- [ ] Outstanding errors to fix
- [ ] Next steps in priority order
- [ ] Any user preferences discovered

See `templates/session-handoff.md` for the full template.

---

## Quick Reference: Agent Files

| File | Purpose |
|------|---------|
| `agents/portal-validator.md` | Validator agent prompt |
| `agents/portal-researcher.md` | Researcher agent prompt |
| `agents/portal-builder.md` | Builder agent prompt |
| `agents/WORKFLOW.md` | This file |
| `agents/templates/session-handoff.md` | Handoff template |

---

## Success Criteria

A session is successful when:

1. User receives working mod code
2. All `mod.*` calls validated against SDK
3. Context never exceeded 40%
4. No invented functions in final code
5. Event hook signatures match exactly
6. Handoff created if session ended early
