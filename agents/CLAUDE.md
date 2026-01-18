# Portal SDK Agents - Claude Context

> **Version**: 1.3.0
> **Last Updated**: 2026-01-18
> **Status**: Complete - All agents implemented

---

## Purpose

This folder contains agent definitions and workflows designed to **minimize context window usage** when building Portal mods.

**The Problem**: Claude's capability degrades past 40% context. This project has ~125K lines of reference material that cannot all fit in one session.

**The Solution**: Specialized agents that hold domain knowledge in their prompts, execute tasks independently, and return only results to main context.

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `Battlefield Portal SDK/CLAUDE.md` | Main orchestrator (~170 lines) |
| `processes/` folder | 7 workflow documents |
| `templates/` folder | Per-mod templates |
| `dev/old-claude.md` | Original 700-line CLAUDE.md preserved |

For detailed workflows, see:
- `processes/discovery.md` - Gathering requirements
- `processes/planning.md` - Complex mod planning
- `processes/building.md` - Code generation
- `processes/validation.md` - Fixing errors
- `processes/context-management.md` - Session handoffs

---

## Current Status

| Component | Status | File |
|-----------|--------|------|
| Planning | Complete | `agent-plan.md` |
| Research | Complete | `RESEARCH.md` |
| Validator Agent | **Complete** | `portal-validator.md` |
| Builder Agent | **Complete** | `portal-builder.md` |
| Researcher Agent | **Complete** | `portal-researcher.md` |
| Session Workflow | Complete | `WORKFLOW.md` |
| Handoff Templates | Complete | `templates/session-handoff.md` |
| Validation Skill | **Complete** | `skills/portal-validate/SKILL.md` |
| Build Skill | **Complete** | `skills/portal-build/SKILL.md` |
| Research Skill | **Complete** | `skills/portal-research/SKILL.md` |

---

## Quick Start: Using the Agents

### Validate Code: `/portal:validate`

Check TypeScript code against the SDK:

```
/portal:validate

[paste your code here]
```

**Returns**: Validation report with errors (no SDK content)

**Use when**:
- After writing mod code
- After Builder generates code
- Debugging function call issues

### Research Patterns: `/portal:research`

Find relevant patterns for a mod concept:

```
/portal:research

Concept: A racing game with lap tracking
Features: checkpoint detection, position tracking
Constraints: no weapons
```

**Returns**: Pattern summary with snippets (not full files)

**Use when**:
- Planning a new mod
- Unsure which patterns apply
- Exploring SDK capabilities

### Build a Mod: `/portal:build`

Generate complete mod code from patterns:

```
/portal:build ModName

Requirements:
- Feature 1
- Feature 2

Patterns:
- pattern/path1.md
- pattern/path2.md
```

**Returns**: Complete `.ts` + `.strings.json` + Godot requirements

**Use when**:
- Creating new mods
- Assembling code from patterns
- Need verified, structured code

---

## Agent Definitions

### 1. Portal Validator (`portal-validator.md`)

**Purpose**: Validate `mod.*` calls against SDK

| Aspect | Details |
|--------|---------|
| Input | TypeScript code to check |
| Process | Extract calls, grep SDK, check types |
| Output | Error list only |
| Context Impact | Minimal (~20-50 lines) |

**Checks**:
- Function existence
- Parameter counts and types
- Event hook signatures (exact match)
- Enum values

### 2. Portal Builder (`portal-builder.md`)

**Purpose**: Assemble complete mod code from patterns

| Aspect | Details |
|--------|---------|
| Input | Mod name, requirements, pattern list |
| Process | Load patterns, verify functions, assemble |
| Output | Complete code + strings + requirements |
| Context Impact | Moderate (~500-2000 lines) |

**Guarantees**:
- All functions verified before use
- GC/GD structure follows patterns
- Source citations on all code
- Strings file matches Message() calls

### 3. Portal Researcher (`portal-researcher.md`)

**Purpose**: Find relevant patterns for a mod concept

| Aspect | Details |
|--------|---------|
| Input | Mod concept description |
| Process | Search patterns, extract snippets |
| Output | Pattern summary with code samples |
| Context Impact | Low-moderate (~200-500 lines) |

**Returns**:
- 1-5 pattern recommendations
- Key code snippets (20-50 lines each)
- Implementation order
- Gap analysis

---

## Session Workflow

```
SESSION START
├── Load: CLAUDE.md, agents/CLAUDE.md, patterns/_index.md
├── Do NOT load: full SDK, all patterns, example mods
│
DESIGN PHASE
├── Discuss concept with user
├── (Optional) Research patterns
│
BUILD PHASE
├── /portal:build with requirements → receives complete code
│
VALIDATE PHASE
├── /portal:validate → receives error list
├── Fix errors in main context OR re-build
│
IF CONTEXT > 40%
└── Create handoff document → user starts new session
```

---

## Recommended Workflow

### For New Mods

1. **Discuss** - Clarify requirements with user
2. **Identify patterns** - Check `patterns/_index.md` for relevant patterns
3. **Build** - `/portal:build ModName` with requirements and pattern list
4. **Validate** - `/portal:validate` the generated code
5. **Fix** - Address any validation errors
6. **Deliver** - Provide final code + Godot setup instructions

### For Code Review

1. **Validate** - `/portal:validate` the user's code
2. **Report** - Share validation results
3. **Fix** - Help fix specific errors (don't regenerate everything)

### For Debugging

1. **Validate first** - Often reveals the issue
2. **Check patterns** - Reference relevant pattern documentation
3. **Minimal fixes** - Don't over-engineer solutions

---

## Key Principles

1. **Agents hold domain knowledge** - Their prompts contain file paths, validation rules, pattern structures
2. **Main context stays lean** - Only results flow back, not intermediate data
3. **Handoff documents preserve state** - Critical decisions survive context limits
4. **All code from local SDK only** - Never web-sourced BF2042 examples
5. **Validation is separate** - Always a distinct step controlled by main context

---

## Files in This Folder

| File | Purpose | Status |
|------|---------|--------|
| `CLAUDE.md` | This file - session context | Current |
| `RESEARCH.md` | Background research on agents | Complete |
| `agent-plan.md` | Implementation plan | Approved |
| `WORKFLOW.md` | Detailed session workflow | Complete |
| `portal-validator.md` | Validator agent definition | **Complete** |
| `portal-builder.md` | Builder agent definition | **Complete** |
| `portal-researcher.md` | Researcher agent definition | **Complete** |
| `templates/session-handoff.md` | Handoff document template | Complete |

---

## Skills Location

Skills are in the SDK folder for portability:

```
Battlefield Portal SDK/
├── skills/
│   ├── portal-validate/
│   │   └── SKILL.md      # /portal:validate
│   ├── portal-build/
│   │   └── SKILL.md      # /portal:build
│   └── portal-research/
│       └── SKILL.md      # /portal:research
```

---

## Context Budget Guidelines

| Phase | Target | Notes |
|-------|--------|-------|
| Session start | <10% | Only load index files |
| After research | <20% | Pattern summaries only |
| After build | <35% | Generated code is the bulk |
| After validation | <40% | Validation reports are small |
| Handoff trigger | >40% | Create handoff, start new session |

---

## Completed Waves

| Wave | Status | Summary |
|------|--------|---------|
| 1 | Complete | Validator agent, WORKFLOW.md |
| 2 | Complete | Builder agent, handoff template |
| 3 | Complete | Skills integration (/portal:validate, /portal:build) |
| 4 | Complete | Testing - all tests passed |
| 5 | Complete | Researcher agent, /portal:research skill |

---

## All Agents Complete

The Portal SDK agent architecture is fully implemented:

| Skill | Agent | Purpose |
|-------|-------|---------|
| `/portal:research` | portal-researcher | Find patterns for a concept |
| `/portal:build` | portal-builder | Generate mod code from patterns |
| `/portal:validate` | portal-validator | Check code against SDK |
