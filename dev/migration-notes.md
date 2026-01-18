# CLAUDE.md Restructure Migration Notes

> **Date**: 2026-01-18
> **Purpose**: Document the restructure from 700-line CLAUDE.md to lean orchestrator with process folder

---

## Summary

The Battlefield Portal SDK documentation was restructured to:
1. Reduce main CLAUDE.md from ~700 lines to ~170 lines
2. Create 7 process documents for specific workflows
3. Preserve original content in `dev/old-claude.md`
4. Add multi-agent templates for Codex/Gemini compatibility

---

## Before/After Structure

### Before
```
Battlefield Portal SDK/
├── CLAUDE.md              # 708 lines - everything in one file
├── patterns/              # Pattern library
├── agents/                # Agent definitions
└── experimental/          # Experimental sandbox
```

### After
```
Battlefield Portal SDK/
├── CLAUDE.md              # ~170 lines - lean orchestrator
├── processes/             # 7 workflow documents (NEW)
│   ├── discovery.md       # Requirements gathering
│   ├── planning.md        # Pattern selection, build planning
│   ├── building.md        # Code generation workflow
│   ├── validation.md      # SDK validation process
│   ├── experimental.md    # Undocumented feature exploration
│   ├── context-management.md  # 40% rule, handoffs
│   └── troubleshooting.md # Common issues and fixes
├── dev/                   # Reference material (NEW)
│   ├── old-claude.md      # Original 708-line CLAUDE.md
│   ├── sdk-reference.md   # Deep dive content
│   └── migration-notes.md # This file
├── templates/             # Multi-agent templates (NEW)
│   ├── mod-claude.md      # Per-mod Claude context template
│   ├── mod-agents.md      # Per-mod Codex/Gemini template
│   └── mod-planning/      # Planning folder templates
│       ├── requirements.md
│       └── checkpoint.md
├── patterns/              # Pattern library (unchanged)
├── agents/                # Agent definitions (updated references)
└── experimental/          # Experimental sandbox (unchanged)
```

---

## Content Migration

| Original Section | New Location |
|-----------------|--------------|
| Critical Constraints | CLAUDE.md (kept) |
| SDK Structure | CLAUDE.md (condensed) |
| Custom Skills | CLAUDE.md (kept) |
| Workflow for Building Mods | processes/discovery.md, building.md |
| Pattern Library Status | CLAUDE.md → patterns/_index.md |
| Utility Library | CLAUDE.md (condensed) |
| Spatial Generator | CLAUDE.md (pointer only) |
| Experimental Features | processes/experimental.md |
| Context-Saving Agents | CLAUDE.md (condensed) |
| Quick Reference Functions | dev/sdk-reference.md |
| Skirmish Deep Dive | dev/sdk-reference.md |
| Validation Checklist | processes/validation.md |
| Debugging | processes/troubleshooting.md |
| Adding New Patterns | dev/sdk-reference.md |

---

## New Process Documents

### processes/discovery.md
- Essential and optional questions
- Output format for requirements
- When to skip to build vs plan

### processes/planning.md
- How to use /portal:research
- Complexity estimation
- Plan document format
- User approval checkpoint

### processes/building.md
- Single vs chunked builds
- How to invoke /portal:build
- Context considerations
- Delivery format

### processes/validation.md
- Error categories
- Fix strategies by error type
- Re-validation loop

### processes/experimental.md
- Trigger recognition
- Link to 7-phase methodology
- Isolation rules
- Integration paths

### processes/context-management.md
- The 40% rule
- What to load vs not load
- Checkpoint and handoff patterns

### processes/troubleshooting.md
- Common issues with solutions
- Debugging workflow
- Escalation to experimental

---

## Multi-Agent Compatibility

Added templates for other AI coding agents:

| Agent | Config File | Template |
|-------|-------------|----------|
| Claude | CLAUDE.md | templates/mod-claude.md |
| Codex | AGENTS.md | templates/mod-agents.md |
| Gemini | GEMINI.md (falls back to AGENTS.md) | templates/mod-agents.md |

---

## Updated Files

### agents/CLAUDE.md
- Updated references to new process structure
- Condensed workflow section (now points to processes/)

### agents/WORKFLOW.md
- Aligned with new process documents
- Updated session phases

### patterns/_index.md
- Added reference to new structure
- No content changes

---

## Decisions Made

### No /portal:discover Skill
Discovery is conversational, not execution-focused. The discovery.md process document is sufficient.

### CLAUDE.md Auto-Created for Mods
Every new mod folder gets a CLAUDE.md. AGENTS.md only on-demand when Codex/Gemini support requested.

### Original Content Preserved
Nothing was deleted - original CLAUDE.md content is in dev/old-claude.md.

---

## Verification Checklist (Completed 2026-01-18)

- [x] New CLAUDE.md ~170 lines (actual: 175 lines)
- [x] All 7 process documents created (processes/*.md)
- [x] dev/ folder with preserved original (3 files)
- [x] templates/ folder with multi-agent templates (4 files)
- [x] agents/CLAUDE.md updated (v1.3.0, related docs section added)
- [x] agents/WORKFLOW.md updated (v2.0.0, related process docs added)
- [x] patterns/_index.md updated (related docs section added)
- [x] All cross-references verified

---

## Rollback Instructions

If restructure causes issues:

1. Copy `dev/old-claude.md` to `CLAUDE.md`
2. Delete `processes/` folder
3. Delete `dev/` folder (after copying old-claude.md)
4. Delete `templates/` folder
5. Revert agents/CLAUDE.md and agents/WORKFLOW.md from git
